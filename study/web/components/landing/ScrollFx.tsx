"use client";

import { useEffect } from "react";

// The scroll and pointer effects of the home page, read at most once per animation frame.
// - A thin bar at the top fills as you read down the page.
// - The hero copy drifts up and fades as you leave it.
// - The speed ladder follows your place: the bars grow and the big number changes as each step reaches the middle.
// - The tagline is pinned while you scroll, and its words light up (and dim again) in step with the scroll.
// - Tiles lean toward the pointer, and the main buttons are pulled a little toward it.
// With reduced motion none of this runs, so the page is plain and fully readable.
export function ScrollFx() {
  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

    const root = document.documentElement;
    const bar = document.querySelector<HTMLElement>(".scroll-bar");
    const hero = document.querySelector<HTMLElement>(".hero");
    const tagline = document.querySelector<HTMLElement>(".tagline");
    const words = tagline ? [...tagline.querySelectorAll<HTMLElement>(".tagline-word")] : [];
    const ladder = document.querySelector<HTMLElement>(".ladder");
    const steps = ladder ? [...ladder.querySelectorAll<HTMLElement>(".ladder-step")] : [];
    const rows = ladder ? [...ladder.querySelectorAll<HTMLElement>(".ladder-row")] : [];
    const readouts = ladder ? [...ladder.querySelectorAll<HTMLElement>(".ladder-readout")] : [];

    // The tagline starts dim and the ladder starts empty; both are filled by the scroll below.
    tagline?.classList.add("is-armed", "is-live", "is-pinned");
    ladder?.classList.add("is-armed");

    let frame = 0;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));

    const setStep = (active: number) => {
      rows.forEach((row, index) => {
        row.classList.toggle("is-on", index <= active);
        row.classList.toggle("is-active", index === active);
      });
      readouts.forEach((readout, index) => readout.classList.toggle("is-active", index === active));
      steps.forEach((step, index) => step.classList.toggle("is-active", index === active));
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const viewport = window.innerHeight;

      if (bar) bar.style.transform = `scaleX(${clamp(y / Math.max(1, root.scrollHeight - viewport)).toFixed(4)})`;
      if (hero) hero.style.setProperty("--hp", clamp(y / (hero.offsetHeight * 0.9)).toFixed(3));

      if (tagline && words.length) {
        const box = tagline.getBoundingClientRect();
        // 0 when the section reaches the top of the screen, 1 when it is about to leave.
        const progress = clamp((viewport * 0.3 - box.top) / Math.max(1, box.height - viewport * 0.4));
        const lit = progress * (words.length + 1);
        words.forEach((word, index) => word.classList.toggle("is-lit", index < lit));
      }

      if (steps.length) {
        // The active step is the last one whose top has passed the middle of the screen.
        let active = -1;
        steps.forEach((step, index) => {
          if (step.getBoundingClientRect().top < viewport * 0.55) active = index;
        });
        setStep(active);
      }
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Pointer: tiles lean toward it, buttons lean in.
    const tiles = fine ? [...document.querySelectorAll<HTMLElement>(".bento-tile")] : [];
    const buttons = fine ? [...document.querySelectorAll<HTMLElement>(".landing-cta:not(.landing-cta-small)")] : [];
    let pending: PointerEvent | null = null;
    let pointerFrame = 0;
    const applyPointer = () => {
      pointerFrame = 0;
      const event = pending;
      if (!event) return;
      for (const tile of tiles) {
        const box = tile.getBoundingClientRect();
        const inside = event.clientX > box.left && event.clientX < box.right && event.clientY > box.top && event.clientY < box.bottom;
        if (!inside) {
          if (tile.style.transform) tile.style.transform = "";
          continue;
        }
        const dx = (event.clientX - box.left) / box.width - 0.5;
        const dy = (event.clientY - box.top) / box.height - 0.5;
        tile.style.transform = `perspective(900px) rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 5).toFixed(2)}deg)`;
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
      ladder?.classList.remove("is-armed");
      words.forEach((word) => word.classList.remove("is-lit"));
      rows.forEach((row) => row.classList.add("is-on"));
      if (bar) bar.style.transform = "";
      hero?.style.removeProperty("--hp");
      for (const tile of tiles) tile.style.transform = "";
      for (const button of buttons) button.style.translate = "";
    };
  }, []);

  return null;
}
