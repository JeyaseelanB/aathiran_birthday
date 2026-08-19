/** Shapes shared by the auto-generated media file and the components. */

export type MonthPhoto = {
  id: string;
  src: string;
  /** ISO date the photo was taken (from EXIF where available). */
  date: string;
  caption: string;
  alt: string;
  width: number | null;
  height: number | null;
  /** Portrait shots span two rows in the masonry grid. */
  span: "normal" | "tall";
  /** Tiny inline preview shown while the real image downloads. */
  blurDataURL: string | null;
};

export type MonthVideo = {
  id: string;
  src: string;
  date: string;
  title: string;
  description: string;
  /** A photo from the same month, used as the thumbnail. */
  poster: string | null;
  /** Tiny inline preview for that thumbnail. */
  posterBlurDataURL: string | null;
};

/** A web-sized copy of a source photo, whether or not it is in the gallery. */
export type DerivedPhoto = {
  src: string;
  width: number | null;
  height: number | null;
  blurDataURL: string | null;
};

export type MediaMonth = {
  /** "2026-03" */
  key: string;
  /** "March 2026" */
  label: string;
  /** "7 months old" */
  age: string;
  photos: MonthPhoto[];
  videos: MonthVideo[];
};
