"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChapterProgress } from "@/components/ChapterProgress";
import { Mixed } from "@/lib/bidi";
import { readProgress } from "@/lib/progress";
import type { Lecture } from "@/lib/types";

export type IndexLecture = Lecture & { practiceSummary: string };

const pad = (value: number) => String(value).padStart(2, "0");
const STEPS: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

// The lectures as a card file: a column of lecture tabs beside the one open lecture, so the page stays
// the same height however many lectures the course has. Every lecture is in the HTML; only the open one shows.
// It opens on the lecture in the address (#lecture-2), else the one the student last read, else lecture 1.
export function LectureIndex({ courseId, lectures, later }: { courseId: string; lectures: IndexLecture[]; later: string }) {
  const [open, setOpen] = useState(0);
  const [live, setLive] = useState(false); // after the first switch, a newly opened lecture deals its cards in
  const [solved, setSolved] = useState<string[]>([]);
  const [last, setLast] = useState<string>();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      const progress = readProgress(courseId);
      setSolved(progress.solved);
      setLast(progress.last);
    };
    sync();
    window.addEventListener("study-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("study-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [courseId]);

  useEffect(() => {
    const atHash = () => lectures.findIndex((lecture) => `#${lecture.id}` === location.hash);
    const reading = readProgress(courseId).last;
    const start = atHash();
    if (start >= 0) {
      setOpen(start);
      // No element carries the lecture id itself, so this is the only scroll: to the top of the list, tabs included.
      // It waits for the page to finish loading, since a smooth scroll started earlier gets cut short.
      const reveal = () => requestAnimationFrame(() => document.getElementById("deck")?.scrollIntoView({ behavior: "instant" }));
      if (document.readyState === "complete") reveal();
      else window.addEventListener("load", reveal, { once: true });
    } else {
      setOpen(Math.max(0, lectures.findIndex((lecture) => lecture.lessons.some((lesson) => lesson.id === reading))));
    }
    const follow = () => {
      const index = atHash();
      if (index < 0) return;
      setOpen(index);
      setLive(true);
      document.getElementById("deck")?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [courseId, lectures]);

  // On phones the tabs are a sideways strip: keep the open one in sight without moving the page.
  useEffect(() => {
    const row = strip.current;
    const tab = tabs.current[open];
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: live ? "smooth" : "auto" });
  }, [open, live]);

  const choose = (index: number) => {
    setOpen(index);
    setLive(true);
    history.replaceState(history.state, "", `#${lectures[index].id}`);
  };

  const onKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = lectures.length;
    // Right to left, the left arrow moves forward along the strip.
    const flip = /Left|Right/.test(event.key) && getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
    const next = event.key in STEPS ? (index + STEPS[event.key] * flip + count) % count : { Home: 0, End: count - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    choose(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className={`deck-index${live ? " is-live" : ""}`}>
      <div className="deck-side">
        <div className="deck-tabs" role="tablist" aria-label="Lectures" aria-orientation="vertical" ref={strip}>
          {lectures.map((lecture, index) => {
            const ids = lecture.lessons.flatMap((lesson) => lesson.practiceIds);
            const done = ids.filter((id) => solved.includes(id)).length;
            const here = lecture.lessons.some((lesson) => lesson.id === last);
            return (
              <button
                key={lecture.id}
                ref={(node) => { tabs.current[index] = node; }}
                type="button"
                role="tab"
                id={`${lecture.id}-tab`}
                className="deck-tab"
                aria-selected={index === open}
                aria-controls={`${lecture.id}-lessons`}
                tabIndex={index === open ? 0 : -1}
                onClick={() => choose(index)}
                onKeyDown={(event) => onKey(event, index)}
              >
                <span className="deck-tab-num"><span className="sr-only">Lecture </span>{pad(lecture.number)}</span>
                <span className="deck-tab-text">
                  <strong><Mixed text={lecture.title} /></strong>
                  <span className="deck-tab-meta">
                    {lecture.lessons.length} lessons{lecture.sessionId ? " + practice" : ""}
                    {here && <span className="deck-tab-here">Your place</span>}
                  </span>
                  {done > 0 && (
                    <span className="deck-tab-bar" title={`${done} / ${ids.length} solved`}>
                      <span style={{ "--fill": done / ids.length } as React.CSSProperties} />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <p className="deck-soon">
          <span aria-hidden="true">+</span>
          {later}
        </p>
      </div>

      <div className="deck-panels">
        {lectures.map((lecture, index) => (
          <div className="deck-lecture" role="tabpanel" id={`${lecture.id}-lessons`} aria-labelledby={`${lecture.id}-tab`} hidden={index !== open} key={lecture.id}>
            <header className="deck-head">
              <span className="deck-badge" aria-hidden="true">{pad(lecture.number)}</span>
              <div>
                <h3>Lecture {lecture.number}: <Mixed text={lecture.title} /></h3>
                <p><Mixed text={lecture.summary} /></p>
                <ChapterProgress courseId={courseId} practiceIds={lecture.lessons.flatMap((lesson) => lesson.practiceIds)} />
              </div>
            </header>
            {lecture.sessionId && (
              <p className="deck-step">
                <span aria-hidden="true">1</span> First, read the lessons in order
              </p>
            )}
            <ol className="deck-grid">
              {lecture.lessons.map((lesson, lessonIndex) => (
                <li key={lesson.id} style={{ "--i": lessonIndex } as React.CSSProperties}>
                  <Link href={`/topics/${lesson.id}`}>
                    <span className="deck-num">{pad(lesson.lessonNumber)}</span>
                    <strong data-vt-title><Mixed text={lesson.title} /></strong>
                    {lesson.blurb && <span className="deck-blurb"><Mixed text={lesson.blurb} /></span>}
                    <ChapterProgress courseId={courseId} practiceIds={lesson.practiceIds} />
                  </Link>
                </li>
              ))}
            </ol>
            {lecture.sessionId && (
              <>
                <p className="deck-step">
                  <span aria-hidden="true">2</span> Then, do the practice
                </p>
                <Link className="deck-practice" href={`/sessions/${lecture.sessionId}/`}>
                  <strong>Lecture {lecture.number} practice</strong>
                  <span>{lecture.practiceSummary}</span>
                  <span className="deck-practice-go">Start practice <span aria-hidden="true">→</span></span>
                </Link>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
