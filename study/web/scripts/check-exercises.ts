// Compiles and runs every exercise solution and starter, and every lab's reference solution.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildTestSource, outputsMatch, parseTestOutput } from "../lib/test-output";

const FLAGS = ["-std=c17", "-Wall", "-Wextra", "-O0", "-g"];
const repoRoot = path.resolve(process.cwd(), "../..");
const content = path.join(repoRoot, "study", "content");

type Case = { name: string; args: string[]; stdin: string; expected: string; hint: string };
type Exercise = {
  id: string;
  title: string;
  mode: "function" | "program";
  starter: string;
  solution: string;
  test: string | null;
  caseNames: string[];
  cases: Case[];
};
type Lab = { id: string };
type Step = { kind: string; exercise?: Exercise; lab?: Lab };
type Course = { harness: string; sessions: { steps: Step[] }[] };

const raw = execFileSync(
  "python3",
  [path.join(process.cwd(), "scripts", "course-export", "export_course.py"), "--root", repoRoot],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
const course = JSON.parse(raw) as Course;

const exercises = new Map<string, Exercise>();
const labs = new Map<string, Lab>();
for (const session of course.sessions ?? []) {
  for (const step of session.steps ?? []) {
    if (step.kind === "exercise" && step.exercise) exercises.set(step.exercise.id, step.exercise);
    if (step.kind === "lab" && step.lab) labs.set(step.lab.id, step.lab);
  }
}

const problems: string[] = [];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "check-exercises-"));

function compile(source: string, dir: string): { ok: boolean; stderr: string; exe: string } {
  fs.mkdirSync(dir, { recursive: true });
  const src = path.join(dir, "main.c");
  const exe = path.join(dir, "prog");
  fs.writeFileSync(src, source);
  const r = spawnSync("gcc", [...FLAGS, src, "-o", exe], { encoding: "utf8", timeout: 60000 });
  return { ok: r.status === 0, stderr: r.stderr ?? "", exe };
}

function run(exe: string, args: string[], stdin: string): string {
  const r = spawnSync(exe, args, { encoding: "utf8", input: stdin, timeout: 5000 });
  return r.stdout ?? "";
}

// Returns one failure description per case that does not pass.
function failures(ex: Exercise, code: string, dir: string): { compileError?: string; failed: string[] } {
  if (ex.mode === "function") {
    const { source } = buildTestSource(code, course.harness, ex.test ?? "");
    const c = compile(source, dir);
    if (!c.ok) return { compileError: c.stderr.trim().split("\n")[0] || "compile failed", failed: [] };
    const results = parseTestOutput(run(c.exe, [], ""), ex.caseNames);
    return {
      failed: results.filter((r) => r.status !== "pass").map((r) => `"${r.name}": ${r.message || r.status}`),
    };
  }
  const c = compile(code, dir);
  if (!c.ok) return { compileError: c.stderr.trim().split("\n")[0] || "compile failed", failed: [] };
  const failed: string[] = [];
  for (const k of ex.cases) {
    const out = run(c.exe, k.args.map(String), k.stdin);
    if (!outputsMatch(out, k.expected)) {
      failed.push(`"${k.name}": expected ${JSON.stringify(k.expected)}, got ${JSON.stringify(out)}`);
    }
  }
  return { failed };
}

for (const ex of exercises.values()) {
  const solDir = path.join(tmp, ex.id, "solution");
  const sol = failures(ex, ex.solution, solDir);
  if (sol.compileError) problems.push(`${ex.id}: solution does not compile: ${sol.compileError}`);
  else {
    // Warnings are failures for the reference solution.
    const warn = compile(
      ex.mode === "function" ? buildTestSource(ex.solution, course.harness, ex.test ?? "").source : ex.solution,
      path.join(tmp, ex.id, "solution-warn"),
    );
    if (warn.stderr.trim() !== "") problems.push(`${ex.id}: solution compiles with warnings: ${warn.stderr.trim().split("\n")[0]}`);
    for (const f of sol.failed) problems.push(`${ex.id}: solution fails ${f}`);
  }

  const st = failures(ex, ex.starter, path.join(tmp, ex.id, "starter"));
  if (st.compileError) problems.push(`${ex.id}: starter does not compile: ${st.compileError}`);
  else {
    const total = ex.mode === "function" ? ex.caseNames.length : ex.cases.length;
    if (st.failed.length === 0 && total > 0) problems.push(`${ex.id}: starter already passes every case`);
  }
}

for (const lab of labs.values()) {
  const dir = path.join(content, "labs", lab.id);
  if (!fs.existsSync(path.join(dir, "Makefile"))) {
    problems.push(`${lab.id}: lab has no Makefile`);
    continue;
  }
  if (!fs.existsSync(path.join(dir, "solution"))) {
    problems.push(`${lab.id}: lab has no solution/ folder`);
    continue;
  }
  // Build in a copy so the content folder stays clean.
  const copy = path.join(tmp, "labs", lab.id);
  fs.cpSync(dir, copy, { recursive: true });
  const r = spawnSync("make", ["-C", copy, "test", "SRC_DIR=solution"], { encoding: "utf8", timeout: 120000 });
  if (r.status !== 0) {
    const tail = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-1)[0] ?? "";
    problems.push(`${lab.id}: make test SRC_DIR=solution exited ${r.status}: ${tail}`);
  }
}

for (const group of ["exercises", "labs"] as const) {
  const known = group === "exercises" ? exercises : labs;
  const dir = path.join(content, group);
  if (!fs.existsSync(dir)) continue;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !known.has(e.name)) console.log(`warning: ${group}/${e.name} is not used by any session`);
  }
}

fs.rmSync(tmp, { recursive: true, force: true });

for (const p of problems) console.log(p);
console.log(
  `${exercises.size} exercises, ${labs.size} labs checked: ${problems.length === 0 ? "all good" : `${problems.length} problem(s)`}`,
);
process.exit(problems.length === 0 ? 0 : 1);
