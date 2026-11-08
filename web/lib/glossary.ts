import type { GlossaryEntry } from "@/lib/types";

const OTHER = "#";
const MAX_LINKS = 3;

// The word a reader would file a term under: ".bss" goes under B, "#define" under D.
export function sortName(term: string): string {
  return term.replace(/^[^\p{L}\p{N}]+/u, "");
}

export function letterOf(term: string): string {
  const first = sortName(term).charAt(0).toLocaleUpperCase();
  return /\p{L}/u.test(first) ? first : OTHER;
}

export function sortTerms<T extends GlossaryEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) =>
    sortName(a.term).localeCompare(sortName(b.term), undefined, { sensitivity: "base" }),
  );
}

export function groupByLetter<T extends GlossaryEntry>(entries: T[]): Array<{ letter: string; entries: T[] }> {
  const groups: Array<{ letter: string; entries: T[] }> = [];
  for (const entry of sortTerms(entries)) {
    const letter = letterOf(entry.term);
    const last = groups[groups.length - 1];
    if (last?.letter === letter) last.entries.push(entry);
    else groups.push({ letter, entries: [entry] });
  }
  return groups;
}

// Terms whose name matches come first, then terms that only mention the word in their meaning.
export function searchTerms<T extends GlossaryEntry>(entries: T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return sortTerms(entries);
  const rank = (entry: T) => {
    const term = entry.term.toLowerCase();
    if (sortName(term).startsWith(needle) || term.startsWith(needle)) return 0;
    if (term.includes(needle)) return 1;
    return entry.definition.toLowerCase().includes(needle) ? 2 : 3;
  };
  return sortTerms(entries)
    .map((entry) => ({ entry, rank: rank(entry) }))
    .filter((item) => item.rank < 3)
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.entry);
}

export type DefinitionPart = { text: string; anchor?: string };

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patternFor(entry: GlossaryEntry): RegExp {
  const name = entry.term.replace(/\s*\(.*\)$/, "");
  const body = escapeRegExp(name);
  // Code is matched exactly as you would type it. Plain words also match in the plural and at the start of a sentence.
  return entry.code
    ? new RegExp(`(?<![\\w.#])${body}(?!\\w)`, "g")
    : new RegExp(`(?<![\\w.#])${body}s?(?!\\w)`, "gi");
}

// Splits a meaning into plain text and links to the other terms it uses, so a
// beginner can look up an unknown word in one click. Each term links once, and
// a meaning carries only its first few links so that it stays easy to read.
export function linkDefinition(entry: GlossaryEntry, all: GlossaryEntry[]): DefinitionPart[] {
  const text = entry.definition;
  const longestFirst = all
    .filter((other) => other.anchor !== entry.anchor)
    .sort((a, b) => b.term.length - a.term.length);
  const taken: Array<{ start: number; end: number; anchor: string }> = [];
  for (const other of longestFirst) {
    for (const match of text.matchAll(patternFor(other))) {
      const start = match.index;
      const end = start + match[0].length;
      if (taken.some((span) => start < span.end && span.start < end)) continue;
      taken.push({ start, end, anchor: other.anchor });
      break;
    }
  }
  const parts: DefinitionPart[] = [];
  let cursor = 0;
  for (const span of taken.sort((a, b) => a.start - b.start).slice(0, MAX_LINKS)) {
    if (span.start > cursor) parts.push({ text: text.slice(cursor, span.start) });
    parts.push({ text: text.slice(span.start, span.end), anchor: span.anchor });
    cursor = span.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}
