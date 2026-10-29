import Link from "next/link";
import { Inline } from "@/lib/inline";

// `kicker` and `go` replace the default "Next lesson" / "Lesson 03" wording, for a hop to a lecture's practice.
export type LessonHop = { href: string; title: string; num: string; kicker?: string; go?: string };

function DirectionMark({ way }: { way: "back" | "forward" }) {
  const ltr = way === "back" ? "←" : "→";
  const rtl = way === "back" ? "→" : "←";
  return (
    <span aria-hidden="true">
      <span className="rtl:hidden">{ltr}</span>
      <span className="hidden rtl:inline">{rtl}</span>
    </span>
  );
}

function LessonCard({ lesson, side }: { lesson: LessonHop; side: "prev" | "next" }) {
  const isPrev = side === "prev";
  const copy = (
    <span className="chapter-hop-copy">
      <span className="chapter-hop-kicker">{lesson.kicker ?? (isPrev ? "Previous lesson" : "Next lesson")}</span>
      <span className="chapter-hop-title" data-vt-title>
        <Inline text={lesson.title} />
      </span>
    </span>
  );
  const go = (
    <span className="chapter-hop-go">
      {isPrev ? (
        <>
          <DirectionMark way="back" />
          Lesson {lesson.num}
        </>
      ) : (
        <>
          {lesson.go ?? `Lesson ${lesson.num}`}
          <DirectionMark way="forward" />
        </>
      )}
    </span>
  );
  return (
    <Link className={`chapter-hop is-${side}${lesson.go ? " is-practice" : ""}`} href={lesson.href}>
      {isPrev ? (
        <>
          {go}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {go}
        </>
      )}
    </Link>
  );
}

export function ReadingFooter({
  previousLesson,
  nextLesson,
}: {
  previousLesson: LessonHop | null;
  nextLesson: LessonHop | null;
}) {
  if (!previousLesson && !nextLesson) return null;
  return (
    <nav className="chapter-foot" aria-label="Continue reading">
      <div className="chapter-hops">
        {previousLesson && <LessonCard lesson={previousLesson} side="prev" />}
        {nextLesson && <LessonCard lesson={nextLesson} side="next" />}
      </div>
    </nav>
  );
}
