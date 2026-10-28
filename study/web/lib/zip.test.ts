import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import type { Exercise } from "./types";
import { exerciseZip } from "./zip";

const base: Exercise = {
  id: "ex-one",
  title: "Add two numbers",
  mode: "function",
  statement: [{ type: "paragraph", text: "Write `add(a, b)` returning the **sum**." }],
  hints: [],
  caseHints: {},
  starter: "int add(int a, int b) { return 0; }\n",
  solution: "int add(int a, int b) { return a + b; }\n",
  test: "int main(void) { return 0; }\n",
  caseNames: ["a"],
  cases: [],
};

const program: Exercise = {
  ...base,
  id: "ex-prog",
  mode: "program",
  test: null,
  caseNames: [],
  cases: [
    { name: "one", args: ["3", "4"], stdin: "hi\n", expected: "7\n", hint: "" },
    { name: "two", args: [], stdin: "", expected: "0\n", hint: "" },
  ],
};

const files = (bytes: Uint8Array) => {
  const out: Record<string, string> = {};
  for (const [name, data] of Object.entries(unzipSync(bytes))) out[name] = strFromU8(data);
  return out;
};

describe("exerciseZip", () => {
  it("function mode has the five files and keeps the student's code untouched", () => {
    const f = files(exerciseZip(base, "MY CODE\n", "#include <stdio.h>"));
    expect(Object.keys(f).sort()).toEqual(["Makefile", "README.txt", "harness.h", "main.c", "test.c"]);
    expect(f["main.c"]).toBe("MY CODE\n");
    expect(f["harness.h"]).toBe("#include <stdio.h>");
    expect(f["test.c"]).toBe(base.test);
    expect(f["Makefile"]).toContain("cat main.c harness.h test.c > all.c");
    expect(f["Makefile"]).toContain("-std=c17 -Wall -Wextra -O0 -g");
    expect(f["README.txt"]).toContain("Add two numbers");
    expect(f["README.txt"]).toContain("Write add(a, b) returning the sum.");
    expect(f["README.txt"]).toContain("Run `make test` in this folder.");
  });

  it("program mode has one args/in/out set per case, numbered from 1", () => {
    const f = files(exerciseZip(program, "code", ""));
    expect(Object.keys(f).sort()).toEqual([
      "Makefile", "README.txt", "cases/1.args", "cases/1.in", "cases/1.out",
      "cases/2.args", "cases/2.in", "cases/2.out", "main.c",
    ]);
    expect(f["cases/1.args"]).toBe("3 4");
    expect(f["cases/1.in"]).toBe("hi\n");
    expect(f["cases/1.out"]).toBe("7\n");
    expect(f["cases/2.args"]).toBe("");
    expect(f["Makefile"]).toContain("diff");
    expect(f["Makefile"]).toContain("-std=c17 -Wall -Wextra -O0 -g");
  });

  it("uses real tabs on every Makefile recipe line", () => {
    for (const ex of [base, program]) {
      const lines = files(exerciseZip(ex, "c", "h"))["Makefile"].split("\n");
      const recipes = lines.filter((l) => /^\s+\S/.test(l));
      expect(recipes.length).toBeGreaterThan(0);
      for (const l of recipes) expect(l.startsWith("\t")).toBe(true);
    }
  });
});
