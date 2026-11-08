"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CHIP, LEVELS, SLOT, layoutBoard, levelOf, type Level } from "@/lib/progress-board";
import { readProgress } from "@/lib/progress";

type Lesson = { id: string; title: string; lessonNumber: number; practiceIds: string[] };
type Lecture = { id: string; number: number; title: string; lessons: Lesson[] };

const TONES = ["sun", "mint", "coral", "disk"] as const;

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

// The hero picture: the student's own progress, drawn as the course's own idea. Data is fast when it is close to the
// processor. Every lesson is a block that starts on the disk, far away. As its questions get solved the block moves
// up the ladder (main memory, cache, registers) until it sits next to the processor chip. A line reaches from the chip
// down to the lesson read last. Progress lives in this browser, so the page first draws every block on the disk, then
// the blocks travel to where the saved progress puts them.
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

  const lessons = useMemo(
    () => lectures.flatMap((lecture) => lecture.lessons.map((lesson) => ({ ...lesson, lecture: lecture.number }))),
    [lectures],
  );
  const counts = lessons.map((lesson) => lesson.practiceIds.filter((id) => solved.includes(id)).length);
  const levels: Level[] = lessons.map((lesson, i) => levelOf(counts[i], lesson.practiceIds.length));
  const { places, tops, height } = layoutBoard(levels);

  const total = lessons.reduce((sum, lesson) => sum + lesson.practiceIds.length, 0);
  const done = counts.reduce((sum, n) => sum + n, 0);
  const inRegisters = levels.filter((level) => level === 0).length;
  const shown = useCountUp(done);

  // Blocks that travel the farthest leave first, so the closest ones arrive last and the board "lands" top down.
  const order = [...lessons.keys()].sort((a, b) => levels[a] - levels[b] || a - b);
  const rank = new Map(order.map((lessonIndex, position) => [lessonIndex, position]));

  const here = lessons.findIndex((lesson) => lesson.id === last);
  const reach = here >= 0 ? places[here].y - CHIP : 0;

  return (
    <figure className="pboard">
      <div className="pboard-card">
        <div
          className="pboard-stage"
          style={{ "--h": height, "--w": 12 * SLOT } as React.CSSProperties}
        >
          <div className="pboard-chip" aria-hidden="true">
            <span>CPU</span>
          </div>
          {LEVELS.map((level, index) => (
            <p className={`pboard-level tone-${TONES[index]}`} key={level.name} style={{ "--y": tops[index] } as React.CSSProperties} aria-hidden="true">
              <b>{level.name}</b>
              <span>{level.cost}</span>
            </p>
          ))}
          {here >= 0 && (
            <>
              <span
                className="pboard-wire"
                aria-hidden="true"
                style={{ "--x": places[here].x + 0.55, "--s": reach / (height - CHIP) } as React.CSSProperties}
              />
              <span
                className="pboard-ping"
                aria-hidden="true"
                style={{ "--x": places[here].x + 0.55, "--len": reach } as React.CSSProperties}
              />
            </>
          )}
          <ul className="pboard-blocks">
            {lessons.map((lesson, i) => (
              <li key={lesson.id}>
                <Link
                  href={`/topics/${lesson.id}`}
                  className={`pboard-block pboard-${TONES[levels[i]]}${i === here ? " is-here" : ""}`}
                  style={{ "--x": places[i].x, "--y": places[i].y, "--n": rank.get(i) } as React.CSSProperties}
                  title={`Lecture ${lesson.lecture}, lesson ${lesson.lessonNumber}: ${lesson.title}. ${counts[i]} of ${lesson.practiceIds.length} solved. Now in ${LEVELS[levels[i]].name.toLowerCase()}.`}
                >
                  <span aria-hidden="true">{lesson.lessonNumber}</span>
                  <span className="sr-only">
                    {lesson.title}, {counts[i]} of {lesson.practiceIds.length} solved, in {LEVELS[levels[i]].name.toLowerCase()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption>
        <span className="pboard-lead">Your lessons, moved closer to the processor.</span>
        <span aria-live="polite">
          {done === 0
            ? `Every lesson starts on the disk, the slowest place. Solve its questions and it moves up, until it reaches the registers.`
            : `${shown} of ${total} practice steps solved. ${inRegisters} ${inRegisters === 1 ? "lesson has" : "lessons have"} reached the registers.`}
        </span>
      </figcaption>
    </figure>
  );
}
