"use client";

import { motion } from "framer-motion";
import { Heart, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import type { MediaMonth } from "@/data/media";
import PhotoLightbox from "./PhotoLightbox";

type PhotoGalleryProps = { months: MediaMonth[] };

/**
 * The mosaic rhythm. The grid is a fixed row height with dense packing, so a
 * tile is sized by how many cells it claims rather than by its own aspect
 * ratio — that is what keeps the edges flush while the sizes stay varied.
 *
 * Almost every shot here is portrait, so orientation alone would produce a
 * uniform two-row grid. The pattern below repeats every eight tiles instead,
 * giving each screenful a large anchor, a couple of tall frames and a few
 * small ones. It stays a plain 2-up on phones, where anything else is noise.
 */
const TILES = [
  "sm:col-span-2 sm:row-span-3",
  "sm:row-span-3",
  "sm:row-span-2",
  "sm:row-span-2",
  "sm:row-span-3",
  "sm:row-span-2",
  "sm:row-span-3",
  "sm:row-span-2",
] as const;

export default function PhotoGallery({ months }: PhotoGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // One continuous run of photos, oldest first. The lightbox walks through
  // exactly this list, in exactly this order.
  const photos = useMemo(
    () => months.flatMap((month) => month.photos),
    [months],
  );

  return (
    <section
      id="memories"
      className="relative overflow-hidden bg-white/50 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Month by month, day by day"
          title="Beautiful Memories 📸"
          subtitle={`All ${photos.length} photos of the first year, oldest to newest.`}
        />

        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-ink-soft sm:mb-14 sm:text-base">
          Tap any photo to open it full size.
        </p>

        {/*
          A dense mosaic: one fixed row height, and each tile claims a
          different number of cells. Because every tile is measured in whole
          cells, the outer edges stay flush and the gutters stay even — the
          sizes vary, the alignment does not. `grid-flow-dense` back-fills the
          holes a large tile leaves behind, so there are no gaps in the run.
        */}
        <div className="grid auto-rows-[5rem] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[6rem] sm:grid-cols-4 sm:gap-4 lg:auto-rows-[7rem]">
          {photos.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}
              whileHover={{ y: -6 }}
              className={`group relative block h-full w-full overflow-hidden rounded-[1.5rem] bg-sky-soft shadow-soft ring-1 ring-white/70 ${
                photo.span === "tall" ? "row-span-3" : "row-span-2"
              } ${TILES[index % TILES.length]}`}
              aria-label={`Open photo from ${photo.caption}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 46vw, (max-width: 1024px) 46vw, 44vw"
                quality={70}
                placeholder={photo.blurDataURL ? "blur" : "empty"}
                blurDataURL={photo.blurDataURL ?? undefined}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-candy shadow transition group-hover:scale-110">
                <Heart
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                />
              </span>

              <span className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between gap-2 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="truncate text-sm font-bold text-white drop-shadow">
                  {photo.caption}
                </span>
                <Maximize2
                  className="h-4 w-4 shrink-0 text-white"
                  aria-hidden="true"
                />
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <PhotoLightbox
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}
