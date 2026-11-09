import { EditorState } from "@codemirror/state";
import { ensureSyntaxTree } from "@codemirror/language";
import { describe, expect, it } from "vitest";
import { cLanguage } from "@/components/session/Editor";
import { namesInCode } from "@/lib/editor-complete";

function stateOf(doc: string) {
  const state = EditorState.create({ doc, extensions: [cLanguage] });
  ensureSyntaxTree(state, state.doc.length, 5000);
  return state;
}

describe("names offered by the C editor", () => {
  const code = "int total = 0;\nint add(int a, int b) { return a + b; }\nint main(void) {\n  int count = add(1, 2);\n  // hidden\n  return count;\n}\n";
  const names = namesInCode(stateOf(code));
  const type = (label: string) => names.find((n) => n.label === label)?.type;

  it("offers variables the student declared", () => {
    expect(type("total")).toBe("variable");
    expect(type("count")).toBe("variable");
    expect(type("a")).toBe("variable");
  });

  it("offers functions the student defined or called", () => {
    expect(type("add")).toBe("function");
    expect(type("main")).toBe("function");
  });

  it("lists each name once", () => {
    const labels = names.map((n) => n.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("ignores words in comments", () => {
    expect(type("hidden")).toBeUndefined();
  });
});
