"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import CakeArt from "./CakeArt";
import Confetti from "./Confetti";
import FloatingBalloons from "./FloatingBalloons";

type BirthdayCakeProps = { name: string };

/** Little puffs of smoke that drift up once the candles go out. */
function Smoke() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[16%] mx-auto flex w-1/2 justify-center gap-8"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-3 w-3 rounded-full bg-ink/25 blur-[2px]"
          initial={{ opacity: 0, y: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 0.7, 0],
            y: -90,
            scale: [0.6, 1.6, 2.2],
            x: i === 1 ? 0 : i === 0 ? -18 : 18,
          }}
          transition={{ duration: 2.6, delay: i * 0.18, repeat: 2 }}
        />
      ))}
    </div>
  );
}

export default function BirthdayCake({ name }: BirthdayCakeProps) {
  const [wishMade, setWishMade] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <Confetti burstKey={wishMade ? 1 : 0} pieces={70} seed={77} />
      {wishMade && <FloatingBalloons count={10} seed={55} mode="rise" />}

      <div className="relative mx-auto max-w-3xl text-center">
        <SectionHeading
          eyebrow="Close your eyes and think of something lovely"
          title="Time to Blow the Candles"
          subtitle={`Ready, ${name}? One... two... three... make it count!`}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
          className="glass-card relative mx-auto max-w-md rounded-[2.5rem] p-6 sm:p-10"
        >
          {wishMade && <Smoke />}

          <motion.div
            animate={
              reduceMotion || wishMade
                ? undefined
                : { y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <CakeArt lit={!wishMade} className="mx-auto h-56 w-full max-w-xs sm:h-72" />
          </motion.div>

          <div className="mt-6 min-h-[4.5rem]">
            <AnimatePresence mode="wait">
              {wishMade ? (
                <motion.div
                  key="made"
                  initial={{ opacity: 0, scale: 0.85, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  role="status"
                >
                  <p className="font-display text-3xl font-black text-rainbow sm:text-4xl">
                    Wish Made! ✨
                  </p>
                  <button
                    type="button"
                    onClick={() => setWishMade(false)}
                    className="mt-3 rounded-full px-4 py-2 text-sm font-bold text-ocean underline-offset-4 hover:underline"
                  >
                    Light the candles again
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="make"
                  type="button"
                  onClick={() => setWishMade(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sunny via-mango to-candy px-7 py-4 text-base font-extrabold text-white shadow-[0_18px_40px_-16px_rgba(255,159,67,0.95)] sm:text-lg"
                >
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  Make a Wish 🎂
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
