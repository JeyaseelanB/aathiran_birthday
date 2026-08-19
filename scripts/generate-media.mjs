/**
 * Scans public/images and public/videos, works out WHEN each file was taken and
 * writes data/media.generated.ts — the month-by-month gallery the site renders.
 *
 * It also builds a web-sized copy of every photo in public/media (the phone
 * originals are 2–10 MB each, far more than any tile or lightbox needs) plus a
 * tiny blurred placeholder to show while the real image loads.
 *
 * Run it whenever you add or remove media:
 *
 *   npm run media
 *
 * How the date for each file is decided (first match wins):
 *   1. EXIF "DateTimeOriginal" inside the JPEG (what the camera recorded)
 *   2. A date in the file name, e.g. VID20260413162708.mp4 or IMG-20260510-WA0059
 *   3. The file's last-modified time (fallback)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIRS = ["public/images", "public/videos"];
const VIDEO_DIRS = ["public/videos", "public/images"];
const OUTPUT = "data/media.generated.ts";

/** Where the web-sized copies go. Generated — safe to delete, git-ignored. */
const DERIVED_DIR = "public/media";
/** Nothing on the page is displayed wider or taller than this. */
const MAX_EDGE = 1920;
const WEBP_QUALITY = 78;
/** Width of the blurred placeholder inlined into the page as a data URL. */
const BLUR_WIDTH = 16;

/** sharp ships with Next.js; without it we fall back to the untouched files. */
const sharp = await loadSharp();

/** File names listed in data/media-skip.json — near-duplicate shots we hide. */
const SKIP = readSkipList();

/** Birthday, used to label each month with the child's age. */
const BIRTHDAY = readBirthday();

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── date helpers ──────────────────────────────────────────────────────────────

function readBirthday() {
  const source = fs.readFileSync(path.join(root, "data/birthday.ts"), "utf8");
  const match = source.match(/birthday:\s*"(\d{4})-(\d{2})-(\d{2})"/);
  if (!match) throw new Error("Could not find `birthday` in data/birthday.ts");
  return { year: +match[1], month: +match[2], day: +match[3] };
}

/** File names to leave out of the gallery (duplicate burst frames and the like). */
function readSkipList() {
  const file = path.join(root, "data/media-skip.json");
  if (!fs.existsSync(file)) return new Set();
  const { skip = [] } = JSON.parse(fs.readFileSync(file, "utf8"));
  return new Set(skip);
}

