import { describe, expect, it } from "vitest";
import { groupByLetter, letterOf, linkDefinition, searchTerms, sortName } from "@/lib/glossary";
import type { GlossaryEntry } from "@/lib/types";

function entry(term: string, definition = "", code = false): GlossaryEntry {
  return { term, definition, code, topic: "t", topicTitle: "T", anchor: term.replace(/\W+/g, "-") };
}

describe("filing terms by letter", () => {
  it("ignores leading punctuation", () => {
    expect(sortName(".bss")).toBe("bss");
    expect(letterOf("#define")).toBe("D");
    expect(letterOf("void *")).toBe("V");
  });

  it("groups in alphabetical order regardless of case and punctuation", () => {
    const groups = groupByLetter([entry("NULL"), entry("heap"), entry(".bss"), entry("byte"), entry("#define")]);
    expect(groups.map((group) => group.letter)).toEqual(["B", "D", "H", "N"]);
    expect(groups[0].entries.map((item) => item.term)).toEqual([".bss", "byte"]);
  });
});

describe("searching", () => {
  const all = [entry("heap", "Memory you ask for."), entry("malloc", "Reserves heap memory."), entry("stack overflow", "A crash."), entry("stack", "Local variables.")];

  it("puts terms named by the search before terms that mention it", () => {
    expect(searchTerms(all, "heap").map((item) => item.term)).toEqual(["heap", "malloc"]);
    expect(searchTerms(all, " STACK ").map((item) => item.term)).toEqual(["stack", "stack overflow"]);
  });

  it("finds a code term without its punctuation", () => {
    expect(searchTerms([entry(".bss")], "bss")).toHaveLength(1);
  });

  it("returns nothing when no term matches", () => {
    expect(searchTerms(all, "quantum")).toEqual([]);
  });
});

describe("linking the words a meaning uses", () => {
  const links = (target: GlossaryEntry, all: GlossaryEntry[]) =>
    linkDefinition(target, [target, ...all]).filter((part) => part.anchor).map((part) => part.text);

  it("keeps the whole meaning, in order", () => {
    const target = entry("pointer", "A variable whose value is an address.");
    const parts = linkDefinition(target, [target, entry("address")]);
    expect(parts.map((part) => part.text).join("")).toBe(target.definition);
    expect(parts[1]).toEqual({ text: "address", anchor: "address" });
  });

  it("links plurals of plain words, once each", () => {
    expect(links(entry("byte", "Eight bits, and more bits."), [entry("bit")])).toEqual(["bits"]);
  });

  it("does not link a term inside a longer word", () => {
    expect(links(entry("x", "An orbit and a habit."), [entry("bit")])).toEqual([]);
  });

  it("prefers the longest term", () => {
    expect(links(entry("x", "A stack overflow crash."), [entry("stack"), entry("stack overflow")])).toEqual(["stack overflow"]);
  });

  it("matches code exactly as typed", () => {
    expect(links(entry("x", "Free memory with free."), [entry("free", "", true)])).toEqual(["free"]);
    const parts = linkDefinition(entry("x", "Free memory with free."), [entry("free", "", true)]);
    expect(parts[0].text).toBe("Free memory with ");
  });

  it("does not link a term to itself or a word to a dotted name", () => {
    expect(links(entry("text", "Plain text and .text."), [])).toEqual([]);
    expect(links(entry("x", "Plain text here."), [entry(".text", "", true)])).toEqual([]);
  });

  it("stops after the first three links", () => {
    expect(links(entry("x", "a b c d"), [entry("a"), entry("b"), entry("c"), entry("d")])).toEqual(["a", "b", "c"]);
  });
});
