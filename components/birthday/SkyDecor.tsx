"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { createRandom, range } from "@/lib/random";

type StarsProps = { count?: number; seed?: number; className?: string };

/** Twinkling star field. */
export function Stars({ count = 26, seed = 3, className = "" }: StarsProps) {
  const reduceMotion = useReducedMotion();
  const stars = useMemo(() => {
    const random = createRandom(seed);
    return range(count).map((id) => ({
      id,
      top: random() * 92,
      left: random() * 96,
      size: 4 + random() * 10,
      delay: random() * 3,
      duration: 2.2 + random() * 2.6,
    }));
  }, [count, seed]);

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {stars.map((star) => (
        <motion.svg
          key={star.id}
          viewBox="0 0 24 24"
          className="absolute text-sunny drop-shadow"
          style={{ top: `${star.top}%`, left: `${star.left}%`, width: star.size, height: star.size }}
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={reduceMotion ? { opacity: 0.7 } : { opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
          fill="currentColor"
        >
          <path d="M12 0l2.9 8.4L24 12l-9.1 3.6L12 24l-2.9-8.4L0 12l9.1-3.6z" />
        </motion.svg>
      ))}
    </div>
  );
}

type CloudsProps = { className?: string };

/** Soft drifting clouds for the hero backdrop. */
export function Clouds({ className = "" }: CloudsProps) {
  const reduceMotion = useReducedMotion();
  const clouds = [
    { top: "12%", scale: 1, duration: 34, delay: 0 },
    { top: "28%", scale: 0.7, duration: 46, delay: 4 },
    { top: "58%", scale: 1.25, duration: 40, delay: 9 },
    { top: "74%", scale: 0.85, duration: 52, delay: 2 },
  ];

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {clouds.map((cloud, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ top: cloud.top, scale: cloud.scale }}
          initial={{ x: "-30vw" }}
          animate={reduceMotion ? { x: "20vw" } : { x: "115vw" }}
          transition={{ duration: cloud.duration, delay: cloud.delay, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 200 90" className="h-16 w-40 text-white/80 sm:h-20 sm:w-52" fill="currentColor">
            <ellipse cx="60" cy="55" rx="45" ry="30" />
            <ellipse cx="105" cy="42" rx="38" ry="34" />
            <ellipse cx="145" cy="58" rx="35" ry="26" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

type SparklesProps = { count?: number; seed?: number; className?: string };

/** Tiny sparkle dots layered over gradients. */
export function Sparkles({ count = 18, seed = 11, className = "" }: SparklesProps) {
  const reduceMotion = useReducedMotion();
  const dots = useMemo(() => {
    const random = createRandom(seed);
    return range(count).map((id) => ({
      id,
      top: random() * 100,
      left: random() * 100,
      size: 3 + random() * 5,
      delay: random() * 2.5,
    }));
  }, [count, seed]);

  if (reduceMotion) return null;

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {dots.map((dot) => (
        <motion.span
          key={dot.id}
          className="absolute rounded-full bg-white"
          style={{ top: `${dot.top}%`, left: `${dot.left}%`, width: dot.size, height: dot.size }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 2.6, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
