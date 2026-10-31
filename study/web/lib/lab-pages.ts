import type { Block } from "./types";

export type LabPage = { title: string; part: string | null; blocks: Block[] };

const PART = /^(Part \d+):\s*(.+)$/;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// A lab is one README, cut into one page per "##" heading. Text before the first heading opens the first page.
// "## Part 1: write it" gives the page the title "Write it" in the group "Part 1", and a later heading
// without a part stays in that group. Smaller headings move down one level, under the page's title.
export function splitLabPages(blocks: Block[]): LabPage[] {
  const pages: LabPage[] = [];
  let opening: Block[] = [];
  let part: string | null = null;
  for (const block of blocks) {
    if (block.type === "heading" && block.level <= 2) {
      const match = block.text.match(PART);
      if (match) part = match[1];
      pages.push({ title: capitalize(match ? match[2] : block.text), part, blocks: opening });
      opening = [];
    } else {
      const moved = block.type === "heading" ? { ...block, level: block.level + 1 } : block;
      if (pages.length > 0) pages[pages.length - 1].blocks.push(moved);
      else opening.push(moved);
    }
  }
  return pages.length > 0 ? pages : [{ title: "The lab", part: null, blocks: opening }];
}
