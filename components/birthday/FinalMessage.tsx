"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import Confetti from "./Confetti";
import FloatingBalloons from "./FloatingBalloons";
import { Sparkles, Stars } from "./SkyDecor";

type FinalMessageProps = {
  name: string;
  message: string;
};

export default function FinalMessage({ name, message }: FinalMessageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(200deg,#a97bff_0%,#7cc7ff_45%,#ffd449_100%)]"
      />
      <Stars count={30} seed={17} />
      <Sparkles count={26} seed={23} />
      <FloatingBalloons count={8} seed={64} />
      <Confetti ambient pieces={34} seed={29} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass-card relative mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-[2.5rem] px-6 py-12 text-center sm:gap-8 sm:px-12 sm:py-14"
      >
        <motion.span
          animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-candy to-mango text-white shadow-lg"
        >
          <Heart className="h-7 w-7" fill="currentColor" aria-hidden="true" />
        </motion.span>

        {/* Two deliberate lines, so the greeting stays centred and evenly
            stacked at every width instead of wrapping wherever it lands. */}
        <h2 className="font-display text-3xl font-black leading-[1.15] text-ink sm:text-5xl">
          <span className="block">Happy Birthday,</span>
          <span className="block text-rainbow">{name}!</span>
        </h2>

        <p className="max-w-xl text-balance text-base font-medium leading-relaxed text-ink-soft sm:text-lg">
          {message}
        </p>

        {/* Equal-width cells, so the row reads as an evenly spaced strip
            however wide the individual emoji glyphs are. */}
        <div
          className="flex items-center justify-center gap-1 text-2xl leading-none sm:gap-3 sm:text-3xl"
          aria-hidden="true"
        >
          {["🎈", "🎁", "🧁", "🎊", "⭐", "🐻"].map((emoji, index) => (
            <motion.span
              key={emoji}
              animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: index * 0.18,
                ease: "easeInOut",
              }}
              className="grid w-10 place-items-center sm:w-12"
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
