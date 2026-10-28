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
    const pass = /^PASS (.+)$/.exec(line);
    if (pass) {
      seen.set(pass[1], { name: pass[1], status: "pass", message: "" });
      continue;
    }
    const fail = /^FAIL ([^:]+?)(?:: (.*))?$/.exec(line);
    if (fail) seen.set(fail[1], { name: fail[1], status: "fail", message: fail[2] ?? "" });
  }
  return names.map((name) => seen.get(name) ?? { name, status: "not-run", message: NOT_RUN });
}

function normalize(text: string): string[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, ""));
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function outputsMatch(actual: string, expected: string): boolean {
  const a = normalize(actual);
  const e = normalize(expected);
  return a.length === e.length && a.every((line, i) => line === e[i]);
}
