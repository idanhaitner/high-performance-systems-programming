import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { classifyRun, parseAsm, splitDiagnostics, OUTPUT_CAP } from "./run-result";

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`./fixtures/godbolt/${name}.json`, import.meta.url), "utf8"));

describe("classifyRun", () => {
  it("reads a successful run", () => {
    const r = classifyRun(fixture("run-ok"));
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("3");
    expect(r.stdout).toContain("hello");
  });

  it("reads a compile error with its line and no escape codes", () => {
    const r = classifyRun(fixture("run-compile-error"));
    expect(r.kind).toBe("compile-error");
    if (r.kind !== "compile-error") return;
    expect(r.diagnostics.some((d) => d.severity === "error" && d.line === 1)).toBe(true);
    expect(r.text).not.toContain("\u001b");
    expect(r.hint).toBeNull();
  });

  it("explains a segfault", () => {
    const r = classifyRun(fixture("run-segfault"));
    expect(r.kind).toBe("crash");
    if (r.kind !== "crash") return;
    expect(r.signal).toBe(11);
    expect(r.name).toBe("Segmentation fault");
    expect(r.explanation).toBe(
      "Your program used memory it does not own. This is often a bad pointer or an index past the end of an array.",
    );
  });

  it("decides timeout before reading the exit code as a signal", () => {
    const r = classifyRun(fixture("run-timeout"));
    expect(r.kind).toBe("timeout");
    if (r.kind !== "timeout") return;
    expect(typeof r.stdout).toBe("string");
    expect(typeof r.stderr).toBe("string");
  });

  it("hints when the student defines main twice", () => {
    const r = classifyRun(fixture("run-main-twice"));
    expect(r.kind).toBe("compile-error");
    if (r.kind !== "compile-error") return;
    expect(r.hint).toBe(
      "Your code has its own `main`. In this exercise the tests bring their own `main`, so delete yours.",
    );
  });

  it("caps long output and flags it truncated", () => {
    const r = classifyRun({
      didExecute: true,
      code: 0,
      timedOut: false,
      stdout: [{ text: "x".repeat(12_000) }],
      stderr: [],
    });
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.stdout.length).toBe(OUTPUT_CAP);
    expect(r.truncated).toBe(true);
  });

  it("names other signals generically", () => {
    const r = classifyRun({ didExecute: true, code: 128 + 15, timedOut: false, stdout: [], stderr: [] });
    expect(r).toMatchObject({ kind: "crash", signal: 15, name: "Signal 15" });
  });
});

describe("splitDiagnostics", () => {
  it("separates editor lines from test lines", () => {
    const mk = (line: number) => ({ line, column: 1, severity: "error" as const, text: "x" });
    const r = splitDiagnostics([mk(2), mk(9)], 5);
    expect(r.inEditor.map((d) => d.line)).toEqual([2]);
    expect(r.inTests.map((d) => d.line)).toEqual([9]);
  });
});

describe("parseAsm", () => {
  it("maps assembly lines to editor lines", () => {
    const r = parseAsm(fixture("asm"));
    expect(r.lines.length).toBeGreaterThan(0);
    expect(r.lines.some((l) => l.sourceLine !== null)).toBe(true);
  });
});
