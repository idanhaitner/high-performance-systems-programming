"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readProgress } from "@/lib/progress";

type Lesson = { id: string; title: string; practiceIds: string[] };
type Lecture = { id: string; number: number; title: string; lessons: Lesson[] };

// Count up to a number in about a second, easing out. With reduced motion it jumps straight there.
function useCountUp(target: number) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    let frame = 0;
    const from = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - from) / 1100);
      setShown(Math.round(target * (1 - Math.pow(1 - t, 4))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return shown;
}

// The hero picture: the student's own progress. Every lesson is a tile that fills from the bottom as its
// questions are solved, grouped in one row per lecture. The tile for the lesson they read last pulses.
// Progress lives in this browser, so the board is empty on the server and fills in right after the page loads.
export function ProgressBoard({ courseId, lectures }: { courseId: string; lectures: Lecture[] }) {
  const [solved, setSolved] = useState<string[]>([]);
  const [last, setLast] = useState<string | undefined>();

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

  const total = lectures.reduce((sum, lecture) => sum + lecture.lessons.reduce((n, lesson) => n + lesson.practiceIds.length, 0), 0);
  const done = lectures.reduce(
    (sum, lecture) => sum + lecture.lessons.reduce((n, lesson) => n + lesson.practiceIds.filter((id) => solved.includes(id)).length, 0),
    0,
  );
  const shown = useCountUp(done);
  let index = 0;

  return (
    <figure className="pboard">
      <div className="pboard-card">
        <p className="pboard-count" aria-live="polite">
          <strong>{shown}</strong>
          <span>of {total} practice steps solved</span>
        </p>
        <div className="pboard-rows">
          {lectures.map((lecture) => (
            <div className="pboard-row" key={lecture.id}>
              <span className="pboard-label">Lecture {lecture.number}</span>
              <ul className="pboard-tiles">
                {lecture.lessons.map((lesson) => {
                  const ids = lesson.practiceIds;
                  const count = ids.filter((id) => solved.includes(id)).length;
                  const fill = ids.length ? count / ids.length : 0;
                  const style = { "--fill": fill, "--i": index++ } as React.CSSProperties;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/topics/${lesson.id}`}
                        className={`pboard-tile${fill === 1 ? " is-done" : ""}${lesson.id === last ? " is-here" : ""}`}
                        style={style}
                        title={`${lesson.title}: ${count} of ${ids.length} solved`}
                      >
                        <span className="pboard-fill" />
                        <span className="sr-only">{lesson.title}, {count} of {ids.length} solved</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <figcaption>
        {done === 0
          ? "Your board starts empty. Each tile is a lesson, and it fills as you solve its questions and exercises."
          : "Each tile is a lesson. It fills as you solve its questions and exercises. The pulsing tile is where you stopped."}
      </figcaption>
    </figure>
  );
}
