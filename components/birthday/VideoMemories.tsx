"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import type { MediaMonth, MonthVideo } from "@/data/media";
import VideoModal from "./VideoModal";

type VideoMemoriesProps = { months: MediaMonth[] };

/**
 * The mosaic rhythm for the clips, matching the photo wall. A six-column grid
 * lets a card claim a half, a third or two thirds of a row, so the sizes vary
 * while every edge still lands on a column line. Repeats every five cards.
 */
const TILES = [
  "sm:col-span-4",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
] as const;

export default function VideoMemories({ months }: VideoMemoriesProps) {
  const [active, setActive] = useState<MonthVideo | null>(null);

  // One continuous run of clips, oldest first.
  const videos = useMemo(
    () => months.flatMap((month) => month.videos),
    [months],
  );

  return (
    <section id="videos" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Press play, smile, repeat"
          title="Special Moments 🎥"
          subtitle={`All ${videos.length} clips of the first year, in the order they happened.`}
        />

        {/*
          Six columns, and each card claims two or four of them: the sizes
          vary, but every card edge still lands on a column line and the rows
          stay flush. Cards stretch to the tallest in their row, so the run
          never looks ragged however long a title happens to be.
        */}
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-6">
          {videos.map((video, index) => (
            <motion.article
              key={video.id}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: (index % 6) * 0.07 }}
              whileHover={{ y: -8 }}
              className={`glass-card group flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] ${
                TILES[index % TILES.length]
              }`}
            >
              <button
                type="button"
                onClick={() => setActive(video)}
                className="flex h-full w-full flex-col text-left"
                aria-label={`Play video: ${video.title}`}
              >
                <span className="relative block aspect-video w-full shrink-0 overflow-hidden bg-ink/10">
                  {video.poster && (
                    <Image
                      src={video.poster}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 66vw"
                      quality={70}
                      placeholder={video.posterBlurDataURL ? "blur" : "empty"}
                      blurDataURL={video.posterBlurDataURL ?? undefined}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent"
                  />
                  <motion.span
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ocean shadow-xl"
                    whileHover={{ scale: 1.12 }}
                  >
                    <Play className="ml-1 h-7 w-7" fill="currentColor" />
                  </motion.span>
                </span>

                <span className="block flex-1 p-5">
                  <span className="block font-display text-lg font-extrabold text-ink">
                    {video.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                    {video.description}
                  </span>
                </span>
              </button>
            </motion.article>
          ))}
        </div>
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
