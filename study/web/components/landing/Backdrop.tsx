"use client";

import { useEffect, useRef } from "react";

// A living background for the home page, behind everything.
// 1. A grid of dots on a canvas. Dots near the pointer swell and turn the accent color, a click sends a ring
//    across the grid, and the grid drifts slower than the page as you scroll.
// 2. A few flat shapes (cards, rings, discs, plusses) that float at different depths: each one moves a different
//    amount with the scroll and with the pointer, so the page feels like it has layers.
// Everything is drawn only while something is moving, and none of it runs with reduced motion.

const SHAPES = [
  { kind: "card", tone: "mint", x: 6, y: 14, size: 64, depth: 0.22, turn: -14 },
  { kind: "ring", tone: "accent", x: 90, y: 10, size: 88, depth: 0.12, turn: 0 },
  { kind: "disc", tone: "sun", x: 94, y: 46, size: 40, depth: 0.3, turn: 0 },
  { kind: "plus", tone: "coral", x: 4, y: 52, size: 48, depth: 0.18, turn: 12 },
  { kind: "card", tone: "coral", x: 92, y: 78, size: 56, depth: 0.26, turn: 16 },
  { kind: "ring", tone: "mint", x: 8, y: 86, size: 72, depth: 0.1, turn: 0 },
  { kind: "disc", tone: "accent", x: 50, y: 94, size: 28, depth: 0.34, turn: 0 },
  { kind: "plus", tone: "sun", x: 76, y: 30, size: 36, depth: 0.2, turn: -10 },
] as const;

const GAP = 32;
const REACH = 150;

export function Backdrop() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const layer = root.current;
    if (!element || !layer) return;
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const context = element.getContext("2d");
    if (!context) return;

    const shapes = [...layer.querySelectorAll<HTMLElement>(".bd-shape")];
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let width = 0;
    let height = 0;
    let ratio = 1;
    let scroll = window.scrollY;
    // The pointer, in pixels, and its smoothed twin that the shapes follow.
    let px = -9999;
    let py = -9999;
    let sx = 0;
    let sy = 0;
    let tx = 0;
    let ty = 0;
    let ripples: { x: number; y: number; start: number }[] = [];
    let frame = 0;
    let ink = "27 23 64";
    let accent = "75 60 245";

    // Colors come from the theme, as "r g b", so dots can take any opacity.
    const readColors = () => {
      const probe = document.createElement("span");
      document.body.append(probe);
      const rgb = (name: string) => {
        probe.style.color = `var(${name})`;
        return (getComputedStyle(probe).color.match(/[\d.]+/g) ?? []).slice(0, 3).join(" ");
      };
      ink = rgb("--ink") || ink;
      accent = rgb("--accent") || accent;
      probe.remove();
    };

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now: number) => {
      frame = 0;
      // The smoothed pointer eases toward the real one, which gives the shapes their weight.
      tx = fine ? (px < 0 ? 0 : px / width - 0.5) : 0;
      ty = fine ? (py < 0 ? 0 : py / height - 0.5) : 0;
      sx += (tx - sx) * 0.08;
      sy += (ty - sy) * 0.08;

      context.clearRect(0, 0, width, height);
      const offset = (scroll * 0.18) % GAP;
      ripples = ripples.filter((ripple) => now - ripple.start < 1400);
      for (let y = -GAP + offset; y < height + GAP; y += GAP) {
        for (let x = GAP / 2; x < width + GAP; x += GAP) {
          const near = Math.max(0, 1 - Math.hypot(x - px, y - py) / REACH);
          let wave = 0;
          for (const ripple of ripples) {
            const age = (now - ripple.start) / 1400;
            const gap = Math.abs(Math.hypot(x - ripple.x, y - ripple.y) - age * 520);
            wave = Math.max(wave, Math.max(0, 1 - gap / 60) * (1 - age));
          }
          const lit = Math.max(near * near, wave);
          context.fillStyle = lit > 0.02 ? `rgb(${accent} / ${0.25 + lit * 0.75})` : `rgb(${ink} / 0.16)`;
          context.beginPath();
          context.arc(x, y, 1.5 + lit * 3.5, 0, Math.PI * 2);
          context.fill();
        }
      }

      // Each shape sits at its own depth: the nearer it is, the more it moves.
      for (const shape of shapes) {
        const depth = Number(shape.dataset.depth);
        shape.style.transform = `translate3d(${(-sx * depth * 160).toFixed(1)}px, ${(-scroll * depth - sy * depth * 120).toFixed(1)}px, 0)`;
      }

      const settling = Math.abs(tx - sx) > 0.001 || Math.abs(ty - sy) > 0.001;
      if (ripples.length || settling) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      scroll = window.scrollY;
      wake();
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      px = event.clientX;
      py = event.clientY;
      wake();
    };
    const onLeave = () => {
      px = -9999;
      py = -9999;
      wake();
    };
    const onDown = (event: PointerEvent) => {
      ripples.push({ x: event.clientX, y: event.clientY, start: performance.now() });
      wake();
    };

    readColors();
    resize();
    wake();
    const watcher = new MutationObserver(() => {
      readColors();
      wake();
    });
    watcher.observe(document.documentElement, { attributes: true });
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColors();
      wake();
    };
    scheme.addEventListener("change", onScheme);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", wake);
    return () => {
      cancelAnimationFrame(frame);
      watcher.disconnect();
      scheme.removeEventListener("change", onScheme);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", wake);
      for (const shape of shapes) shape.style.transform = "";
    };
  }, []);

  return (
    <div className="backdrop" ref={root} aria-hidden="true">
      <canvas ref={canvas} className="backdrop-dots" />
      {SHAPES.map((shape, index) => (
        <div
          key={index}
          className="bd-shape"
          data-depth={shape.depth}
          style={{ left: `${shape.x}%`, top: `${shape.y}%`, "--size": `${shape.size}px`, "--turn": `${shape.turn}deg`, "--d": `${index * -1.7}s` } as React.CSSProperties}
        >
          <span className={`bd-${shape.kind} bd-tone-${shape.tone}`} />
        </div>
      ))}
    </div>
  );
}
