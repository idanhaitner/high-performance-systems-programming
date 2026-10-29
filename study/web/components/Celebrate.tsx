"use client";

import { useEffect } from "react";

const COLORS = ["var(--mint)", "var(--sun)", "var(--coral)", "var(--accent)"];

// A right answer throws a small handful of paper cards out of its check mark, which then fall and fade.
// It only happens after the student presses Check, never on load, and never with reduced motion.
export function Celebrate() {
  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    const onCheck = (event: Event) => {
      const { id, correct } = (event as CustomEvent<{ id: string; correct: boolean }>).detail;
      if (!correct) return;
      const mark = document.getElementById(id)?.querySelector(".check-result.is-yes .choice-mark, .check-result.is-yes");
      if (!mark) return;
      const box = mark.getBoundingClientRect();
      const x = box.left + Math.min(box.width, 22) / 2;
      const y = box.top + box.height / 2;

      for (let i = 0; i < 14; i++) {
        const bit = document.createElement("span");
        bit.className = "confetti";
        bit.style.left = `${x}px`;
        bit.style.top = `${y}px`;
        bit.style.background = COLORS[i % COLORS.length];
        document.body.append(bit);
        // Spread the pieces over an upward fan, each with its own reach and spin.
        const angle = (-90 + (i / 13 - 0.5) * 150 + (Math.random() - 0.5) * 16) * (Math.PI / 180);
        const reach = 48 + Math.random() * 56;
        const dx = Math.cos(angle) * reach;
        const dy = Math.sin(angle) * reach;
        const spin = (Math.random() - 0.5) * 540;
        bit
          .animate(
            [
              { transform: "translate(-50%, -50%) scale(0.6) rotate(0deg)", opacity: 1 },
              { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.45 },
              { transform: `translate(calc(-50% + ${dx * 1.2}px), calc(-50% + ${dy + 64}px)) scale(0.9) rotate(${spin}deg)`, opacity: 0 },
            ],
            { duration: 900 + Math.random() * 300, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
          )
          .finished.finally(() => bit.remove());
      }
    };

    window.addEventListener("study-check", onCheck);
    return () => window.removeEventListener("study-check", onCheck);
  }, []);

  return null;
}
