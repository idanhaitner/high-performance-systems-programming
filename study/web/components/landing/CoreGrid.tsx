"use client";

import { useEffect, useRef } from "react";

const COLS = 7;
const ROWS = 6;
const TONES = ["mint", "sun", "coral", "accent"];

// The hero picture: a board of workers, one square each. A wave of work rolls across it by itself.
// Point at it and the squares near you take on work; click and a job runs on all of them at once.
// With reduced motion the board stays still, and it still reads as a grid of workers.
export function CoreGrid() {
  const board = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = board.current;
    if (!element || !matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const cells = [...element.querySelectorAll<HTMLElement>(".core")];
    let frame = 0;
    let target: { x: number; y: number } | null = null;
    let timer = 0;

    const paint = () => {
      frame = 0;
      let busy = 0;
      for (const cell of cells) {
        const box = cell.getBoundingClientRect();
        const near = target ? Math.max(0, 1 - Math.hypot(target.x - (box.left + box.width / 2), target.y - (box.top + box.height / 2)) / 150) : 0;
        if (near > 0.3) busy += 1;
        cell.style.setProperty("--lit", near.toFixed(2));
      }
      if (count.current) count.current.textContent = String(element.classList.contains("is-run") ? cells.length : busy);
    };
    const ask = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onMove = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY };
      ask();
    };
    const onLeave = () => {
      target = null;
      ask();
    };
    const onRun = () => {
      element.classList.remove("is-run");
      void element.offsetWidth;
      element.classList.add("is-run");
      clearTimeout(timer);
      timer = window.setTimeout(() => element.classList.remove("is-run"), 1600);
      if (count.current) count.current.textContent = String(cells.length);
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("click", onRun);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("click", onRun);
      element.classList.remove("is-run");
      for (const cell of cells) cell.style.removeProperty("--lit");
    };
  }, []);

  return (
    <figure className="cores">
      <div className="core-board" ref={board} role="img" aria-label={`A board of ${COLS * ROWS} squares. Each square is one worker doing a piece of a job at the same time.`}>
        {Array.from({ length: ROWS * COLS }, (_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          return (
            <span
              key={index}
              className={`core core-${TONES[(row + col) % TONES.length]}`}
              style={{ "--wave": `${((row + col) * 0.14).toFixed(2)}s`, "--run": `${((row + col) * 0.05).toFixed(2)}s` } as React.CSSProperties}
            />
          );
        })}
      </div>
      <figcaption>
        <span className="core-live"><span ref={count}>0</span> of {COLS * ROWS} workers on your task</span>
        <span className="core-hint">Point at the board to hand out work. Click to run a job on every worker at once.</span>
      </figcaption>
    </figure>
  );
}
