"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { createRandom, range } from "@/lib/random";

const COLORS = ["#ff5fa2", "#ffd449", "#7cc7ff", "#a97bff", "#63dcc0", "#ff9f43"];

type ConfettiProps = {
  /**
   * Bump this number to fire a new burst. `0` renders nothing, which keeps the
   * page quiet until the visitor actually celebrates something.
   */
  burstKey?: number;
  /** Continuous gentle confetti rain (used on the final section). */
  ambient?: boolean;
  pieces?: number;
  seed?: number;
  className?: string;
};

type Piece = {
  id: number;
  x: number;
  color: string;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
  drift: number;
  round: boolean;
};

function buildPieces(count: number, seed: number): Piece[] {
  const random = createRandom(seed);
  return range(count).map((id) => ({
    id,
    x: random() * 100,
    color: COLORS[Math.floor(random() * COLORS.length)],
    size: 6 + random() * 10,
    rotate: random() * 360,
    delay: random() * 0.6,
    duration: 2.4 + random() * 2.2,
    drift: (random() - 0.5) * 220,
    round: random() > 0.65,
  }));
}

/**
 * Lightweight DOM confetti. Positions come from a seeded generator so the
 * server and client markup match, and the whole thing renders nothing when the
 * visitor prefers reduced motion.
 */
export default function Confetti({
  burstKey = 0,
  ambient = false,
  pieces = 60,
  seed = 7,
  className = "",
}: ConfettiProps) {
  const reduceMotion = useReducedMotion();
  const items = useMemo(() => buildPieces(pieces, seed), [pieces, seed]);
  const visible = ambient || burstKey > 0;

  if (reduceMotion || !visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <AnimatePresence>
        <div key={ambient ? "ambient" : burstKey} className="absolute inset-0">
          {items.map((piece) => (
            <motion.span
              key={piece.id}
              className="absolute top-0 block"
              style={{
                left: `${piece.x}%`,
                width: piece.size,
                height: piece.size * (piece.round ? 1 : 1.6),
                backgroundColor: piece.color,
                borderRadius: piece.round ? "9999px" : "3px",
              }}
              initial={{ y: "-12%", opacity: 0, rotate: piece.rotate }}
              animate={{
                y: "115vh",
                x: piece.drift,
                opacity: [0, 1, 1, 0],
                rotate: piece.rotate + 540,
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeIn",
                repeat: ambient ? Infinity : 0,
                repeatDelay: ambient ? 1.2 : 0,
              }}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
