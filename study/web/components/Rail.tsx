"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SearchBox } from "@/components/SearchBox";
import { Mixed } from "@/lib/bidi";
import { readProgress } from "@/lib/progress";
import type { SearchHit } from "@/lib/types";

type Lesson = { id: string; title: string; lessonNumber: number; practiceIds: string[] };
type LectureNav = { id: string; number: number; title: string; lessons: Lesson[] };

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
  const chaptersRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [mark, setMark] = useState<{ top: number; height: number } | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const lessons = lectures.flatMap((lecture) => lecture.lessons);
  const currentLecture =
    lectures.find((lecture) => lecture.lessons.some((lesson) => samePath(pathname, `/topics/${lesson.id}`)))?.id ??
    lectures[lectures.length - 1]?.id;
  const [expanded, setExpanded] = useState<string[]>(currentLecture ? [currentLecture] : []);

  useEffect(() => {
    if (!currentLecture) return;
    setExpanded((ids) => (ids.includes(currentLecture) ? ids : [...ids, currentLecture]));
  }, [currentLecture]);

  const toggleLecture = (id: string) =>
    setExpanded((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));

  useLayoutEffect(() => {
    const nav = chaptersRef.current;
    if (!nav) return;
    const place = () => {
      const current = nav.querySelector<HTMLElement>("a.is-current");
      if (!current || current.offsetParent === null) {
        setMark(null);
        return;
      }
      const inset = 8;
      setMark({
        top: current.offsetTop + inset,
        height: Math.max(16, current.offsetHeight - inset * 2),
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [pathname, open, expanded]);

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
        <nav className="chapters-nav" ref={chaptersRef}>
          {mark && <span className="rail-mark" style={{ top: mark.top, height: mark.height }} />}
          {lectures.map((lecture) => {
            const isOpen = expanded.includes(lecture.id);
            const ids = lecture.lessons.flatMap((lesson) => lesson.practiceIds);
            const solvedHere = ids.filter((id) => solved.includes(id)).length;
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
                  <span className="lecture-label-meta">{ids.length ? `${solvedHere}/${ids.length}` : lecture.lessons.length}</span>
                </button>
                <div className="lecture-lessons" id={`rail-${lecture.id}`}>
                  {lecture.lessons.map((lesson) => {
                    const href = `/topics/${lesson.id}`;
                    const current = samePath(pathname, href);
                    const finished = lesson.practiceIds.length > 0 && lesson.practiceIds.every((id) => solved.includes(id));
                    return (
                      <Link key={lesson.id} href={href} className={current ? "is-current" : ""}>
                        <span className={`dot${finished ? " is-done" : ""}`}>{String(lesson.lessonNumber).padStart(2, "0")}</span>
                        <span><Mixed text={lesson.title} /></span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <p className="progress-count">{total ? <>{done} / {total} exercises solved</> : ""}</p>
      </div>
    </aside>
  );
}
