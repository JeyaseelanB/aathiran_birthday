"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { Wish, WishAccent } from "@/data/birthday";

const ACCENTS: Record<WishAccent, { ring: string; chip: string; glow: string }> = {
  sky: { ring: "from-baby to-ocean", chip: "bg-sky-soft text-ocean", glow: "shadow-[0_20px_45px_-24px_#2f8fe0]" },
  pink: { ring: "from-bubble to-candy", chip: "bg-[#ffe7f2] text-candy", glow: "shadow-[0_20px_45px_-24px_#ff5fa2]" },
  amber: { ring: "from-sunny to-mango", chip: "bg-[#fff3d4] text-[#c97a12]", glow: "shadow-[0_20px_45px_-24px_#ff9f43]" },
  violet: { ring: "from-[#c7a6ff] to-grape", chip: "bg-[#f1e9ff] text-grape", glow: "shadow-[0_20px_45px_-24px_#a97bff]" },
  mint: { ring: "from-[#8bead0] to-mint", chip: "bg-[#e2fbf4] text-[#1e9c81]", glow: "shadow-[0_20px_45px_-24px_#63dcc0]" },
};

type WishCardProps = { wish: Wish; index: number };

export default function WishCard({ wish, index }: WishCardProps) {
  const reduceMotion = useReducedMotion();
  const accent = ACCENTS[wish.accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 34, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.08, ease: "easeOut" }}
      whileHover={reduceMotion ? undefined : { y: -8, rotate: index % 2 ? 0.8 : -0.8 }}
      className={`glass-card group relative flex h-full flex-col gap-4 rounded-[1.75rem] p-5 sm:p-6 ${accent.glow}`}
    >
      <Star
        aria-hidden="true"
        className="absolute right-5 top-5 h-5 w-5 text-sunny opacity-70 transition group-hover:rotate-12 group-hover:opacity-100"
        fill="currentColor"
      />

      <div className="flex items-center gap-3">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${accent.ring} text-2xl shadow-md`}
          aria-hidden="true"
        >
          {wish.avatar}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-extrabold text-ink">{wish.name}</p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${accent.chip}`}>
            {wish.role ?? "Birthday wish"}
          </span>
        </div>
      </div>

      <p className="text-[0.98rem] leading-relaxed text-ink-soft">“{wish.message}”</p>

      <div className="mt-auto flex items-center gap-2 pt-1 text-candy">
        <motion.span
          animate={reduceMotion ? undefined : { scale: [1, 1.18, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.2 }}
        >
          <Heart className="h-4 w-4" fill="currentColor" aria-hidden="true" />
        </motion.span>
        <span className="text-xs font-bold uppercase tracking-widest text-ink-soft">
          With love
        </span>
      </div>
    </motion.article>
  );
}
