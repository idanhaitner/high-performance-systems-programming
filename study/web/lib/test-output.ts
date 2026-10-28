export type CaseResult = { name: string; status: "pass" | "fail" | "not-run"; message: string };

const NOT_RUN = "Did not run: the program stopped before reaching this test.";

// Student code goes first so its line numbers match the editor.
export function buildTestSource(
  student: string,
  harness: string,
  test: string,
): { source: string; studentLines: number } {
  const studentLines = student === "" ? 0 : student.replace(/\n$/, "").split("\n").length;
  return { source: `${student}\n${harness}\n\n${test}\n`, studentLines };
}

export function parseTestOutput(stdout: string, names: string[]): CaseResult[] {
  const seen = new Map<string, CaseResult>();
  for (const raw of stdout.split("\n")) {
    const line = raw.replace(/\r$/, "");
    for (const name of names) {
      if (line === `PASS ${name}`) seen.set(name, { name, status: "pass", message: "" });
      else if (line === `FAIL ${name}`) seen.set(name, { name, status: "fail", message: "" });
      else if (line.startsWith(`FAIL ${name}: `)) {
        seen.set(name, { name, status: "fail", message: line.slice(`FAIL ${name}: `.length) });
      }
    }
  }
  return names.map((name) => seen.get(name) ?? { name, status: "not-run", message: NOT_RUN });
}

function normalize(text: string): string {
  const t = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, "")).join("\n");
  return t.endsWith("\n") ? t.slice(0, -1) : t;
}

export function outputsMatch(actual: string, expected: string): boolean {
  return normalize(actual) === normalize(expected);
}
