"use client";

import { useEffect } from "react";

// On wide screens, definition and check cards float in a column beside the text (globals.css).
// Cards at the end of a section would hang past the next heading, so each section's cards are
// lifted, as one stack, up beside the section's earlier text. Only when a section has more cards
// than room, or a card would sit too far below its paragraph, is a card marked data-inline and
// shown in the text instead.
const CARDS = ".page.lesson :is(.formal, .card.check):not(.practice *)";
const MAX_DRIFT = 160; // px a side card may sit below the paragraph before it
const GAP = 16; // px kept between side cards, and between a card and a heading

function isCard(element: Element | null) {
  return element instanceof HTMLElement && element.matches(CARDS) && !("inline" in element.dataset);
}

// The bottom of the text a card belongs to: the nearest block before it that is not a side card.
function anchorOf(card: HTMLElement) {
  let before = card.previousElementSibling;
  while (before && isCard(before)) before = before.previousElementSibling;
  return before ? before.getBoundingClientRect().bottom : -Infinity;
}

function placeGroup(group: HTMLElement[], headings: Element[]) {
  const own = group[0].closest(".lesson-section")?.querySelector("h2");
  const floor = own ? own.getBoundingClientRect().bottom + GAP : -Infinity;
  for (;;) {
    const cards = group.filter(isCard);
    if (!cards.length) return;
    const last = cards[cards.length - 1];
    const next = headings.find((h) => last.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING);
    const limit = next ? next.getBoundingClientRect().top - GAP : Infinity;

    // The browser has already stacked the cards top-down; walk back up from the heading, pulling each card
    // high enough to clear the card below it.
    const tops = cards.map((card) => card.getBoundingClientRect().top);
    const highest = Math.min(floor, tops[0]); // a card may stay where the browser put it, even close to the heading
    const heights = cards.map((card) => card.offsetHeight);
    let ceiling = limit;
    for (let i = cards.length - 1; i >= 0; i -= 1) {
      tops[i] = Math.min(tops[i], ceiling - heights[i]);
      ceiling = tops[i] - GAP;
    }

    const drifting = cards.findIndex((card, i) => tops[i] - anchorOf(card) > MAX_DRIFT);
    if (tops[0] < highest - 1) {
      // No room for every card: one goes in the text, a definition before a question, the lower one first.
      const spare = [...cards].reverse().find((card) => card.matches(".formal")) ?? last;
      spare.dataset.inline = "";
    } else if (drifting >= 0) cards[drifting].dataset.inline = "";
    else {
      // In order, because each card's margin moves the cards stacked below it.
      cards.forEach((card, i) => {
        const shift = tops[i] - card.getBoundingClientRect().top;
        if (Math.abs(shift) > 0.5) card.style.marginTop = `${parseFloat(getComputedStyle(card).marginTop) + shift}px`;
      });
      return;
    }
  }
}

function place() {
  const cards = [...document.querySelectorAll<HTMLElement>(CARDS)];
  cards.forEach((card) => {
    delete card.dataset.inline;
    card.style.marginTop = "";
  });
  if (!cards.length || getComputedStyle(cards[0]).float === "none") return; // narrow screens: all inline already

  const headings = [...document.querySelectorAll(".page.lesson h2")];
  const groups = new Map<Element | null, HTMLElement[]>();
  for (const card of cards) {
    const section = card.closest(".lesson-section");
    groups.set(section, [...(groups.get(section) ?? []), card]);
  }
  // Section by section from the top, because moving a card inline pushes down all the text after it.
  for (const group of groups.values()) placeGroup(group, headings);
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
