import { notFound } from "next/navigation";
import { Blocks } from "@/components/Blocks";
import type { RenderedStep } from "@/components/session/rendered";
import { Stepper } from "@/components/session/Stepper";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";
import type { Block, SessionStep } from "@/lib/types";

// Next's static export treats an empty list as "missing", so a course with no
// sessions yet gets one placeholder page that says so.
const NO_SESSIONS = "none";

export function generateStaticParams() {
  const ids = loadCourse().sessions.map((session) => ({ id: session.id }));
  return ids.length > 0 ? ids : [{ id: NO_SESSIONS }];
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
  const render = (blocks: Block[], key?: string | number) => <Blocks key={key} blocks={blocks} courseId={courseId} />;
  const renderStep = (step: SessionStep): RenderedStep => {
    switch (step.kind) {
      case "learn":
        return { content: render(step.blocks) };
      case "check":
        return { content: render([step.block]) };
      case "lab":
        return { content: render(step.lab.body) };
      case "exercise":
        return {
          content: render(step.exercise.statement),
          hints: step.exercise.hints.map((blocks, index) => render(blocks, index)),
          caseHints: Object.fromEntries(Object.entries(step.exercise.caseHints).map(([name, blocks]) => [name, render(blocks)])),
        };
    }
  };
  const rendered = Object.fromEntries(session.steps.map((step) => [step.id, renderStep(step)]));
  return (
    <article className="page chapter">
      <header className="masthead">
        <p className="kicker">Guided session</p>
        <h1><Mixed text={session.title} /></h1>
      </header>
      <Stepper session={session} courseId={course.id} harness={course.harness} rendered={rendered} />
    </article>
  );
}
