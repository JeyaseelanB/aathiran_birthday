"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type MusicContextValue = {
  /** True while the song is actually running. */
  playing: boolean;
  muted: boolean;
  /** True when the file could not be loaded or played at all. */
  unavailable: boolean;
  /** Starts the song audibly. Call it from inside a user gesture. */
  play: () => Promise<boolean>;
  /**
   * Starts the song on page load, falling back to muted playback and then to
   * the visitor's first tap when the browser refuses sound.
   */
  autoStart: () => void;
  pause: () => void;
  toggle: () => Promise<void>;
  toggleMute: () => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

/** Any of these counts as the "user interacted" signal browsers wait for. */
const GESTURES = ["pointerdown", "keydown", "touchstart"] as const;

/**
 * Owns the one and only `<audio>` element on the site.
 *
 * Everything that touches the song — the entry screen, the floating player —
 * goes through this context, so navigating between sections can never end up
 * with two copies of the track playing over each other.
 */
export function MusicProvider({
  src,
  children,
}: {
  src: string;
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  /** Once they pause by hand, nothing restarts the song behind their back. */
  const pausedByUser = useRef(false);
  const detachGestures = useRef<(() => void) | null>(null);

  // Keep the flag honest even when playback changes outside our handlers —
  // the track ending, the OS media keys, or the tab being suspended.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
    };
  }, []);

  useEffect(() => () => detachGestures.current?.(), []);

  /** One playback attempt. Resolves false when the browser said no. */
  const start = useCallback(async (nextMuted: boolean) => {
    const audio = audioRef.current;
    if (!audio) return false;
    audio.muted = nextMuted;
    setMuted(nextMuted);
    try {
      await audio.play();
      setPlaying(true);
      return true;
    } catch (error) {
      setPlaying(false);
      // A blocked autoplay is expected; anything else is a real problem.
      if ((error as DOMException)?.name !== "NotAllowedError") {
        setUnavailable(true);
      }
      return false;
    }
  }, []);

  const play = useCallback(async () => {
    pausedByUser.current = false;
    detachGestures.current?.();
    return start(false);
  }, [start]);

  /*
   * Start on load. Three rungs, because browsers only let the top one through
   * once the visitor already trusts the site:
   *   1. play with sound — works on a revisit, or wherever autoplay is allowed
   *   2. failing that, play muted — always permitted, so the song is already
   *      running and in sync the moment it becomes audible
   *   3. unmute on the very first tap, click or key press
   */
  const autoStart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || pausedByUser.current) return;
    if (!audio.paused && !audio.muted) return;

    const onGesture = () => {
      detachGestures.current?.();
      if (pausedByUser.current) return;
      void play();
    };

    detachGestures.current = () => {
      detachGestures.current = null;
      for (const event of GESTURES) window.removeEventListener(event, onGesture);
    };

    void (async () => {
      if (await start(false)) {
        detachGestures.current?.();
        return;
      }
      if (pausedByUser.current) return;
      await start(true);
      if (pausedByUser.current) return;
      for (const event of GESTURES) {
        window.addEventListener(event, onGesture, { passive: true });
      }
    })();
  }, [play, start]);

  const pause = useCallback(() => {
    pausedByUser.current = true;
    detachGestures.current?.();
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (playing) pause();
    else await play();
  }, [pause, play, playing]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Unmuting by hand is a gesture in its own right, so the fallback
    // listeners are no longer needed.
    detachGestures.current?.();
    const next = !audio.muted;
    audio.muted = next;
    setMuted(next);
  }, []);

  const value = useMemo(
    () => ({
      playing,
      muted,
      unavailable,
      play,
      autoStart,
      pause,
      toggle,
      toggleMute,
    }),
    [playing, muted, unavailable, play, autoStart, pause, toggle, toggleMute],
  );

  return (
    <MusicContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onError={() => setUnavailable(true)}
      />
      {children}
    </MusicContext.Provider>
  );
}

/** Access the shared birthday song. Throws outside `<MusicProvider>`. */
export function useMusic(): MusicContextValue {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used inside <MusicProvider>");
  }
  return context;
}
