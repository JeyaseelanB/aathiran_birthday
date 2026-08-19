"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Milestone } from "@/data/birthday";

type BirthdayTimelineProps = { milestones: Milestone[] };

export default function BirthdayTimeline({ milestones }: BirthdayTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 60%"],
  });
  // Smooths the progress line so it glides instead of snapping.
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <section
      id="timeline"
      className="relative overflow-hidden bg-white/50 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="From tiny toes to big adventures"
          title="Growing Up So Fast 💙"
          subtitle="Every milestone, in the order our hearts remember them."
        />

        <div ref={containerRef} className="relative">
          {/* Progress rail: left on mobile, centred on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-[1.35rem] top-0 h-full w-1 rounded-full bg-sky-soft md:left-1/2 md:-translate-x-1/2"
          >
            <motion.div
              style={{ scaleY: progress }}
              className="h-full w-full origin-top rounded-full bg-gradient-to-b from-baby via-grape to-candy"
            />
          </div>

          <ol className="space-y-8 md:space-y-12">
            {milestones.map((milestone, index) => {
              const isRight = index % 2 === 1;
              return (
                <li key={milestone.id} className="relative md:grid md:grid-cols-2 md:gap-10">
                  {/* Dot */}
                  <motion.span
                    aria-hidden="true"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="absolute left-0 top-3 grid h-11 w-11 place-items-center rounded-full bg-white text-xl shadow-md ring-4 ring-sky-soft md:left-1/2 md:-translate-x-1/2"
                  >
                    {milestone.emoji}
                  </motion.span>

                  <motion.div
                    initial={{ opacity: 0, x: 0, y: 30 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className={`ml-16 md:ml-0 ${
                      isRight ? "md:col-start-2 md:pl-10" : "md:col-start-1 md:pr-10 md:text-right"
                    }`}
                  >
                    <div className="glass-card rounded-[1.5rem] p-5 transition hover:-translate-y-1 sm:p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ocean">
                        {milestone.date}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-extrabold text-ink sm:text-2xl">
                        {milestone.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
                        {milestone.description}
                      </p>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
