/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE TO PERSONALISE THE WHOLE WEBSITE
 * ─────────────────────────────────────────────────────────────
 *  Everything the site renders (name, age, photos, videos,
 *  wishes, timeline, music) comes from the object below.
 */

/**
 * Photos and videos are NOT listed here — they are read straight from
 * `public/images` and `public/videos` by `npm run media`, grouped by the month
 * they were taken. See `data/media.ts`.
 */

export type Wish = {
  id: string;
  name: string;
  /** How they are related, shown under the name. Defaults to "Birthday wish". */
  role?: string;
  message: string;
  /** Emoji used as the avatar when no photo is available. */
  avatar: string;
  accent: WishAccent;
};

export type WishAccent = "sky" | "pink" | "amber" | "violet" | "mint";

export type Milestone = {
  id: string;
  emoji: string;
  title: string;
  date: string;
  description: string;
};

export type NavLink = {
  label: string;
  href: `#${string}`;
};

export type BirthdayData = {
  name: string;
  age: number;
  /** ISO date (YYYY-MM-DD) — used by the countdown. */
  birthday: string;
  /** Pretty version shown in the hero. */
  birthdayLabel: string;
  heroMessage: string;
  finalMessage: string;
  surpriseMessage: string;
  musicSrc: string;
  wishes: Wish[];
  milestones: Milestone[];
  navLinks: NavLink[];
};

export const birthdayData: BirthdayData = {
  name: "Aathiran",
  age: 1,
  birthday: "2025-08-23",
  birthdayLabel: "23 August 2025",
  heroMessage:
    "Wishing our little superstar a day filled with happiness, laughter, love and endless adventures!",
  finalMessage:
    "May your little world always be filled with laughter, love, colorful dreams and unforgettable adventures.",
  surpriseMessage:
    "May every year bring you more smiles, more adventures, more dreams and more wonderful memories. Happy Birthday, little superstar! ❤️",
  musicSrc: "/audio/birthday-song.mp3",

  navLinks: [
    { label: "Home", href: "#home" },
    { label: "Wishes", href: "#wishes" },
    { label: "Memories", href: "#memories" },
    { label: "Videos", href: "#videos" },
    { label: "Timeline", href: "#timeline" },
    { label: "Surprise", href: "#surprise" },
  ],


  wishes: [
    {
      id: "wish-amma",
      name: "Kanchana",
      role: "Amma",
      message:
        "Happy Birthday, my little world. One whole year of you, and every single day has been the best day.",
      avatar: "👩",
      accent: "pink",
    },
    {
      id: "wish-periyamma",
      name: "Amirtha",
      role: "Periyamma",
      message:
        "Happy first birthday, செல்லம்! You have all of our hearts wrapped around your tiny fingers.",
      avatar: "👩‍🦱",
      accent: "pink",
    },
    {
      id: "wish-mama-mathavan",
      name: "Mathavan",
      role: "Mama",
      message:
        "Happy birthday, chellam! Grow up strong and happy — your mama is always here for you.",
      avatar: "🧔",
      accent: "sky",
    },
    {
      id: "wish-mama-jeyaseelan",
      name: "Jeyaseelan",
      role: "Mama",
      message:
        "My little hero turns one today. May your life be full of laughter, your dreams be big, and may you always know your mama is right behind you.",
      avatar: "🧑",
      accent: "violet",
    },
    {
      id: "wish-thatha",
      name: "Vetrivel",
      role: "Grandfather",
      message:
        "God bless you, kanna. May you always be healthy, happy and loved, today and always.",
      avatar: "👴",
      accent: "amber",
    },
    {
      id: "wish-paatti",
      name: "Parvathi",
      role: "Grandmother",
      message:
        "My sweet little one turns one. Keep smiling that smile that fills the whole house.",
      avatar: "👵",
      accent: "mint",
    },
  ],

  milestones: [
    {
      id: "ms-1",
      emoji: "👶",
      title: "The Day You Were Born",
      date: "23 August 2025",
      description:
        "The whole world got a little brighter at exactly the moment you arrived.",
    },
    {
      id: "ms-2",
      emoji: "🧸",
      title: "First Smile",
      date: "October 2025",
      description:
        "A tiny toothless grin that instantly became everybody's favourite thing.",
    },
    {
      id: "ms-3",
      emoji: "🚶",
      title: "First Steps",
      date: "June 2026",
      description:
        "Wobbly, brave and completely determined to catch the football.",
    },
    {
      id: "ms-6",
      emoji: "⭐",
      title: "Today — Our Little Superstar",
      date: "Every single day",
      description:
        "Still the best thing that ever happened to this family.",
    },
    {
      id: "ms-4",
      emoji: "🎂",
      title: "First Birthday",
      date: "23 August 2026",
      description:
        "One candle, one cake and one very sticky, very happy little face.",
    },
  ],
};
