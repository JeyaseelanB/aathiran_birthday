"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TimeLeft } from "@/lib/hooks";
import { useCountdown } from "@/lib/hooks";

type CountdownTimerProps = { isoDate: string };

type Unit = { key: keyof Omit<TimeLeft, "isOver">; label: string };

const UNITS: Unit[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** A single flip-style number cell. */
function TimeCell({ value, label }: { value: number; label: string }) {
  const display = pad(value);
  return (
    <div className="glass-card flex min-w-[4.25rem] flex-col items-center rounded-3xl px-3 py-3 sm:min-w-[6rem] sm:px-5 sm:py-4">
      <div className="relative h-10 overflow-hidden sm:h-14">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="block font-display text-3xl font-black tabular-nums text-ink sm:text-5xl"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-soft sm:text-xs">
        {label}
      </span>
    </div>
  );
}

/**
 * Counts down to the birthday. Renders a neutral placeholder during SSR and
 * swaps to the celebration banner once the day arrives.
 */
export default function CountdownTimer({ isoDate }: CountdownTimerProps) {
  const timeLeft = useCountdown(isoDate);

  if (!timeLeft) {
    return (
      <div
        className="glass-card mx-auto h-24 max-w-xl animate-pulse rounded-3xl sm:h-28"
        aria-hidden="true"
      />
    );
  }

  if (timeLeft.isOver) {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        role="status"
        className="glass-card mx-auto max-w-2xl rounded-[2rem] px-6 py-5 text-center font-display text-xl font-black text-ink min-[400px]:text-2xl sm:text-3xl"
      >
        Today is the Big Day! 🎂🎉
      </motion.p>
    );
  }

  return (
    <div role="timer" aria-live="off" className="text-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-ink-soft">
        Counting down to the party
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        {UNITS.map((unit) => (
          <TimeCell key={unit.key} value={timeLeft[unit.key]} label={unit.label} />
        ))}
      </div>
    </div>
  );
}
