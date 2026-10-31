import { GlossaryBrowser, type GlossaryItem, type GlossaryLecture } from "@/components/GlossaryBrowser";
import { loadCourse } from "@/lib/course";

export default function GlossaryPage() {
  const course = loadCourse();
  const lectureOf = new Map(course.topics.map((topic) => [topic.id, topic.lectureId]));
  const entries: GlossaryItem[] = course.glossary.map((entry) => ({
    ...entry,
    lectureId: lectureOf.get(entry.topic) ?? null,
    hasLesson: lectureOf.has(entry.topic),
  }));
  const lectures: GlossaryLecture[] = course.lectures
    .filter((lecture) => entries.some((entry) => entry.lectureId === lecture.id))
    .map((lecture) => ({ id: lecture.id, label: `Lecture ${lecture.number}` }));

  return (
    <article className="page glossary">
      <header className="masthead">
        <h1>Glossary</h1>
      </header>
      <p className="lead">Every word the lessons use, in plain language. Look one up, or cover the meanings and test yourself.</p>
      <GlossaryBrowser entries={entries} lectures={lectures} />
    </article>
  );
}
