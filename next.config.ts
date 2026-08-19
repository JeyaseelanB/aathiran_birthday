import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos live in /public/media as web-sized WebP copies built by
    // `npm run media`. Add remote hosts here if you ever serve them from a CDN.
    remotePatterns: [],

    // AVIF first (~20% smaller than WebP), WebP for browsers without it.
    formats: ["image/avif", "image/webp"],

    // The gallery never needs a 3840px image: tiles are at most a quarter of a
    // 1152px grid and the lightbox caps at 1024px, so trimming the ladder keeps
    // the optimizer from encoding sizes nothing will ever request.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384, 512],

    // 70 for the square tiles (heavily cropped, small), 82 in the lightbox.
    qualities: [70, 82],

    // The files are content-addressed by name and never change in place, so
    // there is no reason to re-optimize them every few hours. 31 days.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
