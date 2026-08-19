"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

export type NewWish = { name: string; message: string };

type WishModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (wish: NewWish) => void;
};

const MAX_MESSAGE = 220;

export default function WishModal({ open, onClose, onSubmit }: WishModalProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Start from a clean form every time the modal opens.
  useEffect(() => {
    if (open) {
      setName("");
      setMessage("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedMessage) {
      setError("Please add both your name and a little wish.");
      return;
    }

    onSubmit({ name: trimmedName, message: trimmedMessage });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Add your birthday wish"
      panelClassName="max-w-lg bg-white p-6 shadow-2xl sm:p-8"
    >
      <div className="mb-5 text-center">
        <span className="text-4xl" aria-hidden="true">
          💌
        </span>
        <h3 className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Add Your Wish
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          Write something sweet — it appears on the wall right away.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="wish-name" className="mb-1 block text-sm font-bold text-ink">
            Your name
          </label>
          <input
            id="wish-name"
            name="name"
            type="text"
            value={name}
            maxLength={40}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Aunt Divya"
            className="w-full rounded-2xl border-2 border-sky-soft bg-sky-soft/40 px-4 py-3 text-base text-ink outline-none transition focus:border-baby focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor="wish-message" className="mb-1 block text-sm font-bold text-ink">
            Your birthday wish
          </label>
          <textarea
            id="wish-message"
            name="message"
            rows={4}
            value={message}
            maxLength={MAX_MESSAGE}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Happy birthday, little champ! …"
            className="w-full resize-none rounded-2xl border-2 border-sky-soft bg-sky-soft/40 px-4 py-3 text-base text-ink outline-none transition focus:border-baby focus:bg-white"
          />
          <p className="mt-1 text-right text-xs text-ink-soft">
            {message.length}/{MAX_MESSAGE}
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-[#ffe7f2] px-4 py-2 text-sm font-semibold text-candy">
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-candy via-grape to-ocean px-6 py-3.5 text-base font-extrabold text-white shadow-lg"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          Send the Wish
        </motion.button>
      </form>
    </Modal>
  );
}
