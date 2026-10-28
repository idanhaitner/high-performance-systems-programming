"use client";

import { useEffect } from "react";

// On wide screens, definition and check cards float in a column beside the text (globals.css).
// When a section has more cards than text, they would stack down past the paragraph they explain
// and into the next section. Any card that would end up too far from its paragraph, or past the
// next heading, is marked data-inline and shown in the text instead.
const CARDS = ".page.lesson :is(.formal, .card.check):not(.practice *)";
const MAX_DRIFT = 160; // px a side card may sit below the paragraph before it

function place() {
  const cards = [...document.querySelectorAll<HTMLElement>(CARDS)];
  cards.forEach((card) => delete card.dataset.inline);
  if (!cards.length || getComputedStyle(cards[0]).float === "none") return; // narrow screens: all inline already

  const headings = [...document.querySelectorAll(".page.lesson h2")];
  // In order, because moving one card inline pushes the text below it, which changes the cards after it.
  for (const card of cards) {
    const box = card.getBoundingClientRect();
    const before = card.previousElementSibling;
    const drift = before ? box.top - before.getBoundingClientRect().bottom : 0;
    const next = headings.find((h) => card.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (drift > MAX_DRIFT || (next && box.bottom > next.getBoundingClientRect().top)) card.dataset.inline = "";
  }
}

export function SideCards() {
  useEffect(() => {
    const page = document.querySelector(".page.lesson");
    if (!page) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    // Width changes and late-loading figures both move the text, so place again when the page resizes.
    const observer = new ResizeObserver(schedule);
    observer.observe(page);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
