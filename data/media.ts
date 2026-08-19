import { derivedPhotos, mediaMonths as generated } from "./media.generated";
import { monthNotes, photoCaptions, videoTitles } from "./media-captions";
import type { MediaMonth } from "./media-types";

export type { DerivedPhoto, MediaMonth, MonthPhoto, MonthVideo } from "./media-types";

/**
 * The web-sized copy of a source file, by its name in public/images.
 * Falls back to the original path if the copy has not been generated yet.
 */
export function photoByFileName(name: string) {
  return (
    derivedPhotos[name] ?? {
      src: `/images/${name}`,
      width: null,
      height: null,
      blurDataURL: null,
    }
  );
}

/** Generated media with any hand-written captions applied on top. */
export const mediaMonths: MediaMonth[] = generated.map((month) => ({
  ...month,
  photos: month.photos.map((photo) => ({
    ...photo,
    caption: photoCaptions[photo.id] ?? photo.caption,
    alt: photoCaptions[photo.id] ?? photo.alt,
  })),
  videos: month.videos.map((video) => ({
    ...video,
    title: videoTitles[video.id] ?? video.title,
  })),
}));

export function noteForMonth(key: string): string | undefined {
  return monthNotes[key];
}

export const photoMonths: MediaMonth[] = mediaMonths.filter(
  (month) => month.photos.length > 0,
);

export const videoMonths: MediaMonth[] = mediaMonths.filter(
  (month) => month.videos.length > 0,
);

export const allPhotos = mediaMonths.flatMap((month) => month.photos);
export const allVideos = mediaMonths.flatMap((month) => month.videos);
