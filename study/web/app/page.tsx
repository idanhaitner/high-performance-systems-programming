import Link from "next/link";
import { ChapterProgress } from "@/components/ChapterProgress";
import { Continue } from "@/components/Continue";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";

const pad = (value: number) => String(value).padStart(2, "0");

export default function HomePage() {
  const course = loadCourse();
  const lectures = course.lectures;
  return (
    <article className="page page-home">
      <p className="kicker">Course</p>
      <h1><Mixed text={course.title} /></h1>
      <p className="lead"><Mixed text={course.summary} /></p>
      <Continue
        courseId={course.id}
        chapters={lectures.flatMap((lecture) =>
          lecture.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, lecture: `Lecture ${pad(lecture.number)}` })),
        )}
      />
      {lectures.length > 1 && (
        <nav className="glossary-jump lecture-jump" aria-label="Lectures">
          {lectures.map((lecture) => (
            <a key={lecture.id} href={`#${lecture.id}`}>
              <span className="num">{pad(lecture.number)}</span>
              <Mixed text={lecture.title} />
            </a>
          ))}
        </nav>
      )}
      <div className="lecture-list">
        {lectures.map((lecture) => (
          <section className="lecture" id={lecture.id} key={lecture.id}>
            <header className="lecture-head">
              <span className="lecture-num" aria-hidden="true">{pad(lecture.number)}</span>
              <div>
                <p className="kicker">Lecture {pad(lecture.number)} · {lecture.lessons.length} lessons</p>
                <h2><Mixed text={lecture.title} /></h2>
                <p><Mixed text={lecture.summary} /></p>
                <ChapterProgress
                  courseId={course.id}
                  practiceIds={lecture.lessons.flatMap((lesson) => lesson.practiceIds)}
                />
              </div>
            </header>
            <ol className="chapter-list">
              {lecture.lessons.map((lesson, index) => (
                <li key={lesson.id} style={{ animationDelay: `${index * 45}ms` }}>
                  <Link href={`/topics/${lesson.id}`}>
                    <span className="num">{pad(lesson.lessonNumber)}</span>
                    <span>
                      <strong><Mixed text={lesson.title} /></strong>
                      {lesson.blurb && <em><Mixed text={lesson.blurb} /></em>}
                      <ChapterProgress courseId={course.id} practiceIds={lesson.practiceIds} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </article>
  );
}
