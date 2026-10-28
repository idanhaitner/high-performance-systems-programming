"use client";

import { useEffect } from "react";

// Tagline words light up one at a time as they cross the middle of the screen.
export function Reveal() {
  useEffect(() => {
    const words = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-lit", entry.isIntersecting || entry.boundingClientRect.top < 0);
        }
      },
      { rootMargin: "0px 0px -45% 0px" },
    );
    document.querySelectorAll(".tagline-word").forEach((node) => words.observe(node));

    return () => {
      words.disconnect();
    };
  }, []);

  return null;
}
