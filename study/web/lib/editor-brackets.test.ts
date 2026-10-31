import { closeBrackets, deleteBracketPair, insertBracket } from "@codemirror/autocomplete";
import { insertNewlineAndIndent } from "@codemirror/commands";
import { EditorState, type Transaction } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { cLanguage } from "@/components/session/Editor";

// The cursor is at the "|". Typing goes through insertBracket, the same command the editor runs on each key.
function start(marked: string): EditorState {
  const at = marked.indexOf("|");
  return EditorState.create({ doc: marked.replace("|", ""), selection: { anchor: at }, extensions: [cLanguage, closeBrackets()] });
}

function type(state: EditorState, ch: string): EditorState {
  const tr = insertBracket(state, ch);
  if (tr) return tr.state;
  const { head } = state.selection.main;
  return state.update({ changes: { from: head, insert: ch }, selection: { anchor: head + ch.length } }).state;
}

function run(state: EditorState, command: (target: { state: EditorState; dispatch(tr: Transaction): void }) => boolean): EditorState {
  command({ state, dispatch: (tr) => (state = tr.state) });
  return state;
}

const shown = (state: EditorState) => {
  const at = state.selection.main.head;
  const doc = state.doc.toString();
  return doc.slice(0, at) + "|" + doc.slice(at);
};

describe("brackets in the C editor", () => {
  it("closes a curly brace, a parenthesis and a square bracket", () => {
    expect(shown(type(start("int f(void) |"), "{"))).toBe("int f(void) {|}");
    expect(shown(type(start("f|;"), "("))).toBe("f(|);");
    expect(shown(type(start("a|;"), "["))).toBe("a[|];");
  });

  it("closes quotes too", () => {
    expect(shown(type(start("printf(|);"), '"'))).toBe('printf("|");');
    expect(shown(type(start("c = |;"), "'"))).toBe("c = '|';");
  });

  it("steps over the closing bracket it added instead of typing a second one", () => {
    let state = type(start("f|;"), "(");
    state = type(state, "x");
    expect(shown(type(state, ")"))).toBe("f(x)|;");
  });

  it("removes both halves when Backspace deletes an empty pair", () => {
    const state = type(start("f|;"), "(");
    expect(shown(run(state, deleteBracketPair))).toBe("f|;");
  });

  it("opens Enter between {} onto an indented line, with the brace on the line below", () => {
    let state = type(start("int f(void) |\n"), "{");
    state = run(state, insertNewlineAndIndent);
    expect(shown(state)).toBe("int f(void) {\n    |\n}\n");
  });
});
