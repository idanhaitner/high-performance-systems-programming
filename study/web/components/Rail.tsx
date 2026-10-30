"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchBox } from "@/components/SearchBox";
import { Mixed } from "@/lib/bidi";
import { readProgress } from "@/lib/progress";
import type { SearchHit } from "@/lib/types";

type Lesson = { id: string; title: string; lessonNumber: number; practiceIds: string[] };
type LectureNav = { id: string; number: number; title: string; lessons: Lesson[]; sessionId: string | null };

function samePath(pathname: string, href: string) {
  const trim = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);
  return trim(pathname) === trim(href);
}

function narrowScreen() {
  return window.matchMedia("(max-width: 800px)").matches;
}

export function Rail({
  courseId,
  title,
  lectures,
  hits,
}: {
  courseId: string;
  title: string;
  lectures: LectureNav[];
  hits: SearchHit[];
}) {
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const lessons = lectures.flatMap((lecture) => lecture.lessons);
  const inLecture = lectures.find(
    (lecture) =>
      lecture.lessons.some((lesson) => samePath(pathname, `/topics/${lesson.id}`)) ||
      (lecture.sessionId !== null && samePath(pathname, `/sessions/${lecture.sessionId}`)),
  );
  const currentLecture = inLecture?.id ?? lectures[lectures.length - 1]?.id;
  const currentLesson = inLecture?.lessons.find((lesson) => samePath(pathname, `/topics/${lesson.id}`));
  const [expanded, setExpanded] = useState<string[]>(currentLecture ? [currentLecture] : []);

  useEffect(() => {
    if (!currentLecture) return;
    setExpanded((ids) => (ids.includes(currentLecture) ? ids : [...ids, currentLecture]));
  }, [currentLecture]);

  const toggleLecture = (id: string) =>
    setExpanded((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const main = document.getElementById("content");
    const query = window.matchMedia("(max-width: 800px)");
    const apply = () => {
      const lock = open && query.matches;
      if (lock) main?.setAttribute("inert", "");
      else main?.removeAttribute("inert");
      document.body.style.overflow = lock ? "hidden" : "";
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    apply();
    query.addEventListener("change", apply);
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      query.removeEventListener("change", apply);
      window.removeEventListener("keydown", onKey);
      main?.removeAttribute("inert");
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !narrowScreen()) return;
    const panel = document.getElementById("rail-panel");
    const current = panel?.querySelector<HTMLElement>("a.is-current");
    if (!panel || !current) return;
    const panelBox = panel.getBoundingClientRect();
    const linkBox = current.getBoundingClientRect();
    if (linkBox.top < panelBox.top) panel.scrollTop += linkBox.top - panelBox.top - 12;
    else if (linkBox.bottom > panelBox.bottom) panel.scrollTop += linkBox.bottom - panelBox.bottom + 12;
  }, [open, pathname]);

  useEffect(() => {
    const sync = () => setSolved(readProgress(courseId).solved);
    sync();
    window.addEventListener("study-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("study-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [courseId]);

  const total = lessons.reduce((sum, lesson) => sum + lesson.practiceIds.length, 0);
  const done = lessons.reduce(
    (sum, lesson) => sum + lesson.practiceIds.filter((id) => solved.includes(id)).length,
    0,
  );

  return (
    <aside className={`rail${open ? " is-open" : ""}`}>
      <div className="rail-bar">
        <button
          ref={toggleRef}
          type="button"
          className="rail-toggle"
          aria-expanded={open}
          aria-controls="rail-panel"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="rail-toggle-icon" aria-hidden="true" />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
        <p className="course-name"><Link href="/"><Mixed text={title} /></Link></p>
      </div>
      <div
        className="rail-panel"
        id="rail-panel"
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
        }}
      >
        <SearchBox hits={hits} />
        <nav className="rail-nav">
          <Link className={samePath(pathname, "/") ? "is-current" : ""} href="/">Overview</Link>
          <Link className={samePath(pathname, "/glossary") ? "is-current" : ""} href="/glossary">Glossary</Link>
        </nav>
        <p className="rail-label">Lectures</p>
        {inLecture && currentLesson && (
          <div className="rail-deck" aria-hidden="true">
            <span />
            <span />
            <strong>
              {currentLesson.lessonNumber}
              <small>Lecture {inLecture.number}</small>
            </strong>
            <p>
              <strong>{currentLesson.lessonNumber} of {inLecture.lessons.length}</strong>
              lessons
            </p>
          </div>
        )}
        <nav className="chapters-nav" aria-label="Lectures">
          {lectures.map((lecture) => {
            const isOpen = expanded.includes(lecture.id);
            const ids = lecture.lessons.flatMap((lesson) => lesson.practiceIds);
            const solvedHere = ids.filter((id) => solved.includes(id)).length;
            const finished = ids.length > 0 && solvedHere === ids.length;
            return (
              <div className={`lecture-group${isOpen ? " is-open" : ""}`} key={lecture.id}>
                <button
                  type="button"
                  className="lecture-label"
                  aria-expanded={isOpen}
                  aria-controls={`rail-${lecture.id}`}
                  onClick={() => toggleLecture(lecture.id)}
                >
                  <span className="lecture-label-kicker">Lecture {String(lecture.number).padStart(2, "0")}</span>
                  <span><Mixed text={lecture.title} /></span>
                  <span className="lecture-label-meta">
                    {finished ? (
                      <span className="lecture-done-mark">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                        </svg>
                        <span className="sr-only">Finished</span>
                      </span>
                    ) : ids.length ? <><span className="sr-only">Checks solved: </span>{solvedHere}/{ids.length}</> : lecture.lessons.length}
                  </span>
                </button>
                <div className="lecture-lessons" id={`rail-${lecture.id}`}>
                  {lecture.lessons.map((lesson) => {
                    const href = `/topics/${lesson.id}`;
                    const current = samePath(pathname, href);
                    const finished = lesson.practiceIds.length > 0 && lesson.practiceIds.every((id) => solved.includes(id));
                    return (
                      <Link key={lesson.id} href={href} className={current ? "is-current" : ""}>
                        <span className={`dot${finished ? " is-done" : ""}`}>
                          {finished ? (
                            <svg className="dot-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="finished">
                              <path d="M3 8.5 6.5 12 13 4.5" />
                            </svg>
                          ) : (
                            lesson.lessonNumber
                          )}
                        </span>
                        <span><Mixed text={lesson.title} /></span>
                      </Link>
                    );
                  })}
                  {lecture.sessionId && (
                    <Link
                      href={`/sessions/${lecture.sessionId}/`}
                      className={`rail-session${samePath(pathname, `/sessions/${lecture.sessionId}`) ? " is-current" : ""}`}
                    >
                      <span className="dot" aria-hidden="true">
                        <svg className="dot-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.5v9l7.5-4.5z" /></svg>
                      </span>
                      <span>Practice<small>After the lessons</small></span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
        <p className="progress-count">{total ? <>{done} of {total} checks solved</> : ""}</p>
      </div>
    </aside>
  );
}
