"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { createRandom, range } from "@/lib/random";
import Confetti from "./Confetti";

type SurpriseGiftProps = { message: string };

/* ------------------------------------------------------------------ *
 * Timing
 *
 * One shared timeline so the lid, the glow, the photos and the confetti
 * stay in step. Everything below is seconds from the click.
 * ------------------------------------------------------------------ */
const T = {
  shake: 0.1,
  lid: 0.3,
  glow: 0.5,
  photoOne: 0.6,
  photoTwo: 0.8,
  confetti: 1,
  caption: 1.5,
} as const;

/** How long the box-origin confetti stays mounted, in ms. */
const CONFETTI_LIFETIME = 3600;

/* ------------------------------------------------------------------ *
 * Springs — a different feel for each moving part.
 * ------------------------------------------------------------------ */
/**
 * Springs only ever run between two keyframes — Framer Motion rejects longer
 * arrays on a spring. So the multi-step arcs below use an expo-out curve
 * (which already overshoots and settles), and the springs are reserved for
 * the single-step moves: the lid popping and each photo landing.
 */
const LID_SPRING: Transition = { type: "spring", stiffness: 260, damping: 11, delay: T.lid };
const LANDING_SPRING: Transition = { type: "spring", stiffness: 300, damping: 18 };
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const LAUNCH_ARC: Transition = { duration: 1.15, ease: EXPO_OUT, times: [0, 0.35, 0.7, 1] };
const BOX_SHAKE: Transition = { duration: 0.5, delay: T.shake, ease: "easeInOut" };

/* ------------------------------------------------------------------ *
 * The two memories hiding in the box.
 *
 * `burst` is where the photo lands, expressed as a fraction of the burst
 * spread so the same numbers work at every breakpoint (see BURST_SPREAD).
 * ------------------------------------------------------------------ */
const PHOTOS = [
  {
    src: "/images/IMG-20260819-123149.jpeg",
    alt: "Aathiran all dressed up for his birthday celebration",
    burstX: -1,
    burstY: -1,
    fromRotate: -20,
    toRotate: -5,
    delay: T.photoOne,
  },
  {
    src: "/images/IMG-20260819-123157.jpeg",
    alt: "Aathiran smiling on his birthday",
    burstX: 1,
    burstY: -0.92,
    fromRotate: 20,
    toRotate: 5,
    delay: T.photoTwo,
  },
] as const;

/**
 * How far the photos travel from the middle of the box, per breakpoint.
 * Read once on mount and on resize, so a phone never throws a photo off
 * the side of the screen and a desktop still gets a wide, generous arc.
 */