/** Pulls YYYYMMDD out of names like VID20260413162708 or VID-20260510-WA0059. */
function dateFromName(name) {
  const match = name.match(/(19|20)(\d{2})[-_]?(\d{2})[-_]?(\d{2})/);
  if (!match) return null;
  const year = +`${match[1]}${match[2]}`;
  const month = +match[3];
  const day = +match[4];
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Minimal EXIF reader: returns the capture date of a JPEG, or null. */
function dateFromExif(file) {
  const stats = fs.statSync(file);
  const size = Math.min(stats.size, 512 * 1024);
  const buf = Buffer.alloc(size);
  const fd = fs.openSync(file, "r");
  fs.readSync(fd, buf, 0, size, 0);
  fs.closeSync(fd);

  const marker = buf.indexOf(Buffer.from("Exif\0\0", "binary"));
  if (marker < 0) return null;

  const tiff = marker + 6;
  const little = buf.toString("ascii", tiff, tiff + 2) === "II";
  const u16 = (o) => (little ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (little ? buf.readUInt32LE(o) : buf.readUInt32BE(o));

  let original = null;
  let fallback = null;

  const walk = (offset, depth) => {
    if (depth > 2 || offset <= 0 || tiff + offset + 2 > buf.length) return;
    const entries = u16(tiff + offset);
    for (let i = 0; i < entries; i += 1) {
      const entry = tiff + offset + 2 + i * 12;
      if (entry + 12 > buf.length) return;
      const tag = u16(entry);
      const type = u16(entry + 2);
      const count = u32(entry + 4);
      const value = u32(entry + 8);

      if (tag === 0x8769) walk(value, depth + 1); // Exif sub-IFD
      if (type !== 2) continue;
      if (tag !== 0x9003 && tag !== 0x9004 && tag !== 0x0132) continue;

      const start = tiff + value;
      const text = buf
        .toString("ascii", start, start + Math.min(count, 24))
        .replace(/\0.*$/, "");
      const parsed = text.match(/^(\d{4}):(\d{2}):(\d{2})/);
      if (!parsed) continue;
      const iso = `${parsed[1]}-${parsed[2]}-${parsed[3]}`;
      if (tag === 0x9003) original = iso;
      else fallback ??= iso;
    }
  };

  walk(u32(tiff + 4), 0);
  return original ?? fallback;
}

function dateFromMtime(file) {
  const d = fs.statSync(file).mtime;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

// ── image size (for portrait/landscape layout) ────────────────────────────────

function imageSize(file) {
  // 1 MB is enough to get past a big EXIF block and reach the frame header.
  const window = Math.min(fs.statSync(file).size, 1024 * 1024);
  const buf = Buffer.alloc(window);
  const fd = fs.openSync(file, "r");
  const read = fs.readSync(fd, buf, 0, window, 0);
  fs.closeSync(fd);

  // PNG
  if (buf.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG: walk the segment markers looking for a start-of-frame
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < read) {
      if (buf[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buf[offset + 1];
      const length = buf.readUInt16BE(offset + 2);
      const isFrame =
        marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isFrame) {
        return {
          height: buf.readUInt16BE(offset + 5),
          width: buf.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }

  return null;
}

// ── collecting files ──────────────────────────────────────────────────────────

function listFiles(dirs, extension, { includeSkipped = false } = {}) {
  const seen = new Set();
  const files = [];
  for (const dir of dirs) {
    const absolute = path.join(root, dir);
    if (!fs.existsSync(absolute)) continue;
    for (const name of fs.readdirSync(absolute).sort()) {
      if (!extension.test(name)) continue;
      if (!includeSkipped && SKIP.has(name)) continue;
      const url = `/${dir.replace(/^public\//, "")}/${name}`;
      if (seen.has(url)) continue;
      seen.add(url);
      files.push({ name, url, absolute: path.join(absolute, name) });
    }
  }
  return files;
}

function monthKey(iso) {
  return iso.slice(0, 7);
}

/** "Month 3" / "Just born" / "1 year old", based on the birthday. */
function ageLabel(key) {
  const [year, month] = key.split("-").map(Number);
  const months = (year - BIRTHDAY.year) * 12 + (month - BIRTHDAY.month);
  if (months < 0) return "Before the big arrival";
  if (months === 0) return "The very first days";
  if (months === 12) return "One year old 🎂";
  if (months > 12) return `${months} months old`;
  return `${months} month${months === 1 ? "" : "s"} old`;
}

function prettyMonth(key) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function prettyDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

function slug(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

// ── web-sized copies ──────────────────────────────────────────────────────────

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    console.warn("! sharp is unavailable — serving the original files as-is");
    return null;
  }
}

/**
 * Writes a WebP copy of `file` no larger than MAX_EDGE and returns its URL,
 * dimensions and a blurred placeholder. Existing copies are reused unless the
 * source has changed since, so a rebuild costs nothing when nothing moved.
 */
async function derive(file, name) {
  const relative = `${DERIVED_DIR}/${name}.webp`;
  const absolute = path.join(root, relative);
  const url = `/${relative.replace(/^public\//, "")}`;

  const source = fs.statSync(file.absolute);
  const current =
    fs.existsSync(absolute) && fs.statSync(absolute).mtimeMs >= source.mtimeMs;

  if (!current) {
    await sharp(file.absolute)
      .rotate() // bake in the EXIF orientation, which WebP does not carry
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(absolute);
  }

  const meta = await sharp(absolute).metadata();
  const blur = await sharp(absolute)
    .resize({ width: BLUR_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    url,
    width: meta.width ?? null,
    height: meta.height ?? null,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    bytes: fs.statSync(absolute).size,
    sourceBytes: source.size,
  };
}

// ── build the month buckets ───────────────────────────────────────────────────

if (sharp) fs.mkdirSync(path.join(root, DERIVED_DIR), { recursive: true });

const derivedNames = new Set();
let savedBytes = 0;

const photos = [];
/** file name → its web-sized copy, including shots the gallery skips. */
const derivedPhotos = {};

// Skipped photos are still given a web-sized copy: they are out of the gallery
// but the hero card picks one by name, and it deserves the same treatment.
for (const file of listFiles(IMAGE_DIRS, IMAGE_EXT, { includeSkipped: true })) {
  const iso =
    (/\.jpe?g$/i.test(file.name) ? dateFromExif(file.absolute) : null) ??
    dateFromName(file.name) ??
    dateFromMtime(file.absolute);

  // Two source folders can hold the same file name, so keep slugs unique.
  let name = slug(file.name);
  while (derivedNames.has(name)) name += "-x";
  derivedNames.add(name);

  const web = sharp ? await derive(file, name) : null;
  if (web) savedBytes += web.sourceBytes - web.bytes;

  const size = web ?? imageSize(file.absolute);
  const portrait = size ? size.height > size.width * 1.05 : false;

  derivedPhotos[file.name] = {
    src: web?.url ?? file.url,
    width: size?.width ?? null,
    height: size?.height ?? null,
    blurDataURL: web?.blurDataURL ?? null,
  };

  if (SKIP.has(file.name)) continue;

  photos.push({
    id: `photo-${name}`,
    src: web?.url ?? file.url,
    date: iso,
    width: size?.width ?? null,
    height: size?.height ?? null,
    span: portrait ? "tall" : "normal",
    blurDataURL: web?.blurDataURL ?? null,
  });
}

const videos = listFiles(VIDEO_DIRS, VIDEO_EXT).map((file) => {
  const iso = dateFromName(file.name) ?? dateFromMtime(file.absolute);
  return {
    id: `video-${slug(file.name)}`,
    src: file.url,
    date: iso,
  };
});

const keys = [
  ...new Set([...photos, ...videos].map((item) => monthKey(item.date))),
].sort();

const months = keys.map((key) => {
  const monthPhotos = photos
    .filter((photo) => monthKey(photo.date) === key)
    .sort((a, b) => a.date.localeCompare(b.date));
  const monthVideos = videos
    .filter((video) => monthKey(video.date) === key)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Videos have no thumbnail of their own, so borrow a photo from the same
  // month (or the closest one we have) as the poster image.
  const posterPool = monthPhotos.length ? monthPhotos : photos;

  return {
    key,
    label: prettyMonth(key),
    age: ageLabel(key),
    photos: monthPhotos.map((photo) => ({
      id: photo.id,
      src: photo.src,
      date: photo.date,
      caption: prettyDate(photo.date),
      alt: `Photo from ${prettyDate(photo.date)}`,
      width: photo.width,
      height: photo.height,
      span: photo.span,
      blurDataURL: photo.blurDataURL,
    })),
    videos: monthVideos.map((video, index) => {
      const poster = posterPool.length
        ? posterPool[index % posterPool.length]
        : null;
      return {
        id: video.id,
        src: video.src,
        date: video.date,
        title: `${prettyMonth(key)} clip ${index + 1}`,
        description: `Recorded on ${prettyDate(video.date)}`,
        poster: poster?.src ?? null,
        posterBlurDataURL: poster?.blurDataURL ?? null,
      };
    }),
  };
});

const header = `// AUTO-GENERATED by scripts/generate-media.mjs — run \`npm run media\` to refresh.
// Add or remove files in public/images and public/videos, then regenerate.
// Captions and titles can be overridden in data/media-captions.ts.

import type { DerivedPhoto, MediaMonth } from "./media-types";

export const mediaMonths: MediaMonth[] = ${JSON.stringify(months, null, 2)};

/** Every photo on disk by file name, including ones left out of the gallery. */
export const derivedPhotos: Record<string, DerivedPhoto> = ${JSON.stringify(derivedPhotos, null, 2)};
`;

fs.writeFileSync(path.join(root, OUTPUT), header, "utf8");

// Drop copies of photos that are no longer in the gallery, so public/media does
// not quietly grow every time a source file is renamed or skipped.
if (sharp) {
  const keep = new Set([...derivedNames].map((name) => `${name}.webp`));
  for (const name of fs.readdirSync(path.join(root, DERIVED_DIR))) {
    if (!keep.has(name)) fs.unlinkSync(path.join(root, DERIVED_DIR, name));
  }
}

// Every path we just wrote must exist on disk. public/media is generated and
// git-ignored, so it can go missing (a clean checkout, a stray delete) while
// data/media.generated.ts still points at it — which shows up as blank tiles
// rather than an error. Fail the build instead.
const missing = [];
for (const month of months) {
  for (const photo of month.photos) missing.push(...absent(photo.src));
  for (const video of month.videos) {
    missing.push(...absent(video.src), ...absent(video.poster));
  }
}
for (const photo of Object.values(derivedPhotos)) {
  missing.push(...absent(photo.src));
}

function absent(url) {
  if (!url) return [];
  const file = path.join(root, "public", url.replace(/^\//, ""));
  return fs.existsSync(file) ? [] : [url];
}

if (missing.length) {
  console.error(`
✗ ${missing.length} referenced file(s) are not on disk:`);
  for (const url of new Set(missing)) console.error(`   ${url}`);
  process.exit(1);
}

const photoCount = months.reduce((n, m) => n + m.photos.length, 0);
const videoCount = months.reduce((n, m) => n + m.videos.length, 0);
console.log(
  `✓ ${OUTPUT}: ${photoCount} photos + ${videoCount} videos across ${months.length} months`,
);
if (sharp) {
  console.log(
    `   ${DERIVED_DIR}: web-sized copies save ${(savedBytes / 1024 / 1024).toFixed(1)} MB`,
  );
}
for (const month of months) {
  console.log(
    `   ${month.label.padEnd(16)} ${String(month.photos.length).padStart(2)} photos, ${String(
      month.videos.length,
    ).padStart(2)} videos  (${month.age})`,
  );
}
