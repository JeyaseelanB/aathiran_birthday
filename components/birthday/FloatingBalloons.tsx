"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { createRandom, range } from "@/lib/random";

const BALLOON_COLORS = [
  ["#ff8fc2", "#ff4f96"],
  ["#7cc7ff", "#2f8fe0"],
  ["#ffd449", "#ff9f43"],
  ["#c7a6ff", "#8a5cf6"],
  ["#8bead0", "#2fbfa0"],
];

type FloatingBalloonsProps = {
  count?: number;
  seed?: number;
  /** `drift` gently bobs in place, `rise` floats up and off the screen. */
  mode?: "drift" | "rise";
  className?: string;
};

/** Decorative balloons rendered behind the content of a section. */
export default function FloatingBalloons({
  count = 8,
  seed = 21,
  mode = "drift",
  className = "",
}: FloatingBalloonsProps) {
  const reduceMotion = useReducedMotion();

  const balloons = useMemo(() => {
    const random = createRandom(seed);
    return range(count).map((id) => {
      const [light, dark] = BALLOON_COLORS[Math.floor(random() * BALLOON_COLORS.length)];
      return {
        id,
        left: 4 + random() * 92,
        size: 46 + random() * 46,
        delay: random() * 4,
        duration: 7 + random() * 6,
        /* Rising is a long, slow climb, so it gets its own timing. */
        riseDuration: 15 + random() * 11,
        /* Starts spread from just below the fold to two-thirds up, so the sky
           is already populated on the first frame instead of filling in. */
        bottom: random() * 80 - 22,
        sway: (random() - 0.5) * 70,
        tilt: (random() - 0.5) * 16,
        light,
        dark,
      };
    });
  }, [count, seed]);

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {balloons.map((b) => (
        <motion.div
          key={b.id}
          className="absolute"
          style={{ left: `${b.left}%`, bottom: `${b.bottom}%`, width: b.size }}
          initial={
            mode === "rise"
              ? { y: 120, opacity: 0 }
              : { y: 0, opacity: 0.9 }
          }
          animate={
            reduceMotion
              ? { opacity: 0.9 }
              : mode === "rise"
                ? {
                    /* Far enough to clear the tallest viewport, whatever the
                       balloon started at, so none of them stall mid-air. */
                    y: ["0vh", "-135vh"],
                    x: [0, b.sway, -b.sway * 0.6, 0],
                    rotate: [b.tilt, -b.tilt, b.tilt],
                    opacity: [0, 1, 1, 0],
                  }
                : { y: [-10, 14, -10], rotate: [b.tilt, -b.tilt, b.tilt] }
          }
          transition={{
            duration: mode === "rise" ? b.riseDuration : b.duration,
            delay: b.delay,
            repeat: Infinity,
            repeatType: mode === "rise" ? "loop" : "mirror",
            /* A steady climb; easing would make them look like they stall. */
            ease: mode === "rise" ? "linear" : "easeInOut",
          }}
        >
          <div
            className="rounded-[50%] shadow-lg"
            style={{
              width: b.size,
              height: b.size * 1.22,
              background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${b.light} 38%, ${b.dark} 100%)`,
            }}
          />
          <div
            className="mx-auto h-0 w-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `9px solid ${b.dark}`,
            }}
          />
          <div className="mx-auto h-10 w-px bg-ink/20 sm:h-14" />
        </motion.div>
      ))}
    </div>
  );
}
