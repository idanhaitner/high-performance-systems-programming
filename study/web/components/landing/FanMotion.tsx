"use client";

import { useEffect } from "react";

// The hero fan follows the pointer: the whole fan tilts a few degrees toward it, and the card under the pointer
// pushes its neighbours aside so its title is easy to read. Only with a mouse, and never with reduced motion.
export function FanMotion() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const fan = hero?.querySelector<HTMLElement>(".fan");
    if (!hero || !fan) return;
    if (!matchMedia("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)").matches) return;

    const cards = [...fan.querySelectorAll<HTMLElement>(":scope > li")];
    let frame = 0;
    let x = 0;
    let y = 0;

    const tilt = () => {
      frame = 0;
      fan.style.transform = `perspective(1200px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
    };
    const onMove = (event: PointerEvent) => {
      const box = fan.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, (event.clientX - (box.left + box.width / 2)) / (box.width / 2) / 2));
      y = Math.max(-1, Math.min(1, (event.clientY - (box.top + box.height / 2)) / (box.height / 2) / 2));
      if (!frame) frame = requestAnimationFrame(tilt);
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(tilt);
    };
    const push = (active: number) => {
      cards.forEach((card, index) => card.style.setProperty("--push", String(active < 0 ? 0 : Math.sign(index - active))));
    };
    const onOver = (event: Event) => {
      const card = (event.target as Element).closest?.(".fan > li");
      push(card ? cards.indexOf(card as HTMLElement) : -1);
    };
    const onOut = (event: PointerEvent | FocusEvent) => {
      if (!fan.contains(event.relatedTarget as Node | null)) push(-1);
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    fan.addEventListener("pointerover", onOver);
    fan.addEventListener("focusin", onOver);
    fan.addEventListener("pointerout", onOut);
    fan.addEventListener("focusout", onOut);
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      fan.removeEventListener("pointerover", onOver);
      fan.removeEventListener("focusin", onOver);
      fan.removeEventListener("pointerout", onOut);
      fan.removeEventListener("focusout", onOut);
      fan.style.transform = "";
      push(-1);
    };
  }, []);

  return null;
}
