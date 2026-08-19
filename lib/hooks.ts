"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** True only after the component has mounted in the browser. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Locks page scrolling while a modal/lightbox is open and restores the
 * previous values on close.
 *
 * Hiding the overflow also removes the page scrollbar, which on desktop would
 * let the layout jump sideways by its width the moment a dialog opens. The
 * gutter is padded back in so nothing moves.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}

/** Calls `onEscape` whenever Escape is pressed while `active` is true. */
export function useEscapeKey(active: boolean, onEscape: () => void): void {
  const handler = useRef(onEscape);
  handler.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);
}

/**
 * Keeps keyboard focus inside a dialog while it is open, and returns focus to
 * the previously focused element when it closes.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
): React.RefObject<T | null> {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return containerRef;
}

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
};

function diff(target: number): TimeLeft {
  const delta = target - Date.now();
  if (delta <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }
  const totalSeconds = Math.floor(delta / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOver: false,
  };
}

/**
 * Ticking countdown to an ISO date. Returns `null` until mounted so the
 * server and the first client render agree.
 */
export function useCountdown(isoDate: string): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(`${isoDate}T00:00:00`).getTime();
    if (Number.isNaN(target)) return;

    setTimeLeft(diff(target));
    const id = window.setInterval(() => setTimeLeft(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [isoDate]);

  return timeLeft;
}

/**
 * Which of the given section hashes the reader is currently looking at.
 *
 * The winner is the last section whose top has crossed a line a third of the
 * way down the viewport — the same section that visually fills the screen. A
 * plain scroll listener beats IntersectionObserver here because sections vary
 * wildly in height: several short ones can be on screen at once, and only the
 * crossing order says which one is actually being read.
 */
export function useActiveSection(hashes: string[]): string | null {
  const [active, setActive] = useState<string | null>(hashes[0] ?? null);
  // Hashes are a fresh array every render; compare by value, not identity.
  const key = hashes.join(",");

  useEffect(() => {
    const sections = key
      .split(",")
      .map((hash) => document.getElementById(hash.replace(/^#/, "")))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let frame = 0;

    const pick = () => {
      frame = 0;
      const line = window.innerHeight / 3;

      let current = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section;
      }

      // The last section is often too short to ever reach the line, so it
      // would never light up without this.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      setActive(`#${(atBottom ? sections[sections.length - 1] : current).id}`);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(pick);
    };

    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return active;
}

/** Smoothly scrolls to an element id, honouring reduced-motion settings. */
export function useScrollTo(): (hash: string) => void {
  return useCallback((hash: string) => {
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }, []);
}
