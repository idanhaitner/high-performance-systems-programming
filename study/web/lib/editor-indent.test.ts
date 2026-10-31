import { insertNewlineAndIndent } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { cLanguage } from "@/components/session/Editor";

// Presses Enter with the cursor at the "|" and gives back the new line's leading spaces.
function indentAfterEnter(marked: string): string {
  const at = marked.indexOf("|");
  let state = EditorState.create({
    doc: marked.replace("|", ""),
    selection: { anchor: at },
    extensions: cLanguage,
  });
  insertNewlineAndIndent({ state, dispatch: (tr) => (state = tr.state) });
  const line = state.doc.lineAt(state.selection.main.head);
  return line.text.slice(0, state.selection.main.head - line.from);
}

describe("Enter in the C editor", () => {
  it("indents one level, as far as the starter code, after an opening brace", () => {
    expect(indentAfterEnter("int f(void) {|\n    return 0;\n}\n")).toBe("    ");
  });

  it("stays under the line above inside a function", () => {
    expect(indentAfterEnter("int f(void) {\n    int x = 0;|\n    return x;\n}\n")).toBe("    ");
  });

  it("goes one level deeper inside a nested block", () => {
    expect(indentAfterEnter("int f(int n) {\n    if (n) {|\n    }\n}\n")).toBe("        ");
  });

  it("stays under the line above when the block is not closed yet", () => {
    expect(indentAfterEnter("int f(int n) {\n    for (int i = 0; i < n; i++) {\n        n--;|\n")).toBe("        ");
  });

  it("starts at the margin outside any function", () => {
    expect(indentAfterEnter("int f(void) {\n}|\n")).toBe("");
  });
});
