"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import BirthdayEntry from "./BirthdayEntry";
import { useMusic } from "./MusicProvider";

/** localStorage key remembering that this visitor has already been welcomed. */
export const ENTERED_KEY = "birthday-site-entered";

type EntryGateProps = { name: string; children: React.ReactNode };

/**
 * Decides whether a visitor sees the welcome screen before the site.
 *
 * First visit: the intro takes the whole screen, and the page underneath is
 * only mounted once they tap — so the hero animations play as a reveal rather
 * than running unseen behind the overlay.
 *
 * Every visit after: straight to the home page with the song starting on its
 * own. Browsers will not play audio out loud until they trust the site, so
 * `autoStart` falls back to muted playback and unmutes on the first tap. The
 * flag lives in localStorage, so clearing site data brings the welcome screen
 * back, which is fine.
 *
 * The check can only happen in the browser, so the first paint is a quiet
 * placeholder — reading localStorage during render would either break
 * hydration or flash the intro at people who have already seen it.
 */
export default function EntryGate({ name, children }: EntryGateProps) {
  const { play, autoStart } = useMusic();
  const reduceMotion = useReducedMotion();
  // null = still deciding, true = show the site, false = show the intro.
  const [entered, setEntered] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(ENTERED_KEY);
    } catch {
      // Private mode or blocked storage: treat it as a first visit.
    }

    if (stored === "true") {
      setEntered(true);
      // They have been here before, so start the song straight away rather
      // than making them find the player.
      autoStart();
    } else {
      setEntered(false);
      setShowIntro(true);
    }
  }, [autoStart]);

  const handleEnter = useCallback(() => {
    try {
      window.localStorage.setItem(ENTERED_KEY, "true");
    } catch {
      // Not being able to remember only means they get welcomed again.
    }
    setShowIntro(false);
    setEntered(true);
  }, []);

  // Keep the intro's own scroll locked away while it is up.
  useEffect(() => {
    if (!showIntro) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showIntro]);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <BirthdayEntry
            key="birthday-entry"
            name={name}
            onEnter={handleEnter}
            onPlayMusic={play}
          />
        )}
      </AnimatePresence>

      {entered === null ? (
        // Deliberately blank: one frame while the first-visit check runs.
        <div aria-hidden="true" className="min-h-[100svh]" />
      ) : entered ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.9, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      ) : null}
    </>
  );
}
