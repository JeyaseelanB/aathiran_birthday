"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from "@/lib/hooks";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  children: ReactNode;
  /** Extra classes for the panel (width, padding, background). */
  panelClassName?: string;
  /** Hide the built-in close button when the content provides its own. */
  hideCloseButton?: boolean;
  /**
   * Whether the panel may scroll its own content. Off for the lightbox, which
   * sizes its photo to the viewport and should never grow a scrollbar.
   */
  scrollable?: boolean;
};

/**
 * Accessible, animated dialog shell shared by the wish modal, the photo
 * lightbox and the video player.
 */
export default function Modal({
  open,
  onClose,
  label,
  children,
  panelClassName = "",
  hideCloseButton = false,
  scrollable = true,
}: ModalProps) {
  const reduceMotion = useReducedMotion();
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  useEscapeKey(open, onClose);
  useLockBodyScroll(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/80 backdrop-blur-md"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`relative z-10 w-full rounded-[2rem] ${
              scrollable
                ? "max-h-[92vh] overflow-y-auto overscroll-contain"
                : "max-h-full"
            } ${panelClassName}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-ink shadow-md transition hover:scale-110 hover:bg-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