function useBurstSpread() {
  const [spread, setSpread] = useState({ x: 96, y: 150, card: 116 });

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      if (w >= 1440) setSpread({ x: 240, y: 250, card: 208 });
      else if (w >= 1024) setSpread({ x: 210, y: 235, card: 190 });
      else if (w >= 768) setSpread({ x: 170, y: 210, card: 164 });
      else if (w >= 480) setSpread({ x: 118, y: 178, card: 132 });
      else setSpread({ x: 88, y: 158, card: 108 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return spread;
}

/* ================================================================== *
 * GiftLid
 * ================================================================== */
function GiftLid({ opened, reduceMotion }: { opened: boolean; reduceMotion: boolean }) {
  return (
    <motion.div
      animate={
        opened
          ? reduceMotion
            ? { y: -40, rotate: -10 }
            : /* Two keyframes only — the spring's own overshoot is the bounce. */
              { y: -96, rotate: -22 }
          : { y: 0, rotate: 0 }
      }
      transition={opened && !reduceMotion ? LID_SPRING : { duration: 0.3 }}
      className="absolute inset-x-0 top-6 z-20 mx-auto h-11 w-[108%] -translate-x-[4%] rounded-2xl bg-gradient-to-r from-candy via-[#ff7fb8] to-grape shadow-[0_10px_24px_-8px_rgba(169,123,255,0.7)] sm:h-12"
    >
      <span className="absolute left-1/2 top-1/2 h-full w-6 -translate-x-1/2 -translate-y-1/2 rounded bg-sunny/90" />
      <motion.span
        aria-hidden="true"
        animate={opened && !reduceMotion ? { rotate: [0, -14, 10, 0], scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.7, delay: T.lid }}
        className="absolute -top-7 left-1/2 -translate-x-1/2 text-4xl"
      >
        🎀
      </motion.span>
    </motion.div>
  );
}

/* ================================================================== *
 * GiftBox — the body, which shakes on click and recoils as the photos leave.
 * ================================================================== */
function GiftBox({ opened, reduceMotion }: { opened: boolean; reduceMotion: boolean }) {
  return (
    <motion.div
      animate={
        opened && !reduceMotion
          ? { scaleX: [1, 1.06, 1.14, 0.97, 1], scaleY: [1, 0.98, 0.86, 1.04, 1] }
          : { scaleX: 1, scaleY: 1 }
      }
      transition={{ duration: 0.7, delay: T.lid, ease: "easeOut" }}
      className="absolute inset-x-0 bottom-0 z-10 mx-auto h-32 origin-bottom rounded-2xl bg-gradient-to-b from-[#ff9ecb] to-candy shadow-[0_22px_38px_-18px_rgba(255,95,162,0.9)] sm:h-36"
    >
      <span className="absolute left-1/2 top-0 h-full w-6 -translate-x-1/2 bg-sunny/90" />
      {/* Dark mouth, so the photos read as coming out of something hollow. */}
      <span className="absolute inset-x-2 top-0 h-3 rounded-b-lg bg-ink/25" />
    </motion.div>
  );
}

/* ================================================================== *
 * MagicGlow — light escaping the open box, behind everything else.
 * ================================================================== */
function MagicGlow({ opened, reduceMotion }: { opened: boolean; reduceMotion: boolean }) {
  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {opened && (
        <>
          {/* Soft pool of light that lingers */}
          <motion.span
            key="glow-pool"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 0.95, 0.55], scale: [0.2, 1.7, 1.25] }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 1.1, delay: T.glow, times: [0, 0.45, 1], ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-[44%] z-0 h-32 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sunny blur-3xl"
          />
          {/* Hard shockwave ring at the moment the lid clears */}
          <motion.span
            key="glow-ring"
            aria-hidden="true"
            initial={{ opacity: 0.8, scale: 0.15 }}
            animate={{ opacity: 0, scale: 3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, delay: T.glow, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-[44%] z-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-sunny"
          />
          {/* Light rays fanning out of the mouth */}
          {range(7).map((i) => (
            <motion.span
              key={`ray-${i}`}
              aria-hidden="true"
              initial={{ opacity: 0, scaleY: 0.2 }}
              animate={{ opacity: [0, 0.8, 0], scaleY: [0.2, 1, 0.6] }}
              transition={{ duration: 0.9, delay: T.glow + i * 0.02, ease: "easeOut" }}
              style={{ rotate: `${-60 + i * 20}deg` }}
              className="pointer-events-none absolute left-1/2 top-[44%] z-0 h-28 w-1.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-sunny to-transparent"
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== *
 * GiftConfetti — a radial burst from the box, with gravity.
 *
 * Separate from the section-wide <Confetti> rain: this one starts at the
 * box, arcs outward, falls, and unmounts itself so nothing animates
 * forever.
 * ================================================================== */
const CONFETTI_COLORS = ["#ff5fa2", "#ffd449", "#7cc7ff", "#a97bff", "#63dcc0", "#ff9f43"];
const CONFETTI_SHAPES = ["circle", "star", "heart", "cake", "bar"] as const;

type Piece = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  shape: (typeof CONFETTI_SHAPES)[number];
  spin: number;
  duration: number;
  delay: number;
};

function buildBurst(count: number, seed: number): Piece[] {
  const random = createRandom(seed);
  return range(count).map((id) => {
    // Bias upward: the box throws things up, not sideways into the floor.
    const angle = -160 + random() * 140;
    return {
      id,
      angle,
      distance: 90 + random() * 190,
      size: 8 + random() * 10,
      color: CONFETTI_COLORS[Math.floor(random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(random() * CONFETTI_SHAPES.length)],
      spin: (random() > 0.5 ? 1 : -1) * (240 + random() * 400),
      duration: 1.5 + random() * 0.9,
      delay: random() * 0.22,
    };
  });
}

function GiftConfetti({ seed }: { seed: number }) {
  const pieces = useMemo(() => buildBurst(38, seed), [seed]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[44%] z-30 h-0 w-0"
    >
      {pieces.map((piece) => {
        const rad = (piece.angle * Math.PI) / 180;
        const peakX = Math.cos(rad) * piece.distance;
        const peakY = Math.sin(rad) * piece.distance;

        return (
          <motion.span
            key={piece.id}
            className="absolute block will-change-transform"
            style={
              piece.shape === "circle" || piece.shape === "bar"
                ? {
                    width: piece.size,
                    height: piece.shape === "circle" ? piece.size : piece.size * 1.7,
                    backgroundColor: piece.color,
                    borderRadius: piece.shape === "circle" ? "9999px" : "2px",
                  }
                : { fontSize: piece.size + 6, lineHeight: 1 }
            }
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.3, rotate: 0 }}
            animate={{
              // Out fast, then gravity takes it down past where it peaked.
              x: [0, peakX * 0.8, peakX, peakX * 1.12],
              y: [0, peakY, peakY * 0.72, peakY * 0.72 + 190],
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1, 1, 0.8],
              rotate: [0, piece.spin * 0.5, piece.spin * 0.85, piece.spin],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              times: [0, 0.3, 0.55, 1],
              ease: "easeOut",
            }}
          >
            {piece.shape === "star" ? "⭐" : null}
            {piece.shape === "heart" ? "💖" : null}
            {piece.shape === "cake" ? "🎂" : null}
          </motion.span>
        );
      })}
    </div>
  );
}

/* ================================================================== *
 * PhotoBurst — the two memories launching out of the box.
 * ================================================================== */
type PhotoProps = {
  photo: (typeof PHOTOS)[number];
  index: number;
  spread: { x: number; y: number; card: number };
  reduceMotion: boolean;
};

function BurstPhoto({ photo, index, spread, reduceMotion }: PhotoProps) {
  const landX = photo.burstX * spread.x;
  const landY = photo.burstY * spread.y;

  /**
   * Launch keyframes: the photo leaves the box, overshoots past its landing
   * spot and eases back into it — a real throw, not a slide. The final bounce
   * is a separate spring on the card below, since springs only take two
   * keyframes.
   */
  const variants: Variants = {
    hidden: { x: 0, y: 0, scale: 0.2, rotate: photo.fromRotate, opacity: 0 },
    shown: reduceMotion
      ? {
          x: landX,
          y: landY,
          scale: 1,
          rotate: photo.toRotate,
          opacity: 1,
          transition: { duration: 0.35, delay: 0.1 * index },
        }
      : {
          x: [0, landX * 0.55, landX * 1.14, landX],
          y: [0, landY * 1.22, landY * 0.92, landY],
          scale: [0.2, 0.72, 1.08, 1],
          rotate: [photo.fromRotate, photo.fromRotate * 0.5, photo.toRotate * 1.8, photo.toRotate],
          opacity: [0, 1, 1, 1],
          transition: { ...LAUNCH_ARC, delay: photo.delay },
        },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="shown"
      exit="hidden"
      style={{ width: spread.card }}
      className="pointer-events-auto absolute left-1/2 top-[44%] z-20 -translate-x-1/2 -translate-y-1/2"
    >
      {/* Landing: a single spring bounce as the photo touches down. */}
      <motion.div
        initial={{ scale: 0.88 }}
        animate={{ scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { ...LANDING_SPRING, delay: photo.delay + LAUNCH_ARC.duration! * 0.7 }
        }
      >
        {/* Settling wrapper: gentle float once the photo has landed. */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -7, 0], rotate: [0, index ? 1 : -1, 0] }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: T.caption + index * 0.4,
          }}
          whileHover={reduceMotion ? undefined : { scale: 1.07, rotate: 0, zIndex: 40 }}
          className="rounded-[1.1rem] bg-white p-2 pb-6 shadow-[0_26px_50px_-20px_rgba(31,58,95,0.85),0_2px_6px_rgba(31,58,95,0.18)] ring-1 ring-black/5"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[0.7rem] bg-sky-soft">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 480px) 30vw, (max-width: 1024px) 42vw, 13rem"
              quality={82}
              className="object-cover"
            />
            {/* Print sheen across the glossy surface. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent"
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== *
 * SurpriseGift
 * ================================================================== */
export default function SurpriseGift({ message }: SurpriseGiftProps) {
  const [opened, setOpened] = useState(false);
  /** Bumped on every open, so a replay remounts the confetti cleanly. */
  const [burstKey, setBurstKey] = useState(0);
  const [confettiLive, setConfettiLive] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const spread = useBurstSpread();

  // Confetti fires a beat after the lid clears, then tears itself down.
  useEffect(() => {
    if (!opened || reduceMotion) return;
    const start = window.setTimeout(() => setConfettiLive(true), T.confetti * 1000);
    const stop = window.setTimeout(
      () => setConfettiLive(false),
      T.confetti * 1000 + CONFETTI_LIFETIME,
    );
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, [opened, burstKey, reduceMotion]);

  const handleToggle = () => {
    if (opened) {
      // Second click replays: close, then re-open on the next frame.
      setOpened(false);
      setConfettiLive(false);
      window.setTimeout(() => {
        setBurstKey((key) => key + 1);
        setOpened(true);
      }, 420);
      return;
    }
    setBurstKey((key) => key + 1);
    setOpened(true);
  };

  return (
    <section
      id="surprise"
      className="relative overflow-hidden bg-white/50 px-4 py-20 sm:px-6 sm:py-24"
    >
      {/* Section-wide shower, on top of the box-origin burst. */}
      <Confetti burstKey={opened ? burstKey : 0} pieces={70} seed={99} />

      <div className="mx-auto max-w-3xl text-center">
        <SectionHeading
          eyebrow="Saved the best for last"
          title="A Special Surprise For You 🎁"
          subtitle={opened ? "Happy memories ✨" : "There is something hiding inside this box..."}
        />

        {/* Stage: tall enough that the photos never clip or push the page sideways. */}
        <div className="relative mx-auto mt-6 h-[380px] w-full max-w-[min(100%,60rem)] sm:h-[440px] lg:h-[520px]">
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Open birthday surprise"
            aria-expanded={opened}
            className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-grape/70 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
          >
            <motion.div
              // Idle bob before opening; a decisive shake and scale on click.
              animate={
                reduceMotion
                  ? undefined
                  : opened
                    ? { scale: [1, 1.12, 1.04], x: [0, -9, 8, -6, 4, 0], rotate: [0, -4, 4, -2, 0] }
                    : { y: [0, -9, 0], rotate: [-2.5, 2.5, -2.5] }
              }
              transition={
                opened
                  ? BOX_SHAKE
                  : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              }
              className="relative mx-auto h-44 w-44 sm:h-52 sm:w-52"
            >
              {/* Resting glow around the closed box. */}
              <motion.span
                aria-hidden="true"
                animate={reduceMotion || opened ? { opacity: 0.45 } : { opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-2 -z-10 rounded-full bg-sunny blur-2xl"
              />

              <MagicGlow opened={opened} reduceMotion={reduceMotion} />
              <GiftBox opened={opened} reduceMotion={reduceMotion} />
              <GiftLid opened={opened} reduceMotion={reduceMotion} />

              {confettiLive && <GiftConfetti key={burstKey} seed={99 + burstKey} />}
            </motion.div>

            <motion.span
              key={opened ? "open-label" : "closed-label"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: opened ? T.caption : 0 }}
              className="mt-4 block font-display text-lg font-extrabold text-ink"
            >
              {opened ? "Beautiful Memories ❤️" : "Click the gift!"}
            </motion.span>
          </button>

          {/* Photos are anchored to the box, so they read as coming out of it. */}
          <div className="pointer-events-none absolute bottom-8 left-1/2 h-44 w-44 -translate-x-1/2 sm:h-52 sm:w-52">
            <AnimatePresence>
              {opened &&
                PHOTOS.map((photo, index) => (
                  <BurstPhoto
                    key={`${photo.src}-${burstKey}`}
                    photo={photo}
                    index={index}
                    spread={spread}
                    reduceMotion={reduceMotion}
                  />
                ))}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {opened && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.55, delay: T.caption }}
              className="mt-2"
            >
              <p className="font-display text-xl font-extrabold text-candy sm:text-2xl">
                A Special Memory Just For You ❤️
              </p>
              <p
                role="status"
                className="glass-card mx-auto mt-5 max-w-2xl text-balance rounded-[2rem] px-6 py-7 text-lg font-semibold leading-relaxed text-ink sm:text-xl"
              >
                {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
