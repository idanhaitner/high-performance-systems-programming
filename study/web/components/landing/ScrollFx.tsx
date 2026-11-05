"use client";

import { useEffect } from "react";

// All the scroll and pointer effects of the home page, in one place and one animation frame per change.
// - A thin bar at the top fills as you read down the page.
// - The hero drifts up and the fan opens wider as you scroll away from it.
// - The subject ribbon leans in the direction you scroll, in proportion to your speed.
// - The tagline is pinned while you scroll, and its words light up (and dim again) in step with the scroll.
// - Cards lean toward the pointer, and the main buttons are pulled a little toward it.
// With reduced motion none of this runs: the page is plain, and the tagline stays lit.
export function ScrollFx() {
  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

    const root = document.documentElement;
    const bar = document.querySelector<HTMLElement>(".scroll-bar");
    const hero = document.querySelector<HTMLElement>(".hero");
    const marquee = document.querySelector<HTMLElement>(".marquee");
    const tagline = document.querySelector<HTMLElement>(".tagline");
    const words = tagline ? [...tagline.querySelectorAll<HTMLElement>(".tagline-word")] : [];

    // The tagline starts dim and is colored by scroll, so the old per-word fade is switched on here.
    tagline?.classList.add("is-armed", "is-live", "is-pinned");

    let last = window.scrollY;
    let lean = 0;
    let frame = 0;

    const clamp = (value: number) => Math.max(0, Math.min(1, value));

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const viewport = window.innerHeight;

      if (bar) bar.style.transform = `scaleX(${clamp(y / Math.max(1, root.scrollHeight - viewport)).toFixed(4)})`;

      if (hero) hero.style.setProperty("--hp", clamp(y / (hero.offsetHeight * 0.9)).toFixed(3));

      if (marquee) {
        // The lean follows the scroll speed, then eases back to flat when you stop.
        lean += (Math.max(-1, Math.min(1, (y - last) / 60)) - lean) * 0.25;
        marquee.style.transform = `skewX(${(lean * -8).toFixed(2)}deg)`;
      }
      last = y;

      if (tagline && words.length) {
        const box = tagline.getBoundingClientRect();
        // 0 when the section reaches the top of the screen, 1 when it is about to leave.
        const progress = clamp((viewport * 0.3 - box.top) / Math.max(1, box.height - viewport * 0.4));
        const lit = progress * (words.length + 1);
        words.forEach((word, index) => word.classList.toggle("is-lit", index < lit));
      }

      if (Math.abs(lean) > 0.01) frame = requestAnimationFrame(update);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Pointer: cards lean toward it, buttons lean in.
    const cards = fine ? [...document.querySelectorAll<HTMLElement>(".benefits li, .outcome-list li, .syllabus-part")] : [];
    const buttons = fine ? [...document.querySelectorAll<HTMLElement>(".landing-cta:not(.landing-cta-small)")] : [];
    let pending: PointerEvent | null = null;
    let pointerFrame = 0;
    const applyPointer = () => {
      pointerFrame = 0;
      const event = pending;
      if (!event) return;
      for (const card of cards) {
        const box = card.getBoundingClientRect();
        const inside = event.clientX > box.left && event.clientX < box.right && event.clientY > box.top && event.clientY < box.bottom;
        if (!inside) {
          if (card.style.transform) card.style.transform = "";
          continue;
        }
        const dx = (event.clientX - box.left) / box.width - 0.5;
        const dy = (event.clientY - box.top) / box.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 5).toFixed(2)}deg)`;
      }
      for (const button of buttons) {
        const box = button.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const pull = Math.hypot(dx, dy) < 120 ? 0.25 : 0;
        button.style.translate = pull ? `${(dx * pull).toFixed(1)}px ${(dy * pull).toFixed(1)}px` : "";
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pending = event;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer);
    };

    update();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pointerFrame);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      window.removeEventListener("pointermove", onMove);
      tagline?.classList.remove("is-armed", "is-live", "is-pinned");
      words.forEach((word) => word.classList.remove("is-lit"));
      if (bar) bar.style.transform = "";
      if (marquee) marquee.style.transform = "";
      hero?.style.removeProperty("--hp");
      for (const card of cards) card.style.transform = "";
      for (const button of buttons) button.style.translate = "";
    };
  }, []);

  return null;
}
