import { Blocks } from "@/components/Blocks";
import { ReadingFooter, type LessonHop } from "@/components/SectionSwitch";
import { Inline } from "@/lib/inline";
import type { Block } from "@/lib/types";

type Slice = { id: string; title: string; blocks: Block[] };

function slug(text: string, used: Map<string, number>) {
  const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function splitAt(blocks: Block[]) {
  const intro: Block[] = [];
  const slices: Slice[] = [];
  const used = new Map<string, number>();
  for (const block of blocks) {
    if (block.type === "heading" && block.level === 2) {
      slices.push({ id: slug(block.text, used), title: block.text, blocks: [] });
    } else if (slices.length === 0) {
      intro.push(block);
    } else {
      slices[slices.length - 1].blocks.push(block);
    }
  }
  return { intro, slices };
}

export function Chapter({
  blocks,
  courseId,
  previousLesson,
  nextLesson,
}: {
  blocks: Block[];
  courseId: string;
  previousLesson: LessonHop | null;
  nextLesson: LessonHop | null;
}) {
  const { intro, slices } = splitAt(blocks);
  return (
    <>
      <Blocks blocks={intro} courseId={courseId} />
      {slices.length > 1 && (
        <nav className="toc" aria-label="On this page">
          <p className="kicker">On this page</p>
          <ol className="toc-list">
            {slices.map((slice, index) => (
              <li key={slice.id}>
                <a href={`#${slice.id}`}>
                  <span className="toc-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="toc-title"><Inline text={slice.title} /></span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {slices.map((slice) => (
        <section className="lesson-section" id={slice.id} key={slice.id}>
          <h2><Inline text={slice.title} /></h2>
          <Blocks blocks={slice.blocks} courseId={courseId} />
        </section>
      ))}
      <ReadingFooter previousLesson={previousLesson} nextLesson={nextLesson} />
    </>
  );
}
