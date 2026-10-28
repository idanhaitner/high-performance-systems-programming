"use client";

import { useEffect } from "react";

// Sections rise into place once, and tagline words light up one at a time as they cross the middle of the screen.
export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("can-reveal");

    const sections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          sections.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((node) => sections.observe(node));

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
      sections.disconnect();
      words.disconnect();
      root.classList.remove("can-reveal");
    };
  }, []);

  return null;
}
