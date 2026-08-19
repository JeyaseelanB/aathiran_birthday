# 🎉 Aathiran's Birthday Website

A playful, animated one-page birthday celebration site — hero, countdown, wishes wall,
photo gallery with lightbox, video memories, growing-up timeline, candle-blowing cake,
surprise gift, background music and a final birthday message.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**,
**Framer Motion** and **lucide-react**.

---

## 🚀 Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server → http://localhost:3001
```

Other commands:

```bash
npm run build   # production build
npm start       # serve the production build (port 3001)
npm run media   # rescan public/images + public/videos and rebuild the month gallery
```

---

## ✏️ Where to change the birthday details

Everything the site shows comes from a single file:

**[`data/birthday.ts`](data/birthday.ts)**

```ts
export const birthdayData: BirthdayData = {
  name: "Aathiran",
  age: 1,
  birthday: "2025-08-23",        // ISO date, drives the countdown
  birthdayLabel: "23 August 2025",
  heroMessage: "...",
  photos: [...],
  videos: [...],
  wishes: [...],
  milestones: [...],
};
```

Change the name, age, date, messages, wishes and timeline milestones there — no component
edits needed.

---

## 📸 Your photos and videos (month-wise, automatic)

Drop files into these two folders — that is the whole workflow:

```text
public/images/    photos (.jpg .jpeg .png .webp .avif)
public/videos/    clips  (.mp4 .webm .mov)   ← photos in here are picked up too
```

Then regenerate the gallery:

```bash
npm run media
```

(`npm run dev` and `npm run build` run this for you automatically.)

### How the month grouping works

Each file is placed in a month using the first date it can find:

1. **EXIF capture date** inside the JPEG — what the camera recorded
2. **A date in the file name** — e.g. `VID20260413162708.mp4`, `IMG-20260510-WA0059.jpg`
3. **The file's last-modified time** — fallback

The result is written to `data/media.generated.ts` and rendered as month blocks
("August 2025 · the very first days", "July 2026 · 11 months old"), with a chip bar at the
top of the gallery and the video section to jump to a single month. Ages are calculated
from `birthday` in `data/birthday.ts`.

The command prints exactly what it found, so you can sanity-check any odd dates:

```text
✓ data/media.generated.ts: 27 photos + 14 videos across 10 months
   August 2025       4 photos,  0 videos  (The very first days)
   September 2025    2 photos,  0 videos  (1 month old)
   ...
```

### Captions

Photo captions default to the date ("17 July 2026"). To write nicer ones, add entries to
**[`data/media-captions.ts`](data/media-captions.ts)** using the ids from
`data/media.generated.ts`:

```ts
export const photoCaptions = { "photo-1000025855-jpg": "First day home 💙" };
export const videoTitles   = { "video-vid20260413162708": "Crawling at full speed" };
export const monthNotes    = { "2025-08": "The week you arrived." };
```

Never edit `data/media.generated.ts` by hand — `npm run media` overwrites it.

### Videos and music

- Video thumbnails: there is no frame-grabber here, so each clip borrows a photo from the
  same month as its poster. Drop a matching still into `public/images` and it is used
  automatically.
- Portrait photos are detected from their dimensions and given a taller tile in the grid.
- **Music:** put your song at `public/audio/birthday-song.mp3`. The floating button never
  autoplays — the visitor taps it. If the file is missing, the button shows a hint.
- Large originals (5–10 MB) work fine — `next/image` resizes them — but shrinking photos to
  ~2000px on the long edge makes the first load noticeably snappier.

---

## 🗂️ Project structure

```text
app/
  layout.tsx                  # fonts, metadata, skip link
  page.tsx                    # composes every section
  globals.css                 # Tailwind theme, palette, keyframes

components/
  ui/
    Modal.tsx                 # accessible dialog shell (focus trap + Esc)
    SectionHeading.tsx
  birthday/
    Navbar.tsx                # sticky, blurs on scroll, animated mobile menu
    BirthdayHero.tsx          # full-screen hero + CTA
    CountdownTimer.tsx        # animated days/hours/minutes/seconds
    BirthdayWishes.tsx        # wishes wall + "Add Your Wish"
    WishCard.tsx
    WishModal.tsx
    MonthFilter.tsx           # month chip bar
    PhotoGallery.tsx          # masonry grid, grouped month by month
    PhotoLightbox.tsx         # full-screen viewer, arrow-key navigation
    VideoMemories.tsx         # video cards, grouped month by month
    VideoModal.tsx
    BirthdayTimeline.tsx      # scroll-animated milestones
    BirthdayCake.tsx          # "Make a Wish" — candles, smoke, confetti
    CakeArt.tsx               # the SVG cake itself
    SurpriseGift.tsx          # tap-to-open gift box
    MusicPlayer.tsx           # floating play/pause button
    FinalMessage.tsx
    Footer.tsx
    Confetti.tsx
    FloatingBalloons.tsx
    SkyDecor.tsx              # stars, clouds, sparkles

data/birthday.ts              # ← name, age, date, wishes, timeline text
data/media.generated.ts       # ← auto-generated month gallery (do not edit)
data/media-captions.ts        # ← optional nicer captions / month notes
data/media.ts                 # merges the two above
scripts/generate-media.mjs    # the scanner behind `npm run media`
lib/hooks.ts                  # countdown, focus trap, scroll lock, smooth scroll
lib/random.ts                 # seeded randomness (keeps SSR and client in sync)

public/
  images/  videos/  audio/
```

---

## ♿ Accessibility & performance notes

- Modals trap focus, close on **Esc**, restore focus and lock background scroll.
- The lightbox also supports **←/→** keys.
- Everything decorative is `aria-hidden`; photos carry real `alt` text.
- `prefers-reduced-motion` is respected — confetti and sparkles disappear and the floating
  animations settle down.
- Decorative positions come from a seeded generator instead of `Math.random()`, so there
  are no hydration mismatches.
- Photos go through `next/image` (lazy loading, responsive `sizes`, modern formats).

---

## 💡 Handy tweaks

- **Countdown:** it targets the `birthday` date in `data/birthday.ts`. Once that date has
  passed, the timer is replaced by **"Today is the Big Day! 🎂🎉"** — set next year's date
  to bring the countdown back.
- **Colours:** the palette lives in the `@theme` block at the top of `app/globals.css`
  (`--color-candy`, `--color-baby`, `--color-sunny`, …). Change them there and the whole
  site follows.
- **Wishes:** new wishes submitted through the modal are kept in React state, so they show
  instantly but reset on reload. Swap `addWish` in `BirthdayWishes.tsx` for an API call if
  you ever want them saved.

# aathiran_birthday
