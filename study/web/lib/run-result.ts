export type Diagnostic = { line: number; column: number; severity: "error" | "warning" | "note"; text: string };
export type RunOutcome =
  | { kind: "compile-error"; diagnostics: Diagnostic[]; text: string; hint: string | null }
  | { kind: "timeout"; stdout: string; stderr: string }
  | { kind: "crash"; signal: number; name: string; explanation: string; stdout: string; stderr: string }
  | { kind: "ok"; exitCode: number; stdout: string; stderr: string; truncated: boolean; warnings: Diagnostic[] };
export type AsmLine = { text: string; sourceLine: number | null };

export const OUTPUT_CAP = 10_000;

const MAIN_TWICE_HINT =
  "Your code has its own `main`. In this exercise the tests bring their own `main`, so delete yours.";

const SIGNALS: Record<number, { name: string; explanation: string }> = {
  11: {
    name: "Segmentation fault",
    explanation:
      "Your program used memory it does not own. This is often a bad pointer or an index past the end of an array.",
  },
  8: {
    name: "Arithmetic error",
    explanation: "Your program did math the processor refuses, most often dividing an integer by zero.",
  },
  6: {
    name: "Aborted",
    explanation: "Your program stopped itself on purpose, usually because a check (like assert) failed.",
  },
  7: {
    name: "Bus error",
    explanation: "Your program read memory at an address the processor cannot use, often through a bad pointer.",
  },
};

type Line = { text?: unknown; tag?: { line?: unknown; column?: unknown; text?: unknown; severity?: unknown } };

// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (s: string): string => s.replace(ANSI, "");

function asObject(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

function lines(v: unknown): Line[] {
  return Array.isArray(v) ? (v as Line[]) : [];
}

function joinText(v: unknown): string {
  return lines(v)
    .map((l) => stripAnsi(typeof l.text === "string" ? l.text : ""))
    .join("\n");
}

function diagnosticsOf(v: unknown): Diagnostic[] {
  const out: Diagnostic[] = [];
  for (const l of lines(v)) {
    const tag = l.tag;
    if (!tag || typeof tag.line !== "number") continue;
    const severity = tag.severity === 3 ? "error" : tag.severity === 2 ? "warning" : "note";
    const text = stripAnsi(typeof tag.text === "string" ? tag.text : "").replace(
      /^(?:fatal error|error|warning|note): /,
      "",
    );
    out.push({ line: tag.line, column: typeof tag.column === "number" ? tag.column : 0, severity, text });
  }
  return out;
}

export function explainBuildError(text: string): string | null {
  return /multiple definition of [`'"]?main|redefinition of [`'"]?main/.test(text) ? MAIN_TWICE_HINT : null;
}

export function classifyRun(response: unknown): RunOutcome {
  const r = asObject(response);
  const build = asObject(r.buildResult);

  if (r.didExecute === false) {
    const text = joinText(build.stderr);
    return {
      kind: "compile-error",
      diagnostics: diagnosticsOf(build.stderr),
      text,
      hint: explainBuildError(text),
    };
  }

  const code = typeof r.code === "number" ? r.code : 0;
  const stdoutFull = joinText(r.stdout);
  const stderrFull = joinText(r.stderr);
  const stdout = stdoutFull.slice(0, OUTPUT_CAP);
  const stderr = stderrFull.slice(0, OUTPUT_CAP);

  // Timeout first: it exits with 143, which would otherwise read as signal 15.
  if (r.timedOut === true) return { kind: "timeout", stdout, stderr };

  // With the sanitizer on, AddressSanitizer catches the signal itself and the
  // program exits with 1, so read the signal from its report instead.
  const asan = /AddressSanitizer: (SEGV|FPE|ABRT|BUS)\b/.exec(stderrFull);
  const asanSignal = asan ? { SEGV: 11, FPE: 8, ABRT: 6, BUS: 7 }[asan[1] as "SEGV" | "FPE" | "ABRT" | "BUS"] : 0;
  const signal = asanSignal || (code > 128 ? code - 128 : code < 0 ? -code : 0);
  if (signal > 0) {
    const info = SIGNALS[signal] ?? {
      name: `Signal ${signal}`,
      explanation: "Your program was stopped by the operating system.",
    };
    return { kind: "crash", signal, name: info.name, explanation: info.explanation, stdout, stderr };
  }

  return {
    kind: "ok",
    exitCode: code,
    stdout,
    stderr,
    truncated: r.truncated === true || stdoutFull.length > OUTPUT_CAP || stderrFull.length > OUTPUT_CAP,
    warnings: diagnosticsOf(build.stderr).filter((d) => d.severity !== "error"),
  };
}

export function splitDiagnostics(
  d: Diagnostic[],
  studentLines: number,
): { inEditor: Diagnostic[]; inTests: Diagnostic[] } {
  return {
    inEditor: d.filter((x) => x.line <= studentLines),
    inTests: d.filter((x) => x.line > studentLines),
  };
}

export function parseAsm(response: unknown): { lines: AsmLine[]; diagnostics: Diagnostic[] } {
  const r = asObject(response);
  const out: AsmLine[] = [];
  for (const raw of Array.isArray(r.asm) ? r.asm : []) {
    const a = asObject(raw);
    const src = a.source === null || a.source === undefined ? null : asObject(a.source);
    const sourceLine =
      src && typeof src.line === "number" && (src.file === null || src.file === undefined) ? src.line : null;
    out.push({ text: stripAnsi(typeof a.text === "string" ? a.text : ""), sourceLine });
  }
  return { lines: out, diagnostics: diagnosticsOf(r.stderr) };
}
