"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useMusic } from "./MusicProvider";

/**
 * Floating play/pause control for the birthday song, pinned bottom-right and
 * available on every section of the site.
 *
 * It does not own an `<audio>` element — the single one lives in
 * `MusicProvider`, so this stays in sync with the entry screen and can never
 * start a second copy of the track.
 */
export default function MusicPlayer() {
  const { playing, muted, unavailable, toggle, toggleMute } = useMusic();
  const reduceMotion = useReducedMotion();

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {(playing || unavailable) && (
          <motion.p
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.9 }}
            className="glass-card max-w-[13rem] rounded-full px-4 py-2 text-xs font-bold text-ink sm:text-sm"
            role="status"
          >
            {unavailable
              ? "Add your song to /public/audio 🎵"
              : muted
                ? "🔇 Music Off"
                : "🎵 Music On"}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <AnimatePresence>
          {playing && (
            <motion.button
              type="button"
              onClick={toggleMute}
              aria-pressed={muted}
              aria-label={muted ? "Unmute birthday music" : "Mute birthday music"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="glass-card grid h-11 w-11 place-items-center rounded-full text-ink sm:h-12 sm:w-12"
            >
              {muted ? (
                <VolumeX className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => void toggle()}
          aria-pressed={playing}
          aria-label={playing ? "Pause birthday music" : "Play birthday music"}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-grape via-candy to-mango text-white shadow-[0_16px_35px_-12px_rgba(169,123,255,0.95)] sm:h-16 sm:w-16"
        >
          {playing && !muted && !reduceMotion && (
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
    </div>
  );
}
