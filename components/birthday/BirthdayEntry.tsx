"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Music } from "lucide-react";
import { useMemo, useState } from "react";
import { createRandom, range } from "@/lib/random";
import Confetti from "./Confetti";
import FloatingBalloons from "./FloatingBalloons";
import { Sparkles, Stars } from "./SkyDecor";

type BirthdayEntryProps = {
  name: string;
  /** Fired once the burst has played, to hand the site over to the home page. */
  onEnter: () => void;
  /** Starts the song. Called synchronously from the click so autoplay allows it. */
  onPlayMusic: () => Promise<boolean> | void;
};

/** How long the confetti burst is allowed to run before the screen leaves. */
const BURST_MS = 900;

/** Glowing particles drifting behind the card. */
function Glow({ seed = 42, count = 14 }: { seed?: number; count?: number }) {
  const reduceMotion = useReducedMotion();
  const particles = useMemo(() => {
    const random = createRandom(seed);
    return range(count).map((id) => ({
      id,
      left: random() * 100,
      top: random() * 100,
      size: 90 + random() * 160,
      delay: random() * 5,
      duration: 7 + random() * 6,
      color: ["#ff8fc2", "#7cc7ff", "#ffd449", "#a97bff", "#63dcc0"][
        Math.floor(random() * 5)
      ],
    }));
  }, [count, seed]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.25,
          }}
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 24, -18, 0], y: [0, -26, 14, 0], opacity: [0.18, 0.34, 0.18] }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Full-screen welcome shown on a visitor's very first arrival.
 *
 * Its one job is to collect a real click, because that click is what lets the
 * browser start the birthday song — every autoplay attempt without one is
 * blocked. Once tapped it fires the confetti, starts the music and dissolves.
 */
export default function BirthdayEntry({
  name,
  onEnter,
  onPlayMusic,
}: BirthdayEntryProps) {
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    // Kick the audio off inside the gesture itself — awaiting anything first
    // would put the `play()` call outside the click and get it blocked.
    void onPlayMusic();
    window.setTimeout(onEnter, reduceMotion ? 0 : BURST_MS);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the birthday celebration"
      className="fixed inset-0 z-[120] grid place-items-center overflow-hidden px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.1 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.8, ease: "easeInOut" }}
    >
      {/* Soft birthday gradient behind everything */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 40rem at 15% 0%, #ffe1f0 0%, transparent 62%)," +
            "radial-gradient(50rem 38rem at 90% 8%, #fff3cf 0%, transparent 58%)," +
            "radial-gradient(55rem 40rem at 50% 110%, #e5e0ff 0%, transparent 62%)," +
            "linear-gradient(180deg, #eef8ff 0%, #ffffff 48%, #fdf1ff 100%)",
        }}
        animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <Glow />
      <Stars count={22} seed={5} />
      <Sparkles count={16} seed={9} />
      <FloatingBalloons count={7} seed={31} mode="drift" />
      <Confetti ambient pieces={26} seed={13} />
      {leaving && <Confetti burstKey={1} pieces={90} seed={77} />}

      <motion.div
        className="glass-card relative z-10 w-full max-w-md rounded-[2rem] px-5 py-8 text-center sm:max-w-lg sm:px-10 sm:py-12"
        initial={{ opacity: 0, scale: 0.85, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0.2 : 0.7,
          ease: "easeOut",
          delay: reduceMotion ? 0 : 0.15,
        }}
      >
        <motion.div
          className="text-5xl sm:text-6xl"
          aria-hidden="true"
          animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🎂
        </motion.div>

        <motion.p
          className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-ink-soft sm:text-base"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.35, duration: 0.5 }}
        >
          🎉 A Special Birthday Surprise 🎉
        </motion.p>

        <motion.h1
          className="text-rainbow mt-2 text-4xl font-extrabold sm:text-5xl"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.45, duration: 0.6, ease: "easeOut" }}
        >
          {name}
        </motion.h1>

        <motion.p
          className="mx-auto mt-3 max-w-xs text-sm text-ink-soft sm:max-w-sm sm:text-base"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.5 }}
        >
          🎉 Tap to Enter the Celebration 🎉
        </motion.p>

        <motion.button
          type="button"
          onClick={enter}
          disabled={leaving}
          aria-label="Enter birthday celebration and play music"
          className="mt-7 inline-flex min-h-[3.75rem] w-full items-center justify-center gap-3 rounded-full bg-gradient-to-br from-grape via-candy to-mango px-6 py-4 text-base font-extrabold text-white shadow-[0_20px_45px_-14px_rgba(169,123,255,0.95)] sm:w-auto sm:px-10 sm:text-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            reduceMotion || leaving
              ? { opacity: 1, scale: 1 }
              : { opacity: 1, scale: [1, 1.045, 1] }
          }
          transition={
            reduceMotion || leaving
              ? { duration: 0.2 }
              : {
                  opacity: { delay: 0.65, duration: 0.4 },
                  scale: {
                    delay: 0.65,
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
          }
          whileHover={reduceMotion ? undefined : { scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
        >
          <span aria-hidden="true">🎵</span>
          <Music className="h-5 w-5" aria-hidden="true" />
          <span>Enter &amp; Play Music</span>
          <span aria-hidden="true">🎵</span>
        </motion.button>

        <p className="mt-4 text-xs text-ink-soft">
          The birthday song starts when you tap 🎶
        </p>
      </motion.div>
    </motion.div>
  );
}
