import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const TOPICS = fileURLToPath(new URL("../../content/topics/", import.meta.url));

// A reading question can sit in the side column, away from the text it follows, so its wording
// must not send the reader to something "above" or to "the diagram".
const POINTS_AWAY = /\b(above|below|earlier|previous|the (diagram|figure|table|picture|boxes)|(the|this|that) (code|example|snippet)|heap version|stack version)\b/i;

function readingPrompts(source: string) {
  const prompts: string[] = [];
  let practice = false;
  const lines = source.split("\n");
  lines.forEach((line, index) => {
    if (line.startsWith(":::problem")) practice = true;
    if (line.startsWith("## ")) practice = false;
    if (!line.startsWith(":::check") || practice) return;
    const prompt: string[] = [];
    for (let at = index + 1; !lines[at].startsWith("- [") && lines[at] !== ":::"; at += 1) prompt.push(lines[at]);
    prompts.push(prompt.join(" "));
  });
  return prompts;
}

describe("reading questions", () => {
  for (const file of readdirSync(TOPICS).filter((name) => name.endsWith(".md"))) {
    it(`${file} questions stand on their own`, () => {
      const prompts = readingPrompts(readFileSync(TOPICS + file, "utf8"));
      expect(prompts.filter((prompt) => POINTS_AWAY.test(prompt))).toEqual([]);
    });
  }
});
