"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import type { MonthPhoto } from "@/data/media";

type PhotoLightboxProps = {
  photos: MonthPhoto[];
  /** Index of the open photo, or `null` when the lightbox is closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const open = index !== null;

  const step = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return;
      onNavigate((index + delta + photos.length) % photos.length);
    },
    [index, onNavigate, photos.length],
  );

  // Arrow-key navigation while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, step]);

  const photo = index === null ? null : photos[index];

  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Photo viewer"
      panelClassName="max-w-5xl bg-transparent"
      scrollable={false}
    >
      {photo && (
        /*
          A column that fills the dialog: the photo takes whatever height is
          left over and is contained inside it, so it always fits the viewport
          and the panel never grows a scrollbar. `min-h-0` is what lets the
          image area shrink below its natural size inside the flex column.
        */
        <div className="flex h-[86vh] flex-col gap-3 sm:gap-4">
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex h-full w-full items-center justify-center"
              >
                {/* Intrinsic size plus `max-h-full w-auto`: the frame hugs the
                    photo at its own aspect ratio instead of letterboxing a
                    portrait shot inside a landscape box. */}
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width ?? 1200}
                  height={photo.height ?? 1600}
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  quality={82}
                  loading="eager"
                  placeholder={photo.blurDataURL ? "blur" : "empty"}
                  blurDataURL={photo.blurDataURL ?? undefined}
                  className="max-h-full w-auto max-w-full rounded-[1.75rem] object-contain shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] ring-1 ring-white/15"
                />
              </motion.div>
            </AnimatePresence>

            {/* On wide screens the arrows sit beside the photo, where they do
                not cover it. The bar below keeps them within thumb reach on
                phones. */}
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 lg:grid"
            >
              <ChevronLeft className="h-7 w-7" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 lg:grid"
            >
              <ChevronRight className="h-7 w-7" aria-hidden="true" />
            </button>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 rounded-full bg-white/90 px-3 py-2 backdrop-blur">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sky-soft text-ocean transition hover:scale-110 hover:bg-baby hover:text-white lg:hidden"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>

            <p className="min-w-0 flex-1 truncate px-2 text-center text-sm font-bold text-ink sm:text-base">
              {photo.caption}
              <span className="ml-2 text-xs font-semibold text-ink-soft">
                {(index ?? 0) + 1}/{photos.length}
              </span>
            </p>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sky-soft text-ocean transition hover:scale-110 hover:bg-baby hover:text-white lg:hidden"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
