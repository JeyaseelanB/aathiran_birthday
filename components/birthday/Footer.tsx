import { Heart } from "lucide-react";

type FooterProps = { name: string; year: number };

export default function Footer({ name, year }: FooterProps) {
  return (
    <footer className="bg-ink px-4 pb-28 pt-8 text-center text-sm text-white/80 sm:px-6 sm:pb-32">
      <p className="flex flex-wrap items-center justify-center gap-1.5">
        Made with
        <Heart className="h-4 w-4 text-candy" fill="currentColor" aria-hidden="true" />
        for {name}
        <span aria-hidden="true">•</span>
        <span>{year}</span>
      </p>
      <p className="mt-2 text-xs text-white/50">
        A little digital memory book, kept safe for when he is big enough to read it.
      </p>
      <p className="mt-4 text-xs font-semibold text-white/70">
        Developed by Jeyaseelan B
        <span className="mx-1.5 text-white/30" aria-hidden="true">
          •
        </span>
        <span className="font-medium text-white/50">Software Engineer</span>
        <span className="mx-1.5 text-white/30" aria-hidden="true">
          •
        </span>
        <span className="font-medium text-white/50">
          Oasys Cybernetics Pvt Ltd
        </span>
      </p>
    </footer>
  );
}
