"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cake, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { NavLink } from "@/data/birthday";
import { useActiveSection, useScrollTo } from "@/lib/hooks";

type NavbarProps = {
  name: string;
  links: NavLink[];
};

/** Sticky navigation that turns translucent once the page is scrolled. */
export default function Navbar({ name, links }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = useScrollTo();
  const active = useActiveSection(links.map((link) => link.href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setMenuOpen(false);
    // Let the menu close first. Measuring the target while the panel is still
    // expanded, then scrolling as it collapses, fights the layout mid-flight —
    // one frame later the page is settled and the jump lands where it should.
    requestAnimationFrame(() => scrollTo(href));
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/70 shadow-[0_10px_30px_-20px_rgba(47,143,224,0.6)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
      >
        <button
          type="button"
          onClick={() => go("#home")}
          className="flex items-center gap-2 rounded-full px-2 py-1 text-left"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-candy to-mango text-white shadow-md">
            <Cake className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap font-display text-base font-extrabold text-ink sm:text-lg lg:text-xl">
            {name}
            <span className="text-candy">&apos;s</span> Day
          </span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const current = link.href === active;

            return (
              <li key={link.href}>
                <button
                  type="button"
                  onClick={() => go(link.href)}
                  /* Keeps a mouse click from parking a focus ring on the link
                     you just left, which would sit there competing with the
                     pill. Tab focus is untouched. */
                  onMouseDown={(event) => event.preventDefault()}
                  aria-current={current ? "true" : undefined}
                  className={`relative rounded-full px-3 py-2 text-sm font-semibold transition-colors lg:px-4 ${
                    current
                      ? "text-ocean"
                      : "text-ink-soft hover:bg-white/85 hover:text-ocean hover:shadow-[0_8px_20px_-14px_rgba(47,143,224,0.9)] hover:ring-1 hover:ring-ocean/15"
                  }`}
                >
                  {/* One pill shared by every link, so it slides from the old
                      section to the new one instead of blinking across. It is
                      painted before the label, which keeps the text on top
                      without needing a stacking context. */}
                  {current && (
                    <motion.span
                      layoutId="nav-active-pill"
                      aria-hidden="true"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-white shadow-[0_8px_20px_-12px_rgba(47,143,224,0.9)] ring-1 ring-ocean/25"
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-ink shadow-md md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden bg-white/90 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 pb-4 pt-1">
              {links.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index }}
                >
                  <button
                    type="button"
                    onClick={() => go(link.href)}
                    aria-current={link.href === active ? "true" : undefined}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-base font-semibold transition ${
                      link.href === active
                        ? "bg-sky-soft text-ocean"
                        : "text-ink hover:bg-sky-soft"
                    }`}
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
