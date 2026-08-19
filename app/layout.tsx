import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { birthdayData } from "@/data/birthday";
import { allPhotos } from "@/data/media";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ),
  title: `Happy Birthday, ${birthdayData.name}! 🎉`,
  description: birthdayData.heroMessage,
  openGraph: {
    title: `Happy Birthday, ${birthdayData.name}! 🎉`,
    description: birthdayData.heroMessage,
    images: allPhotos[0] ? [allPhotos[0].src] : [],
  },
};

export const viewport: Viewport = {
  themeColor: "#7cc7ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="antialiased">
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
