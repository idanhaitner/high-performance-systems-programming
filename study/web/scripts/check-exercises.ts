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

let course: Course;
try {
  const raw = execFileSync(
    "python3",
    [path.join(process.cwd(), "scripts", "course-export", "export_course.py"), "--root", repoRoot],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
  );
  course = JSON.parse(raw) as Course;
} catch (error) {
  const stderr = (error as { stderr?: string }).stderr;
  console.error(`check-exercises: could not read the course content:\n${(stderr || String(error)).trim()}`);
  process.exit(1);
}

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

// Runs a binary; a timeout or a crash is reported as a problem string.
function run(exe: string, args: string[], stdin: string): { stdout: string; trouble?: string } {
  const r = spawnSync(exe, args, { encoding: "utf8", input: stdin, timeout: 5000, killSignal: "SIGKILL" });
  const timedOut = (r.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT";
  if (timedOut) return { stdout: r.stdout ?? "", trouble: "ran longer than 5 s" };
  if (r.signal) return { stdout: r.stdout ?? "", trouble: `crashed (${r.signal})` };
  if (r.error) return { stdout: r.stdout ?? "", trouble: `could not run (${r.error.message})` };
  return { stdout: r.stdout ?? "" };
}

type Outcome = { compileError?: string; troubles: string[]; failed: string[]; noResults?: boolean };

function check(ex: Exercise, code: string, dir: string): Outcome {
  const troubles: string[] = [];
  const failed: string[] = [];
  if (ex.mode === "function") {
    const { source } = buildTestSource(code, course.harness, ex.test ?? "");
    const c = compile(source, dir);
    if (!c.ok) return { compileError: c.stderr.trim().split("\n")[0] || "compile failed", troubles, failed };
    const r = run(c.exe, [], "");
    if (r.trouble) troubles.push(`${r.trouble} on the tests`);
    const results = parseTestOutput(r.stdout, ex.caseNames);
    for (const x of results) if (x.status !== "pass") failed.push(`"${x.name}": ${x.message || x.status}`);
    return { troubles, failed, noResults: results.length > 0 && results.every((x) => x.status === "not-run") };
  }
  const c = compile(code, dir);
  if (!c.ok) return { compileError: c.stderr.trim().split("\n")[0] || "compile failed", troubles, failed };
  for (const k of ex.cases) {
    const r = run(c.exe, k.args.map(String), k.stdin);
    if (r.trouble) {
      troubles.push(`${r.trouble} on ${k.name}`);
      failed.push(`"${k.name}": ${r.trouble}`);
    } else if (!outputsMatch(r.stdout, k.expected)) {
      failed.push(`"${k.name}": expected ${JSON.stringify(k.expected)}, got ${JSON.stringify(r.stdout)}`);
    }
  }
  return { troubles, failed };
}

try {
  for (const ex of exercises.values()) {
    const sol = check(ex, ex.solution, path.join(tmp, ex.id, "solution"));
    if (sol.compileError) problems.push(`${ex.id}: solution does not compile: ${sol.compileError}`);
    else {
      const src = ex.mode === "function" ? buildTestSource(ex.solution, course.harness, ex.test ?? "").source : ex.solution;
      const warn = compile(src, path.join(tmp, ex.id, "solution-warn"));
      if (warn.stderr.trim() !== "") {
        problems.push(`${ex.id}: solution compiles with warnings: ${warn.stderr.trim().split("\n")[0]}`);
      }
      for (const t of sol.troubles) problems.push(`${ex.id}: solution ${t}`);
      for (const f of sol.failed) {
        if (!f.endsWith("ran longer than 5 s") && !/crashed \(/.test(f)) problems.push(`${ex.id}: solution fails ${f}`);
      }
    }

    const st = check(ex, ex.starter, path.join(tmp, ex.id, "starter"));
    if (st.compileError) problems.push(`${ex.id}: starter does not compile: ${st.compileError}`);
    else {
      for (const t of st.troubles) problems.push(`${ex.id}: starter ${t}`);
      if (st.noResults) problems.push(`${ex.id}: starter printed no test results`);
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
} catch (error) {
  problems.push(`check-exercises crashed: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

for (const group of ["exercises", "labs"] as const) {
  const known = group === "exercises" ? exercises : labs;
  const dir = path.join(content, group);
  if (!fs.existsSync(dir)) continue;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !known.has(e.name)) console.log(`warning: ${group}/${e.name} is not used by any session`);
  }
}

for (const p of problems) console.log(p);
console.log(
  `${exercises.size} exercises, ${labs.size} labs checked: ${problems.length === 0 ? "all good" : `${problems.length} problem(s)`}`,
);
process.exit(problems.length === 0 ? 0 : 1);
