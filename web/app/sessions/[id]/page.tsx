import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/Blocks";
import type { RenderedStep } from "@/components/session/rendered";
import { Stepper } from "@/components/session/Stepper";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";
import { splitLabPages } from "@/lib/lab-pages";
import type { Block, Lecture, SessionStep } from "@/lib/types";

// Next's static export treats an empty list as "missing", so a course with no
// sessions yet gets one placeholder page that says so.
const NO_SESSIONS = "none";

export function generateStaticParams() {
  const ids = loadCourse().sessions.map((session) => ({ id: session.id }));
  return ids.length > 0 ? ids : [{ id: NO_SESSIONS }];
}

function SessionIntro({ title, lecture, summary }: { title: string; lecture?: Lecture; summary: string }) {
  return (
    <header className="session-intro">
      {lecture && <p className="kicker">Lecture {lecture.number} · Step 2 of 2: practice</p>}
      <h1><Mixed text={title} /></h1>
      {lecture && (
        <div className="session-before">
          <p>
            <strong>Read the lessons first.</strong> This practice does not teach anything new. It makes you
            use the {lecture.lessons.length} lessons of Lecture {lecture.number}: {summary}.
          </p>
          <ol className="session-lessons">
            {lecture.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/topics/${lesson.id}`}>
                  <span>{String(lesson.lessonNumber).padStart(2, "0")}</span>
                  <Mixed text={lesson.title} />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </header>
  );
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = loadCourse();
  const session = course.sessions.find((item) => item.id === id);
  if (!session) {
    if (id !== NO_SESSIONS) notFound();
    return (
      <article className="page chapter">
        <p>There are no sessions yet.</p>
      </article>
    );
  }
  const courseId = course.id;
  const lecture = course.lectures.find((item) => item.id === session.lectureId);
  const lessonOf = new Map(course.topics.map((topic) => [topic.id, topic]));
  const count = (kind: SessionStep["kind"]) => session.steps.filter((step) => step.kind === kind).length;
  const recaps = session.steps.filter((step) => step.kind === "learn" && step.id.includes("#")).length;
  const parts = [
    [recaps, "short recap", "short recaps"],
    [count("check"), "quick question", "quick questions"],
    [count("exercise"), "coding exercise", "coding exercises"],
    [count("lab"), "lab", "labs"],
  ] as const;
  const render = (blocks: Block[], key?: string | number) => <Blocks key={key} blocks={blocks} courseId={courseId} />;
  const renderStep = (step: SessionStep): RenderedStep => {
    switch (step.kind) {
      case "learn": {
        // A recap is a section copied from a lesson, so it links back to the full lesson.
        const [topicId, section] = step.id.replace(/^learn:/, "").split("#");
        const topic = section ? lessonOf.get(topicId) : undefined;
        if (!topic) return { content: render(step.blocks) };
        return {
          content: (
            <>
              {render(step.blocks)}
              <p className="session-source">
                From Lesson {String(topic.lessonNumber).padStart(2, "0")},{" "}
                <Link href={`/topics/${topic.id}#${section}`}><Mixed text={topic.title} /></Link>. Open it if this recap feels new.
              </p>
            </>
          ),
        };
      }
      case "check":
        return { content: render([step.block]) };
      case "lab":
        return { labPages: splitLabPages(step.lab.body).map((page) => ({ title: page.title, part: page.part, content: render(page.blocks) })) };
      case "exercise":
        return {
          content: render(step.exercise.statement),
          hints: step.exercise.hints.map((blocks, index) => render(blocks, index)),
          examples: step.exercise.examples.map((blocks, index) => render(blocks, index)),
          caseHints: Object.fromEntries(Object.entries(step.exercise.caseHints).map(([name, blocks]) => [name, render(blocks)])),
        };
    }
  };
  const lessonLink = (step: SessionStep) => {
    const topic = step.lesson ? lessonOf.get(step.lesson) : undefined;
    return topic ? { lesson: { id: topic.id, title: topic.title } } : {};
  };
  const rendered = Object.fromEntries(session.steps.map((step) => [step.id, { ...renderStep(step), ...lessonLink(step) }]));
  return (
    <article className="page chapter">
      <Stepper session={session} courseId={course.id} harness={course.harness} rendered={rendered} lectureNumber={lecture?.number ?? null} intro={<SessionIntro title={session.title} lecture={lecture} summary={parts.filter(([n]) => n > 0).map(([n, one, many]) => `${n} ${n === 1 ? one : many}`).join(", ")} />} />
    </article>
  );
}
