import { notFound } from "next/navigation";
import { Chapter } from "@/components/Chapter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SideCards } from "@/components/SideCards";
import { Visit } from "@/components/Visit";
import { Mixed } from "@/lib/bidi";
import { loadCourse } from "@/lib/course";

export function generateStaticParams() {
  return loadCourse().topics.map((topic) => ({ slug: topic.id }));
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = loadCourse();
  const index = course.topics.findIndex((topic) => topic.id === slug);
  if (index < 0) notFound();
  const topic = course.topics[index];
  const previous = course.topics[index - 1];
  const next = course.topics[index + 1];
  return (
    <article className="page chapter lesson">
      <Visit courseId={course.id} slug={topic.id} />
      <SideCards />
      <ScrollReveal selector=".page.lesson :is(.formal, .card.check, .callout):not(.practice *)" step={0} />
      <header className="masthead">
        <h1><Mixed text={topic.title} /></h1>
      </header>
      <Chapter
        blocks={topic.blocks}
        courseId={course.id}
        previousLesson={previous ? { href: `/topics/${previous.id}`, title: previous.title, num: String(previous.lessonNumber).padStart(2, "0") } : null}
        nextLesson={next ? { href: `/topics/${next.id}`, title: next.title, num: String(next.lessonNumber).padStart(2, "0") } : null}
      />
    </article>
  );
}
