"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  CalendarHeart,
  PartyPopper,
  Sparkles as SparkleIcon,
} from "lucide-react";
import { photoByFileName } from "@/data/media";
import { useScrollTo } from "@/lib/hooks";
import CakeArt from "./CakeArt";
import Confetti from "./Confetti";
import CountdownTimer from "./CountdownTimer";
import FloatingBalloons from "./FloatingBalloons";
import { Clouds, Sparkles, Stars } from "./SkyDecor";

type BirthdayHeroProps = {
  name: string;
  age: number;
  birthday: string;
  birthdayLabel: string;
  message: string;
  /** Section the CTA scrolls to. */
  ctaTarget: string;
};

/** Photo behind the age card in the hero, as its web-sized copy. */
const HERO_CARD_PHOTO = photoByFileName("1000199827.jpg.jpeg");

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function BirthdayHero({
  name,
  age,
  birthday,
  birthdayLabel,
  message,
  ctaTarget,
}: BirthdayHeroProps) {
  const scrollTo = useScrollTo();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] flex-col justify-center gap-6 overflow-hidden px-4 pb-8 pt-20 sm:gap-8 sm:px-6 sm:pb-10 sm:pt-24"
    >
      {/* Layered decorative background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,#8fd3ff_0%,#c9e9ff_35%,#ffe6f3_70%,#fff5d6_100%)]"
      />
      <Clouds />
      <Stars count={28} seed={5} />
      <Sparkles count={22} seed={9} />
      <FloatingBalloons count={9} seed={31} mode="rise" />
      <Confetti ambient pieces={26} seed={13} className="opacity-70" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto grid w-full max-w-6xl items-center gap-8 sm:gap-10 md:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="text-center md:text-left">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-ocean shadow-md sm:text-sm"
          >
            <SparkleIcon className="h-4 w-4" aria-hidden="true" />A very special
            day
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-4 text-[2.15rem] font-black leading-[1.05] text-white drop-shadow-[0_6px_18px_rgba(47,143,224,0.45)] min-[400px]:text-[2.6rem] sm:mt-5 sm:text-5xl md:text-6xl xl:text-7xl"
          >
            Happy Birthday!
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-1 font-display text-3xl font-black text-rainbow min-[400px]:text-4xl sm:mt-2 sm:text-5xl md:text-6xl xl:text-7xl"
          >
            {name}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3 md:justify-start"
          >
            <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-ink sm:text-base">
              <CalendarHeart
                className="h-4 w-4 text-candy"
                aria-hidden="true"
              />
              {birthdayLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-candy to-mango px-4 py-2 text-sm font-bold text-white shadow-lg sm:text-base">
              Turning {age} 🎈
            </span>
          </motion.div>

          <motion.p
            variants={item}
            className="mx-auto mt-4 max-w-xl text-balance text-sm font-medium text-ink/85 sm:mt-6 sm:text-lg md:mx-0"
          >
            {message}
          </motion.p>

          <motion.div variants={item} className="mt-6 sm:mt-8">
            <motion.button
              type="button"
              onClick={() => scrollTo(ctaTarget)}
              whileHover={
                reduceMotion ? undefined : { scale: 1.06, rotate: -1 }
              }
              whileTap={{ scale: 0.96 }}
              animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ocean via-grape to-candy px-6 py-3 text-sm font-extrabold text-white shadow-[0_18px_40px_-14px_rgba(169,123,255,0.9)] sm:gap-3 sm:px-9 sm:py-4 sm:text-lg"
            >
              <PartyPopper className="h-5 w-5" aria-hidden="true" />
              Start the Celebration 🎉
            </motion.button>
          </motion.div>
        </div>

        {/* Framed photo of the birthday boy, with the age badge and a
            wobbling cake pinned to its corners. */}
        <motion.div
          variants={item}
          className="relative mx-auto w-full max-w-[11rem] min-[400px]:max-w-[13rem] md:max-w-[15rem] lg:max-w-[19rem]"
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Soft glow behind the frame so it lifts off the sky */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-candy/40 via-grape/30 to-sunny/40 blur-2xl"
            />

            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border-4 border-white/90 shadow-[0_28px_60px_-24px_rgba(47,143,224,0.75)] sm:rounded-[2.5rem] sm:border-[6px]">
              <Image
                src={HERO_CARD_PHOTO.src}
                alt={`${name} smiling, a few days before turning ${age}`}
                fill
                preload
                quality={82}
                sizes="(min-width: 640px) 24rem, 70vw"
                placeholder={HERO_CARD_PHOTO.blurDataURL ? "blur" : "empty"}
                blurDataURL={HERO_CARD_PHOTO.blurDataURL ?? undefined}
                /* Lifts an indoor shot to match the bright sky around it. */
                className="object-cover object-[50%_28%] brightness-110 saturate-125 contrast-105"
              />

              {/* A slow shine that sweeps across the photo now and then */}
              {!reduceMotion && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  animate={{ x: ["-120%", "260%"] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 4.5,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* A shallow band of shade — only as much as the caption needs */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent"
              />

              <p className="absolute inset-x-0 bottom-0 px-4 pb-4 text-center font-display text-base font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:pb-5 sm:text-xl">
                {age === 1 ? "One whole year!" : `${age} years of joy!`}
              </p>
            </div>

            {/* Age badge, tucked into the top corner of the frame */}
            <div className="absolute -right-2 -top-4 grid h-16 w-16 place-items-center sm:-right-4 sm:-top-6 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-gradient-to-br from-sunny via-mango to-candy shadow-lg"
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }
                }
                transition={{ duration: 3, repeat: Infinity }}
              />
              <span className="relative font-display text-3xl font-black text-white drop-shadow sm:text-4xl lg:text-5xl">
                {age}
              </span>
            </div>

            {/* Cake, wobbling at the opposite corner */}
            <motion.div
              animate={reduceMotion ? undefined : { rotate: [-6, 6, -6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-5 -left-3 sm:-bottom-7 sm:-left-6"
            >
              <CakeArt className="h-16 w-16 drop-shadow-lg sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative mx-auto w-full max-w-4xl"
      >
        <CountdownTimer isoDate={birthday} />
      </motion.div>
    </section>
  );
}
