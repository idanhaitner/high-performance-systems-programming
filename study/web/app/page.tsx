import Link from "next/link";
import { Continue } from "@/components/Continue";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";

export default function HomePage() {
  const course = loadCourse();
  const lessons = course.lectures.flatMap((lecture) => lecture.lessons);
  return (
    <article className="page">
      <p className="kicker">Course</p>
      <h1><Mixed text={course.title} /></h1>
      <p className="lead"><Mixed text={course.summary} /></p>
      <Continue
        courseId={course.id}
        chapters={lessons.map((lesson) => ({ id: lesson.id, title: lesson.title }))}
      />
      <div className="lecture-list">
        {course.lectures.map((lecture) => (
          <section className="lecture-card" key={lecture.id}>
            <p className="kicker">Lecture {String(lecture.number).padStart(2, "0")}</p>
            <h2><Mixed text={lecture.title} /></h2>
            <p><Mixed text={lecture.summary} /></p>
            <ol className="chapter-list">
              {lecture.lessons.map((lesson, index) => (
                <li key={lesson.id} style={{ animationDelay: `${index * 45}ms` }}>
                  <Link href={`/topics/${lesson.id}`}>
                    <span className="num">{String(lesson.lessonNumber).padStart(2, "0")}</span>
                    <span>
                      <strong><Mixed text={lesson.title} /></strong>
                      {lesson.blurb && <em><Mixed text={lesson.blurb} /></em>}
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
