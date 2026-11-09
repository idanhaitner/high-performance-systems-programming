// Suggestions for the C editor: the names the student has written, the C library, and the language's own words.
import { autocompletion, type Completion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import { C_REFERENCE } from "@/lib/c-reference";

const KEYWORDS = [
  "if", "else", "for", "while", "do", "switch", "case", "default", "break", "continue", "return", "goto",
  "struct", "union", "enum", "typedef", "sizeof", "static", "const", "extern", "volatile", "inline", "register",
];

const TYPES = [
  "int", "char", "short", "long", "float", "double", "void", "signed", "unsigned",
  "size_t", "ssize_t", "uint8_t", "uint16_t", "uint32_t", "uint64_t", "int8_t", "int16_t", "int32_t", "int64_t", "bool",
];

const CONSTANTS = ["NULL", "EOF", "true", "false", "INT_MAX", "INT_MIN", "UINT_MAX", "RAND_MAX", "EXIT_SUCCESS", "EXIT_FAILURE"];

const LIBRARY: Completion[] = [
  ...KEYWORDS.map((label): Completion => ({ label, type: "keyword", boost: -2 })),
  ...TYPES.map((label): Completion => ({ label, type: "type", boost: -1 })),
  ...CONSTANTS.map((label): Completion => ({ label, type: "constant", boost: -1 })),
  ...C_REFERENCE.map(
    (f): Completion => ({
      label: f.name,
      type: "function",
      detail: ` ${f.header}`,
      info: `${f.signature}\n\n${f.does}`,
      // Typing "(" is the usual next key, so the call arrives without one.
      apply: f.name,
    }),
  ),
];

// Names that appear in the code, so a variable or function the student wrote is offered back.
// A name followed by "(" is a function; every other one is a variable.
export function namesInCode(state: EditorState): Completion[] {
  const found = new Map<string, "function" | "variable">();
  const doc = state.doc;
  syntaxTree(state).iterate({
    enter(node) {
      if (node.name !== "Identifier" && node.name !== "FieldIdentifier" && node.name !== "TypeIdentifier") return;
      const name = doc.sliceString(node.from, node.to);
      const call = node.name === "Identifier" && /^\s*\(/.test(doc.sliceString(node.to, Math.min(node.to + 8, doc.length)));
      if (call) found.set(name, "function");
      else if (!found.has(name)) found.set(name, "variable");
    },
  });
  return [...found].map(([label, kind]) => ({ label, type: kind, boost: 1 }));
}

function source(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  // Comments and strings are plain text: no suggestions there.
  const inside = syntaxTree(context.state).resolveInner(context.pos, -1).name;
  if (/Comment|String|Char|Include/.test(inside)) return null;
  const mine = namesInCode(context.state).filter((c) => c.label !== word.text);
  const own = new Set(mine.map((c) => c.label));
  const options = [...mine, ...LIBRARY.filter((c) => !own.has(c.label))];
  return { from: word.from, options, validFor: /^[A-Za-z0-9_]*$/ };
}

export const cAutocomplete = autocompletion({ override: [source], icons: true, maxRenderedOptions: 12 });
