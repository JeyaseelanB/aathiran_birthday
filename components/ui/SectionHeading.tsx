"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
};

/** Consistent scroll-revealed heading block used by every section. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: SectionHeadingProps) {
  return (
    <motion.header
      className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {eyebrow && (
        <span className="inline-block rounded-full bg-white/70 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-ocean shadow-sm sm:text-sm">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-ink-soft sm:text-lg">{subtitle}</p>
      )}
    </motion.header>
  );
}
