"use client";

import { useEffect } from "react";

// Elements matching `selector` fade (and on the home page rise) into place the first time they scroll into view.
// Siblings are staggered by `step` ms, capped at 300ms. Nothing is hidden until this runs, and it never runs
// with reduced motion, so the page reads the same without it.
export function ScrollReveal({ selector, step = 60 }: { selector: string; step?: number }) {
  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const items = [...document.querySelectorAll<HTMLElement>(selector)];

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          seen.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const item of items) {
      const siblings = item.parentElement ? [...item.parentElement.children].filter((el) => el.matches(selector)) : [item];
      item.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(item) * step, 300)}ms`);
      item.classList.add("rv");
      seen.observe(item);
    }

    return () => {
      seen.disconnect();
      for (const item of items) item.classList.remove("rv", "is-in");
    };
  }, [selector, step]);

  return null;
}
