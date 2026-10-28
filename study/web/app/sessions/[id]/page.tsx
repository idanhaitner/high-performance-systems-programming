import { notFound } from "next/navigation";
import { Stepper } from "@/components/session/Stepper";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";

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
  return (
    <article className="page chapter">
      <header className="masthead">
        <p className="kicker">Guided session</p>
        <h1><Mixed text={session.title} /></h1>
      </header>
      <Stepper session={session} courseId={course.id} />
    </article>
  );
}
