import { describe, expect, it } from "vitest";
import { splitLabPages } from "./lab-pages";
import type { Block } from "./types";

const h = (level: number, text: string): Block => ({ type: "heading", level, text });
const p = (text: string): Block => ({ type: "paragraph", text });

describe("splitLabPages", () => {
  it("makes one page per main heading, and the opening text joins the first page", () => {
    const pages = splitLabPages([p("hello"), h(2, "Get ready"), p("a"), h(2, "Next thing"), p("b")]);
    expect(pages.map((page) => page.title)).toEqual(["Get ready", "Next thing"]);
    expect(pages[0].blocks).toEqual([p("hello"), p("a")]);
    expect(pages[1].blocks).toEqual([p("b")]);
  });

  it("reads the part from the heading and keeps it for later headings", () => {
    const pages = splitLabPages([h(2, "Get ready"), h(2, "Part 1: write it"), h(2, "What to write down"), h(2, "Part 2: build it")]);
    expect(pages.map((page) => [page.part, page.title])).toEqual([
      [null, "Get ready"],
      ["Part 1", "Write it"],
      ["Part 1", "What to write down"],
      ["Part 2", "Build it"],
    ]);
  });

  it("moves smaller headings down one level, under the page title", () => {
    const [page] = splitLabPages([h(2, "Get ready"), h(3, "What to do")]);
    expect(page.blocks).toEqual([h(4, "What to do")]);
  });

  it("still gives one page to a lab with no headings", () => {
    expect(splitLabPages([p("only text")])).toEqual([{ title: "The lab", part: null, blocks: [p("only text")] }]);
  });
});
