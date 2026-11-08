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

    // Once an element has arrived, drop the reveal classes so its own hover transitions take over again.
    const settle = (event: TransitionEvent) => {
      const item = event.currentTarget as HTMLElement;
      if (event.target !== item || event.propertyName !== "opacity" || !item.classList.contains("is-in")) return;
      item.classList.remove("rv", "is-in");
      item.removeEventListener("transitionend", settle);
    };

    for (const item of items) {
      item.addEventListener("transitionend", settle);
      const siblings = item.parentElement ? [...item.parentElement.children].filter((el) => el.matches(selector)) : [item];
      item.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(item) * step, 300)}ms`);
      item.classList.add("rv");
      seen.observe(item);
    }

    return () => {
      seen.disconnect();
      for (const item of items) {
        item.removeEventListener("transitionend", settle);
        item.classList.remove("rv", "is-in");
      }
    };
  }, [selector, step]);

  return null;
}
