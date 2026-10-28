"use client";

import { useEffect } from "react";

// Tagline words light up one at a time as they cross the middle of the screen.
// With reduced motion the words simply stay lit.
export function Reveal() {
  useEffect(() => {
    const tagline = document.querySelector(".tagline");
    if (!tagline || !matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    const words = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-lit", entry.isIntersecting || entry.boundingClientRect.top < 0);
        }
      },
      { rootMargin: "0px 0px -45% 0px" },
    );
    tagline.querySelectorAll(".tagline-word").forEach((node) => words.observe(node));
    // Dim at once, then turn the colour transition on, so the words never fade down on load.
    tagline.classList.add("is-armed");
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => tagline.classList.add("is-live")));

    return () => {
      cancelAnimationFrame(frame);
      words.disconnect();
      tagline.classList.remove("is-armed", "is-live");
    };
  }, []);

  return null;
}
