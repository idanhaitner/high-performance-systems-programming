"use client";

import { useEffect, useRef, useState } from "react";
import { readProgress } from "@/lib/progress";

type Lesson = { id: string; title: string; lessonNumber: number; practiceIds: string[] };
type Lecture = { id: string; number: number; title: string; lessons: Lesson[] };

const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // the angle between neighbouring seeds in a sunflower
const BACKDROP = [19, 18, 9]; // #131209
const clamp = (v: number) => Math.max(0, Math.min(1, v));

// A soft glowing dot, drawn once per colour and stamped many times.
function sprite(color: string) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "#fff");
  grad.addColorStop(0.18, color);
  grad.addColorStop(0.5, color + "55");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

// Read a theme colour as #rrggbb so a sprite can add alpha to it.
function hex(el: Element, name: string, fallback: string) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.fillStyle = "#000";
  probe.fillStyle = raw || fallback;
  const value = probe.fillStyle as string;
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

// The hero picture: your progress as a flower of light. Every practice step is a seed on a golden-angle spiral, with
// lecture 1 at the heart and later lectures spiralling outward. A step you have not solved is a faint speck. A step
// you solved ignites, in order, and keeps glowing with a trail as the whole spiral turns. A slow wave of light rolls
// out from the centre, and the pointer stirs the seeds near it. With reduced motion it is one still picture.
export function ProgressBoard({ courseId, lectures }: { courseId: string; lectures: Lecture[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [last, setLast] = useState<string | undefined>();

  // Every step in course order, tagged with its lecture and lesson.
  const steps = lectures.flatMap((lecture, lectureIndex) =>
    lecture.lessons.flatMap((lesson) => lesson.practiceIds.map((id) => ({ id, lesson: lesson.id, tone: lectureIndex % 3 }))),
  );
  const total = steps.length;
  const done = steps.filter((step) => solved.includes(step.id)).length;

  useEffect(() => {
    const sync = () => {
      const progress = readProgress(courseId);
      setSolved(progress.solved);
      setLast(progress.last);
    };
    sync();
    window.addEventListener("study-progress", sync);
    return () => window.removeEventListener("study-progress", sync);
  }, [courseId]);

  // The drawing keeps the latest steps in a ref so the animation loop never restarts when progress changes.
  const live = useRef({ steps, solved, last });
  live.current = { steps, solved, last };

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let colors = ["#ffd24a", "#3ddc97", "#ff6b57", "#8f86ff"];
    let sprites: HTMLCanvasElement[] = [];
    const paint = () => {
      colors = [hex(el, "--sun", "#ffd24a"), hex(el, "--mint", "#3ddc97"), hex(el, "--coral", "#ff6b57"), hex(el, "--accent", "#8f86ff")];
      sprites = colors.map(sprite);
    };
    paint();
    const theme = new MutationObserver(paint);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let size = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      size = el.clientWidth;
      el.width = el.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = `rgb(${BACKDROP})`;
      ctx.fillRect(0, 0, size, size);
    };
    resize();
    const observer = new ResizeObserver(() => { resize(); if (reduced) frame(0, 0); });
    observer.observe(el);

    const lit: number[] = []; // how brightly each seed glows, 0 to 1
    const bornAt: number[] = []; // when each solved seed starts to ignite
    let first = true;
    let pointer: { x: number; y: number } | null = null;
    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const onLeave = () => { pointer = null; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    const frame = (t: number, dt: number) => {
      const { steps: all, solved: done, last: here } = live.current;
      const n = all.length || 1;
      const R = size * 0.46;
      const cx = size / 2;
      const cy = size / 2;
      const turn = reduced ? 0 : t * 0.00014;
      const breathe = reduced ? 1 : 1 + 0.018 * Math.sin(t * 0.0006);
      const lastLesson = all.filter((step) => step.lesson === here);

      // Fade the last picture instead of clearing it. That leaves a soft trail behind every moving seed.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(${BACKDROP}, ${reduced ? 1 : 0.1})`;
      ctx.fillRect(0, 0, size, size);
      ctx.globalCompositeOperation = "lighter";

      const wave = ((t * 0.00016) % 1.5) - 0.2; // a ring of light moving out from the centre

      all.forEach((step, i) => {
        const radius = R * Math.sqrt((i + 0.5) / n) * breathe;
        const angle = i * GOLDEN + turn;
        let x = cx + Math.cos(angle) * radius;
        let y = cy + Math.sin(angle) * radius;
        const isSolved = done.includes(step.id);

        if (isSolved && bornAt[i] === undefined) bornAt[i] = first ? t + 500 + i * 38 : t;
        if (!isSolved) bornAt[i] = undefined as unknown as number;
        const target = isSolved && t >= bornAt[i] ? 1 : 0;
        lit[i] = reduced ? target : (lit[i] ?? 0) + (target - (lit[i] ?? 0)) * (1 - Math.exp(-dt * 0.0035));

        const ring = Math.exp(-Math.pow(radius / R - wave, 2) / 0.006);
        let near = 0;
        if (pointer) {
          const d = Math.hypot(pointer.x - x, pointer.y - y);
          near = clamp(1 - d / 80);
          x += ((x - pointer.x) / (d + 1)) * near * 6;
          y += ((y - pointer.y) / (d + 1)) * near * 6;
        }

        const glow = lit[i] ?? 0;
        if (glow > 0.01) {
          const pulse = reduced ? 1 : 0.82 + 0.18 * Math.sin(t * 0.0021 + i * 0.7);
          const grow = (7 + 7 * glow * pulse + ring * 6 + near * 6) * (1 + (lastLesson.includes(step) ? 0.55 : 0));
          ctx.globalAlpha = clamp(glow * (0.8 + near * 0.2));
          const s = sprites[step.tone] ?? sprites[0];
          ctx.drawImage(s, x - grow, y - grow, grow * 2, grow * 2);
        }
        // Every seed, solved or not, is also a small bright speck, so the empty spiral still reads as a spiral.
        ctx.globalAlpha = clamp(0.2 + ring * 0.7 + near * 0.6 + glow * 0.4);
        const dot = 1.4 + ring * 1.8 + near * 1.6;
        ctx.drawImage(sprites[3], x - dot * 2, y - dot * 2, dot * 4, dot * 4);
      });
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      frame(0, 0);
      // A still picture still has to show progress: light every solved seed at once.
      const { steps: all, solved: done } = live.current;
      all.forEach((step, i) => { lit[i] = done.includes(step.id) ? 1 : 0; });
      frame(0, 0);
      return () => { observer.disconnect(); theme.disconnect(); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); };
    }

    let raf = 0;
    let before = performance.now();
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
    io.observe(el);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(64, now - before);
      before = now;
      if (!onScreen || document.hidden) return;
      frame(now, dt);
      first = false;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      observer.disconnect();
      theme.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <figure className="pboard">
      <canvas
        ref={canvas}
        className="pboard-canvas"
        role="img"
        aria-label={`A spiral of ${total} points of light, one for each practice step. ${done} of them are lit because you solved them.`}
      />
      <figcaption>
        <span className="pboard-lead">Every light is a step you can solve.</span>
        <span aria-live="polite">
          {done === 0
            ? "The flower starts dark. Solve a question or an exercise and its light switches on."
            : `${done} of ${total} lit. The flower grows brighter with every step you solve.`}
        </span>
      </figcaption>
    </figure>
  );
}
