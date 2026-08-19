"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MailPlus } from "lucide-react";
import { useCallback, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Wish, WishAccent } from "@/data/birthday";
import Confetti from "./Confetti";
import WishCard from "./WishCard";
import WishModal, { type NewWish } from "./WishModal";

type BirthdayWishesProps = { name: string; initialWishes: Wish[] };

const ACCENT_CYCLE: WishAccent[] = ["pink", "sky", "amber", "violet", "mint"];
const AVATAR_CYCLE = ["🎈", "🌟", "🧁", "🐣", "🎁", "🦄"];

export default function BirthdayWishes({ name, initialWishes }: BirthdayWishesProps) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [modalOpen, setModalOpen] = useState(false);
  const [burst, setBurst] = useState(0);

  const addWish = useCallback(({ name: author, message }: NewWish) => {
    setWishes((current) => {
      const index = current.length;
      const wish: Wish = {
        id: `wish-local-${index}-${author.toLowerCase().replace(/\s+/g, "-")}`,
        name: author,
        message,
        avatar: AVATAR_CYCLE[index % AVATAR_CYCLE.length],
        accent: ACCENT_CYCLE[index % ACCENT_CYCLE.length],
      };
      return [wish, ...current];
    });
    setBurst((value) => value + 1);
  }, []);

  return (
    <section id="wishes" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
      <Confetti burstKey={burst} pieces={45} seed={burst + 41} />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="From everyone who loves you"
          title={
            <>
              Birthday Wishes for <span className="text-rainbow">{name}</span> 💝
            </>
          }
          subtitle="Warm words from family and friends, collected in one happy place."
        />

        <motion.ul
          className="flex flex-wrap justify-center gap-5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <AnimatePresence initial={false}>
            {wishes.map((wish, index) => (
              <motion.li
                key={wish.id}
                layout
                className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
              >
                <WishCard wish={wish} index={index} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <div className="mt-10 text-center">
          <motion.button
            type="button"
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-mango via-candy to-grape px-7 py-4 text-base font-extrabold text-white shadow-[0_18px_40px_-16px_rgba(255,95,162,0.9)] sm:text-lg"
          >
            <MailPlus className="h-5 w-5" aria-hidden="true" />
            Add Your Wish 💌
          </motion.button>
        </div>
      </div>

      <WishModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={addWish} />
    </section>
  );
}
