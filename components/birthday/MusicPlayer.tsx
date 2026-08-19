"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Music, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type MusicPlayerProps = { src: string };

/** Any of these counts as the "user interacted" signal browsers wait for. */
const GESTURES = ["pointerdown", "keydown", "touchstart"] as const;

/**
 * Floating play/pause button for the birthday song.
 *
 * The song starts as soon as the page opens. Browsers refuse to play audio
 * before the visitor has interacted with the page, so when that first attempt
 * is blocked we wait for their first tap, key press or scroll-tap and start
 * then. Pausing by hand is remembered — it will not restart itself after that.
 */
export default function MusicPlayer({ src }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const pausedByUser = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  // Start on load. Three rungs, because browsers only let the top one through
  // once the visitor already trusts the site:
  //   1. play with sound — works on a revisit, or wherever autoplay is allowed
  //   2. failing that, play muted — always permitted, so the song is already
  //      running and in sync when it becomes audible
  //   3. unmute (or start) on the very first tap, click or key press
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;

    const start = async (muted: boolean) => {
      if (cancelled || pausedByUser.current) return true;
      audio.muted = muted;
      try {
        await audio.play();
        if (!cancelled) setPlaying(true);
        return true;
      } catch (error) {
        // A blocked autoplay is expected; anything else is a real problem.
        if (!cancelled && (error as DOMException)?.name !== "NotAllowedError") {
          setUnavailable(true);
        }
        return false;
      }
    };

    const detach = () => {
      for (const event of GESTURES) window.removeEventListener(event, onGesture);
    };

    const onGesture = () => {
      detach();
      if (cancelled || pausedByUser.current) return;
      audio.muted = false;
      if (audio.paused) void start(false);
      else setPlaying(true);
    };

    void (async () => {
      const audible = await start(false);
      if (audible || cancelled) return;
      await start(true);
      if (cancelled) return;
      for (const event of GESTURES) {
        window.addEventListener(event, onGesture, { passive: true });
      }
    })();

    return () => {
      cancelled = true;
      detach();
    };
  }, [src]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      pausedByUser.current = true;
      setPlaying(false);
      return;
    }

    try {
      pausedByUser.current = false;
      audio.muted = false;
      await audio.play();
      setPlaying(true);
    } catch {
      // Usually means the file is missing — tell the visitor instead of failing silently.
      setUnavailable(true);
      setPlaying(false);
    }
  }, [playing]);

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onError={() => setUnavailable(true)}
      />

      <AnimatePresence>
        {(playing || unavailable) && (
          <motion.p
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.9 }}
            className="glass-card max-w-[13rem] rounded-full px-4 py-2 text-xs font-bold text-ink sm:text-sm"
            role="status"
          >
            {unavailable ? "Add your song to /public/audio 🎵" : "Birthday song playing 🎶"}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pause birthday music" : "Play birthday music"}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-grape via-candy to-mango text-white shadow-[0_16px_35px_-12px_rgba(169,123,255,0.95)] sm:h-16 sm:w-16"
      >
        {playing && !reduceMotion && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-candy/50"
            animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        <motion.span
          className="relative"
          animate={playing && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 6, repeat: playing ? Infinity : 0, ease: "linear" }}
        >
          {playing ? (
            <Pause className="h-6 w-6" aria-hidden="true" />
          ) : unavailable ? (
            <Music className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-6 w-6" aria-hidden="true" />
          )}
        </motion.span>
      </motion.button>
    </div>
  );
}
