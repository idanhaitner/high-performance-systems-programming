# Guided Sessions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add step-by-step guided sessions to the study site, with an in-page C editor that runs, tests, and shows assembly through Compiler Explorer, plus VS Code labs, and ship a full Lecture 1 session.

**Architecture:** Content stays in `study/content/` and is turned into JSON at build time by the existing Python exporter (`study/web/scripts/course-export/`), which gains sessions, exercises, and labs. The Next.js static export renders `/sessions/<lecture-id>/` as a client-side stepper. All compiling happens in the browser by calling `https://godbolt.org/api/...`; pure logic (response classification, test-output parsing) lives in small TS modules covered by Vitest. A Node check script compiles every exercise locally with gcc before deploy.

**Tech Stack:** Next.js 15 static export, React 19, TypeScript, Tailwind 4 (existing); CodeMirror 6 (`codemirror`, `@codemirror/lang-cpp`, `@codemirror/lint`); `fflate` for zips; Vitest; `tsx` to run the TS check script; Python 3 exporter (existing, no third-party packages — it has its own YAML parser `studylib.parse_yaml`).

**Spec:** `docs/superpowers/specs/2026-10-28-guided-sessions-design.md`

## Global Constraints

- The site stays a static export (`output: "export"`), deployable under `NEXT_PUBLIC_BASE_PATH`. No server code, no API routes.
- Compiler flags, everywhere (browser and check script): `-std=c17 -Wall -Wextra -O0 -g`. Assembly toggle uses `-O0` or `-O2` in place of `-O0`.
- One pinned gcc compiler id, in one constant `GODBOLT_COMPILER` in `study/web/lib/godbolt.ts`.
- Request timeout 15 s (`AbortController`). Cooldown 3 s after every request. Buttons disabled while a request is in flight.
- Output cap: show the first 10,000 characters of stdout/stderr, then the note "Output cut off after 10,000 characters."
- Under every editor: "Runs on godbolt.org — your code is sent there to compile."
- **Show solution** appears after 2 failed test runs. Hints open one at a time.
- Whole-program exercises: 1–3 cases. Output comparison ignores trailing spaces/tabs at line ends and one final newline.
- All content text (sessions, exercise READMEs, case hints, lab READMEs, error messages shown to the student) follows `.cursor/rules/beginner-first-writing.mdc`: explain each term before using it, short sentences, plain words.
- localStorage keys (all prefixed by the existing `storageKey(courseId)` = `study:<courseId>`):
  - `study:<courseId>:session:<sessionId>` → `{ step: number; done: string[]; skipped: string[] }`
  - `study:<courseId>:code:<exerciseId>` → the student's source text
  - `study:<courseId>:fails:<exerciseId>` → number of failed test runs
- Every storage read/write is wrapped in try/catch; the page works with storage unavailable.
- Commit and push after each task (`git push origin HEAD`), per `.cursor/rules/commit-and-push.mdc`. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Stop condition: if Task 1 finds that godbolt.org rejects browser requests (CORS) or cannot execute programs, stop all work and report to the user. Do not switch services.

## Review Focus

1. A student who leaves their own `main` in a function exercise gets a link error; they should see "Your code has its own `main`. In this exercise the tests bring their own `main`, so delete yours." — pinned in Task 2 (`explainBuildError`).
2. A program that crashes halfway through the tests: cases already printed keep their result, the rest show "Did not run: the program stopped before reaching this test." — pinned in Task 2 (`parseTestOutput`).
3. Compiler messages that point at test lines (after the student's code) must not underline a random editor line; they are listed as "in the test code". — pinned in Task 2 (`splitDiagnostics`).
4. Program output differing only by a missing final newline or trailing spaces still passes; a missing or extra line fails. — pinned in Task 2 (`outputsMatch`).
5. Private browsing / blocked storage: the editor loads the starter and runs normally, progress is simply not kept. — pinned in Task 5 (`session-store` tests with a throwing `localStorage`).

---

## File Structure

```
study/content/
  course.yml                         + `session:` on lecture-1
  sessions/lecture-1.md              session steps (Task 9)
  exercises/harness.h                shared CHECK macro (Task 4)
  exercises/<id>/README.md           frontmatter `title`; statement; :::hint; :::case name="…"
  exercises/<id>/starter.c
  exercises/<id>/solution.c
  exercises/<id>/test.c   | cases.yml
  labs/<id>/README.md                frontmatter `title`; body
  labs/<id>/Makefile                 `SRC_DIR ?= .`; targets `run`, `test`
  labs/<id>/*.c, labs/<id>/solution/*.c

study/web/
  lib/types.ts                       + Session, SessionStep, Exercise, ProgramCase, Lab; Course.sessions, Course.harness
  lib/course.ts                      contentStamp also watches sessions/, exercises/, labs/
  lib/run-result.ts                  classify godbolt responses (pure)
  lib/test-output.ts                 PASS/FAIL parsing, output comparison, source assembly (pure)
  lib/godbolt.ts                     fetch client, timeout, 429, cooldown
  lib/session-store.ts               localStorage helpers for session/code/fails
  lib/zip.ts                         build the "run in VS Code" zip in the browser
  lib/fixtures/godbolt/*.json        real responses captured in Task 1
  lib/*.test.ts                      Vitest
  vitest.config.ts
  scripts/course-export/studylib.py  + load/validate sessions, exercises, labs; section_slug
  scripts/course-export/export_course.py  + sessions, harness in JSON
  scripts/course-export/test_sessions.py  Python unittest
  scripts/build-labs.mjs             zip labs into public/labs/<id>.zip (prebuild)
  scripts/check-exercises.ts         local gcc check of every exercise and lab
  app/sessions/[id]/page.tsx         static session route
  components/session/Stepper.tsx     step list, progress bar, Next/skip
  components/session/LearnStep.tsx, CheckStep.tsx, LabStep.tsx
  components/session/CodeStep.tsx    editor + buttons + results
  components/session/Editor.tsx      CodeMirror wrapper (dynamic import)
  components/session/AsmView.tsx     assembly panel with hover mapping
  app/page.tsx                       + "Start session" link per lecture
.github/workflows/pages.yml          + npm test, npm run check:exercises
```

---

### Task 1: Verify Compiler Explorer from a browser and capture fixtures

This is the spec's stop-condition probe. Its output is a decision plus JSON fixtures that later unit tests use.

**Files:**
- Create: `study/web/lib/fixtures/godbolt/run-ok.json`, `run-compile-error.json`, `run-segfault.json`, `run-timeout.json`, `run-main-twice.json`, `asm.json`, `compilers.txt`
- Modify: `study/web/lib/godbolt.ts` (create with only `export const GODBOLT_COMPILER = "<id>"` and `export const GODBOLT_BASE = "https://godbolt.org/api"`)

**Interfaces:**
- Produces: `GODBOLT_COMPILER`, `GODBOLT_BASE`; fixtures named above, each the raw JSON body returned by godbolt.

- [ ] **Step 1: Start the dev server** with preview_start `{name: "study-web"}` (port 8732). This gives a real browser origin (`http://localhost:8732`).
- [ ] **Step 2: Pick the compiler.** In the page, `await fetch("https://godbolt.org/api/compilers/c?fields=id,name,semver", {headers:{Accept:"application/json"}}).then(r=>r.json())`. Choose the newest stable x86-64 gcc (not trunk). Save the id list to `compilers.txt`. If the auto-mode classifier blocks this, ask the user to approve it; do not work around it.
- [ ] **Step 3: Probe execution from the page.** `POST {GODBOLT_BASE}/compiler/{id}/compile`, headers `Content-Type: application/json`, `Accept: application/json`, body:
  ```json
  {"source": "<program>", "options": {"userArguments": "-std=c17 -Wall -Wextra -O0 -g",
   "executeParameters": {"args": ["3","4"], "stdin": "hello\n"},
   "compilerOptions": {"executorRequest": true}, "filters": {"execute": true}, "tools": [], "libraries": []}}
  ```
  Run five programs and save each response: prints argv/stdin (`run-ok.json`), a syntax error (`run-compile-error.json`), `*(int*)0 = 1` (`run-segfault.json`), `for(;;);` (`run-timeout.json`), two `main` functions in one source (`run-main-twice.json`).
  Expected: the fetch succeeds (no CORS error in console) and `run-ok` shows the argv and stdin text in `stdout`.
- [ ] **Step 4: Probe assembly.** Same endpoint, `filters: {"intel": true, "labels": true, "directives": true, "commentOnly": true, "demangle": true, "execute": false}`, no `compilerOptions.executorRequest`. Save as `asm.json`. Expected: `asm` entries with `source.line` numbers.
- [ ] **Step 5: Probe sanitizers.** Re-run the segfault program with `-fsanitize=address,undefined` added. Record in the commit message whether the executor ran it (stdout/stderr shows an AddressSanitizer report). If yes, add `export const SANITIZE = true` to `godbolt.ts`, else `false`.
- [ ] **Step 6: Apply the stop condition.** If Step 3 failed with a CORS error or `didExecute` is false for `run-ok`, stop and report to the user with the console error. Otherwise continue.
- [ ] **Step 7: Commit** `study/web/lib/godbolt.ts` and `study/web/lib/fixtures/godbolt/`, message "Pin the Compiler Explorer compiler and record real responses for tests." Push.

---

### Task 2: Pure result logic with Vitest

**Files:**
- Create: `study/web/vitest.config.ts`, `study/web/lib/run-result.ts`, `study/web/lib/test-output.ts`, `study/web/lib/run-result.test.ts`, `study/web/lib/test-output.test.ts`
- Modify: `study/web/package.json` (devDependency `vitest`; script `"test": "vitest run"`)

**Interfaces:**
- Consumes: fixtures from Task 1.
- Produces:
  ```ts
  // run-result.ts
  export type Diagnostic = { line: number; column: number; severity: "error" | "warning" | "note"; text: string };
  export type RunOutcome =
    | { kind: "compile-error"; diagnostics: Diagnostic[]; text: string; hint: string | null }
    | { kind: "timeout" }
    | { kind: "crash"; signal: number; name: string; explanation: string; stdout: string; stderr: string }
    | { kind: "ok"; exitCode: number; stdout: string; stderr: string; truncated: boolean; warnings: Diagnostic[] };
  export const OUTPUT_CAP = 10_000;
  export function classifyRun(response: unknown): RunOutcome;
  export function explainBuildError(text: string): string | null;
  export function splitDiagnostics(d: Diagnostic[], studentLines: number): { inEditor: Diagnostic[]; inTests: Diagnostic[] };
  export type AsmLine = { text: string; sourceLine: number | null };
  export function parseAsm(response: unknown): { lines: AsmLine[]; diagnostics: Diagnostic[] };

  // test-output.ts
  export type CaseResult = { name: string; status: "pass" | "fail" | "not-run"; message: string };
  export function buildTestSource(student: string, harness: string, test: string): { source: string; studentLines: number };
  export function parseTestOutput(stdout: string, names: string[]): CaseResult[];
  export function outputsMatch(actual: string, expected: string): boolean;
  ```

- [ ] **Step 1: Add Vitest.** `npm i -D vitest` in `study/web`; `vitest.config.ts` with `resolve.alias {"@": <web root>}` and `test.include: ["lib/**/*.test.ts"]`.
- [ ] **Step 2: Write failing tests in `test-output.test.ts`:**
  - `buildTestSource("int f(void){return 1;}\n", "H", "T")` → `source === "int f(void){return 1;}\n\nH\n\nT\n"` and `studentLines === 1`. Student code always comes first so its line numbers are unchanged.
  - `parseTestOutput("PASS a\nFAIL b: expected 2, got 3\n", ["a","b","c"])` → `[{a,pass,""},{b,fail,"expected 2, got 3"},{c,"not-run","Did not run: the program stopped before reaching this test."}]`.
  - Names in the output that are not in `names` are ignored; order follows `names`.
  - `outputsMatch("7", "7\n")`, `outputsMatch("7  \n", "7\n")`, `outputsMatch("a\r\nb\n", "a\nb\n")` → true; `outputsMatch("7\n8\n", "7\n")`, `outputsMatch("", "7\n")` → false.
- [ ] **Step 3: Write failing tests in `run-result.test.ts`** against the Task 1 fixtures:
  - `run-ok.json` → `kind "ok"`, `exitCode 0`, stdout contains `"3"` and `"hello"`.
  - `run-compile-error.json` → `kind "compile-error"`, at least one diagnostic with `severity "error"` and the line of the syntax error.
  - `run-segfault.json` → `kind "crash"`, `signal 11`, `name "Segmentation fault"`, explanation `"Your program used memory it does not own. This is often a bad pointer or an index past the end of an array."`.
  - `run-timeout.json` → `kind "timeout"`.
  - `run-main-twice.json` → `compile-error` with `hint` equal to the Review Focus 1 message.
  - A synthetic `ok` response with 12,000 chars of stdout → `stdout.length === 10_000`, `truncated true`.
  - `splitDiagnostics([{line:2},{line:9}], 5)` → line 2 in `inEditor`, line 9 in `inTests`.
  - `parseAsm(asm.json)` → non-empty `lines`, some with `sourceLine` set.
- [ ] **Step 4: Run** `npm test`. Expected: FAIL (modules missing).
- [ ] **Step 5: Implement `test-output.ts` and `run-result.ts`.** Read the fixture shapes to decide field access (`buildResult.code`, `didExecute`, `code`, `timedOut`, `stdout[].text`, `stderr[].tag`). Signal from exit code: `code > 128 ? code - 128 : code < 0 ? -code : 0`. Signal names and explanations (exact copy):
  - 11 "Segmentation fault" — explanation as in Step 3.
  - 8 "Arithmetic error" — "Your program did math the processor refuses, most often dividing an integer by zero."
  - 6 "Aborted" — "Your program stopped itself on purpose, usually because a check (like assert) failed."
  - 7 "Bus error" — "Your program read memory at an address the processor cannot use, often through a bad pointer."
  - other — name `"Signal <n>"`, "Your program was stopped by the operating system."
  `explainBuildError` returns the Review Focus 1 message when text matches `/multiple definition of [`'"]?main|redefinition of [`'"]?main/`, else `null`.
- [ ] **Step 6: Run** `npm test`. Expected: all PASS.
- [ ] **Step 7: Commit and push** "Add tested logic for reading compiler results and test output."

---

### Task 3: Compiler Explorer client

**Files:**
- Modify: `study/web/lib/godbolt.ts`
- Test: `study/web/lib/godbolt.test.ts`

**Interfaces:**
- Consumes: `classifyRun`, `parseAsm`, `RunOutcome` (Task 2).
- Produces:
  ```ts
  export class GodboltError extends Error { kind: "unreachable" | "rate-limited"; retryAfter: number /* seconds, 0 if unknown */ }
  export const REQUEST_TIMEOUT_MS = 15_000;
  export const COOLDOWN_MS = 3_000;
  export function runProgram(source: string, opts: { args?: string[]; stdin?: string; fetchImpl?: typeof fetch }): Promise<RunOutcome>;
  export function compileAsm(source: string, opts: { optimize: boolean; fetchImpl?: typeof fetch }): Promise<ReturnType<typeof parseAsm>>;
  export function flagsFor(optimize: boolean): string; // "-std=c17 -Wall -Wextra -O0 -g" (+ sanitizer flags when SANITIZE and not optimize)
  ```
  Messages the UI shows for `GodboltError`: unreachable → "The online compiler can't be reached right now."; rate-limited → "Too many runs in a short time — try again in N seconds." (N = `retryAfter || 30`).

- [ ] **Step 1: Write failing tests** with a fake `fetchImpl`:
  - Returns `run-ok.json` with 200 → `runProgram` resolves `kind "ok"`, and the request body has `options.userArguments === flagsFor(false)` and `executeParameters.args` equal to the passed args.
  - Fetch rejects (TypeError) → rejects with `GodboltError` kind `"unreachable"`.
  - Fetch never resolves → with fake timers advanced 15,000 ms, rejects `"unreachable"` (abort).
  - 429 with header `Retry-After: 12` → `"rate-limited"`, `retryAfter 12`.
  - 500 → `"unreachable"`.
  - `compileAsm(src, {optimize:true})` sends `-O2` and `filters.execute === false`.
- [ ] **Step 2: Run** `npm test -- godbolt`. Expected: FAIL.
- [ ] **Step 3: Implement** using the request bodies from Task 1 Steps 3–4. Cooldown is the UI's job (Task 6), not the client's.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit and push** "Add the Compiler Explorer client with timeouts and rate-limit handling."

---

### Task 4: Export sessions, exercises, and labs from content

**Files:**
- Modify: `study/web/scripts/course-export/studylib.py` (load + validate), `study/web/scripts/course-export/export_course.py` (emit), `study/web/lib/types.ts`, `study/web/lib/course.ts` (`contentStamp` also lists files under `sessions/`, `exercises/`, `labs/` recursively)
- Create: `study/content/exercises/harness.h`, test fixtures under `study/web/scripts/course-export/testdata/` (a minimal content root with one lecture, one topic with two `##` sections and one `:::check id=chk-x`, one function exercise, one program exercise, one lab, one session)
- Test: `study/web/scripts/course-export/test_sessions.py`

**Interfaces:**
- Produces (TS, in `types.ts`; the JSON the exporter prints must match exactly):
  ```ts
  export type ProgramCase = { name: string; args: string[]; stdin: string; expected: string; hint: string };
  export type Exercise = {
    id: string; title: string; mode: "function" | "program";
    statement: Block[]; hints: Block[][]; caseHints: Record<string, Block[]>;
    starter: string; solution: string;
    test: string | null; caseNames: string[];   // function mode
    cases: ProgramCase[];                        // program mode
  };
  export type Lab = { id: string; title: string; body: Block[]; zip: string }; // zip = "/labs/<id>.zip"
  export type SessionStep =
    | { kind: "learn"; id: string; title: string; blocks: Block[] }
    | { kind: "check"; id: string; block: Block }
    | { kind: "exercise"; id: string; exercise: Exercise }
    | { kind: "lab"; id: string; lab: Lab };
  export type Session = { id: string; lectureId: string; title: string; steps: SessionStep[] };
  // Course gains: sessions: Session[]; harness: string;
  // Lecture gains: sessionId: string | null;
  ```
- Session file format: frontmatter `id`, `lecture`, `title`; body is only `:::learn`, `:::check`, `:::exercise`, `:::lab` directives.
  - `:::learn from="<topic-id>#<section-slug>"` → `blocks` = that `##` section's blocks (heading excluded), `title` = heading text, `id` = `learn:<topic-id>#<slug>`.
  - `:::learn title="…"` with children → `blocks` = children, `id` = `learn:<index>`.
  - `:::check ref=<id>` → `block` = the `check` directive with that id from any topic; `id` = the check id.
  - `:::exercise ref=<id>` / `:::lab ref=<id>` → loaded from `exercises/<id>/` / `labs/<id>/`.
- `section_slug(text, used)` in Python must equal `slug()` in `study/web/components/Chapter.tsx`: lowercase, every run of non-`[a-z0-9]` → `-`, trim `-`, empty → `section`, repeats get `-2`, `-3`.
- Exercise README: frontmatter `title`; body blocks; `:::hint` directives become `hints` (in order); `:::case name="…"` directives become `caseHints[name]`; everything else is `statement`.
- Function mode iff `test.c` exists; `caseNames` = every first string argument of `CHECK("…"` in `test.c`, in order. Program mode iff `cases.yml` exists with key `cases:` (list of `name`, `args` (list, values stringified), `stdin` (default `""`), `expected`, `hint` (default `""`)).
- `harness.h` content (exact):
  ```c
  #include <stdio.h>
  #include <stdlib.h>
  #include <string.h>
  #define CHECK(name, cond, ...) do { if (cond) { printf("PASS %s\n", name); } else { printf("FAIL %s: ", name); printf(__VA_ARGS__); printf("\n"); } fflush(stdout); } while (0)
  ```

- [ ] **Step 1: Write failing `test_sessions.py`** (unittest, runs `export_course.py --root testdata` via `subprocess` and loads the JSON):
  - lecture has `sessionId == "lecture-1"`; `sessions[0].steps` kinds are, in order, `learn, learn, check, exercise, exercise, lab`.
  - the `from=` learn step's `title` equals the section heading and its blocks don't include the heading.
  - the function exercise has `mode "function"`, `caseNames` from its `test.c`, two `hints`, one `caseHints` entry.
  - the program exercise has `mode "program"` and `cases[0].args == ["3", "4"]`.
  - `harness` equals `harness.h` text; `lab.zip == "/labs/<id>.zip"`.
  - Validation errors (each a separate test, copy of testdata with one change, exporter exits 1 and stderr mentions it): unknown `from` slug; unknown check ref; unknown exercise ref; exercise with both or neither of `test.c`/`cases.yml`; program exercise with 0 or 4 cases; missing `starter.c` or `solution.c`; `caseHints` name not in `caseNames`; session `lecture` not a lecture id; lecture `session:` file missing.
- [ ] **Step 2: Run** `python3 -m unittest discover -s study/web/scripts/course-export -p 'test_*.py'`. Expected: FAIL.
- [ ] **Step 3: Implement** in `studylib.py`: `section_slug`, `load_sessions(model)` (adds `model["sessions"]`, `model["exercises"]`, `model["labs"]`, `model["harness"]`), validation appended to `validate_content`; and in `export_course.py` emit `sessions`, `harness`, `lectures[].sessionId`. Reuse `parse_topic` for READMEs and session files, `parse_yaml` for `cases.yml`. Do not run the existing topic directive validator on READMEs (it rejects `:::hint` outside a problem).
- [ ] **Step 4: Run** the unittest command. Expected: PASS. Then `npm run build` in `study/web`. Expected: succeeds (real content has no sessions yet; `sessions: []`).
- [ ] **Step 5: Commit and push** "Export sessions, exercises, and labs from the content folder."

---

### Task 5: Session page, stepper, and Learn/Check/Lab steps

**Files:**
- Create: `study/web/lib/session-store.ts`, `study/web/lib/session-store.test.ts`, `study/web/app/sessions/[id]/page.tsx`, `study/web/components/session/Stepper.tsx`, `LearnStep.tsx`, `CheckStep.tsx`, `LabStep.tsx`
- Modify: `study/web/app/page.tsx` (a "Start session" link to `/sessions/<sessionId>/` in each lecture header when `sessionId` is set), `study/web/app/globals.css` (session styles using existing tokens)

**Interfaces:**
- Consumes: `Session`, `SessionStep` (Task 4); `Blocks` from `components/Blocks.tsx`; `study-check` window event `{detail:{id, correct}}` fired by `CheckCard`.
- Produces:
  ```ts
  export type SessionState = { step: number; done: string[]; skipped: string[] };
  export function readSession(courseId: string, sessionId: string): SessionState;   // default {step:0,done:[],skipped:[]}
  export function writeSession(courseId: string, sessionId: string, s: SessionState): void;
  export function readCode(courseId: string, exerciseId: string): string | null;
  export function writeCode(courseId: string, exerciseId: string, code: string): void;
  export function clearCode(courseId: string, exerciseId: string): void;
  export function readFails(courseId: string, exerciseId: string): number;
  export function writeFails(courseId: string, exerciseId: string, n: number): void;
  // Stepper step components receive: { step: SessionStep; courseId: string; onComplete: () => void }
  ```

- [ ] **Step 1: Write failing `session-store.test.ts`** (jsdom environment): round-trips for each helper using the exact keys in Global Constraints; corrupt JSON → default state; a `localStorage` whose methods throw → reads return defaults/`null`/`0` and writes do not throw (Review Focus 5); `step` beyond range is clamped by the caller, not the store.
- [ ] **Step 2: Run** `npm test -- session-store`. Expected: FAIL. **Step 3: Implement.** **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Build the page and stepper.** `generateStaticParams` from `loadCourse().sessions`. Stepper behavior:
  - Progress bar with one segment per step: done, skipped, current, upcoming.
  - Shows only the current step. **Next** is enabled when the step id is in `done`; "Skip for now" moves on and adds the id to `skipped`. **Back** always works. Clicking a segment jumps to that step.
  - Learn step: marks itself done on mount.
  - Check step: renders `<Blocks blocks={[step.block]} />`; listens for `study-check` with matching id and `correct: true` → done.
  - Lab step: renders the body, a download link to `withBasePath(step.lab.zip)` (use `process.env.NEXT_PUBLIC_BASE_PATH` the same way the favicon does), and a checkbox "I finished this lab in VS Code" → done.
  - Exercise step: placeholder until Task 6.
  - Resumes at the stored `step`; the last step shows "Session finished" with counts of done and skipped steps.
- [ ] **Step 6: Verify** with a temporary session in `study/content` (one learn, one check, one lab): preview, click through, reload, confirm it resumes; then remove the temporary content (real content comes in Task 9). Expected: no console errors, layout fine at 390 px.
- [ ] **Step 7: Commit and push** "Add guided session pages with learn, check, and lab steps."

---

### Task 6: Code step: editor, Run, Test, hints, solution, fallback zip

**Files:**
- Create: `study/web/components/session/Editor.tsx`, `study/web/components/session/CodeStep.tsx`, `study/web/lib/zip.ts`, `study/web/lib/zip.test.ts`
- Modify: `study/web/package.json` (`codemirror`, `@codemirror/lang-cpp`, `@codemirror/lint`, `fflate`), `Stepper.tsx` (render `CodeStep`), `globals.css`

**Interfaces:**
- Consumes: `runProgram`, `GodboltError`, `COOLDOWN_MS` (Task 3); `classifyRun` outcomes, `buildTestSource`, `parseTestOutput`, `outputsMatch`, `splitDiagnostics`, `explainBuildError` (Task 2); store helpers (Task 5); `Course.harness`.
- Produces:
  ```ts
  // Editor.tsx (client, loaded with next/dynamic, ssr:false)
  export function Editor(props: { value: string; onChange(v: string): void; diagnostics: Diagnostic[]; onHoverLine?(line: number | null): void; highlightLines?: number[] }): JSX.Element;
  // zip.ts
  export function exerciseZip(ex: Exercise, studentCode: string, harness: string): Uint8Array;
  ```
  `exerciseZip` contents: `main.c` (student code), `Makefile`, `README.txt` (plain-text statement + "Run `make test`"), and for function mode `harness.h` + `test.c` with a Makefile `test` target that runs `cat main.c harness.h test.c > all.c`, compiles `all.c` with the Global Constraints flags, and runs it (the same order as `buildTestSource`); for program mode `cases/` with `<n>.args`, `<n>.in`, `<n>.out` and a Makefile `test` target that diffs each.

- [ ] **Step 1: Write failing `zip.test.ts`:** unzip (fflate `unzipSync`) and assert the file list for each mode and that `main.c` equals the student code.
- [ ] **Step 2: Run, implement, run.** Expected: PASS.
- [ ] **Step 3: Build `CodeStep`:**
  - Editor starts with `readCode() ?? exercise.starter`; `writeCode` debounced 500 ms. "Reset to starter" asks for confirmation, then `clearCode`.
  - **Run**: function mode compiles `buildTestSource(code, harness, test)` and shows raw output; program mode runs case 1's args/stdin and shows output.
  - **Test**: function mode → one request, `parseTestOutput(stdout, caseNames)`; program mode → one request per case, `outputsMatch`. Each failing case shows its message plus `caseHints[name]` / `cases[i].hint`. All pass → `onComplete()`. Otherwise `writeFails(n+1)`.
  - Outcomes: `compile-error` → diagnostics list + `hint`; editor underlines `splitDiagnostics(...).inEditor`; `inTests` listed under "In the test code". `timeout` → "Your program ran too long. Is there a loop that never stops?". `crash` → name + explanation. `ok` with `truncated` → output plus the cut-off note.
  - `GodboltError` → its message, **Retry**, and **Download to run in VS Code** (`exerciseZip`, filename `<id>.zip`). Rate-limited shows a countdown on the button.
  - Hints: "Show a hint" reveals the next one. **Show solution** visible when `readFails >= 2`; shows `exercise.solution` read-only.
  - Buttons disabled while in flight and for `COOLDOWN_MS` after.
  - Privacy note under the editor (exact copy in Global Constraints).
- [ ] **Step 4: Verify** in preview with a temporary exercise (copy of the Task 4 testdata function exercise): starter fails, solution passes, compile error underlines the right line, `for(;;);` shows the timeout message, offline (devtools offline or wrong base URL temporarily) shows Retry + download. Remove the temporary exercise.
- [ ] **Step 5: Commit and push** "Add the in-page C editor with run, test, hints, and offline download."

---

### Task 7: Assembly view

**Files:**
- Create: `study/web/components/session/AsmView.tsx`
- Modify: `CodeStep.tsx` (an **Assembly** button toggles the panel), `globals.css`

**Interfaces:**
- Consumes: `compileAsm`, `AsmLine` (Tasks 2–3); `Editor`'s `onHoverLine` and `highlightLines`.
- Produces: `AsmView(props: { lines: AsmLine[]; activeSourceLine: number | null; onHoverAsm(sourceLine: number | null): void })`.

- [ ] **Step 1: Implement.** Assembly compiles the student code alone (no harness/test). `-O0 / -O2` toggle refetches. Hovering a C line highlights asm lines with that `sourceLine`; hovering an asm line highlights its C line. Panel sits beside the editor on wide screens, below it under 768 px. Same error/cooldown handling as Run.
- [ ] **Step 2: Verify** in preview: hover mapping works both ways; `-O2` output is shorter for a loop. Screenshot.
- [ ] **Step 3: Commit and push** "Show the compiled assembly next to the code, with -O0 and -O2."

---

### Task 8: Lab zips, exercise check script, and CI

**Files:**
- Create: `study/web/scripts/build-labs.mjs`, `study/web/scripts/check-exercises.ts`
- Modify: `study/web/package.json` (devDependency `tsx`; scripts `"prebuild": "node scripts/build-labs.mjs"`, `"check:exercises": "tsx scripts/check-exercises.ts"`), `study/web/.gitignore` (+ `public/labs/`), `.github/workflows/pages.yml` (after Install: `npm test`, `python3 -m unittest discover -s scripts/course-export -p 'test_*.py'`, `npm run check:exercises`)

**Interfaces:**
- Consumes: exporter JSON (run `export_course.py --root ../..` like `lib/course.ts`); `buildTestSource`, `parseTestOutput`, `outputsMatch` (relative imports from `../lib/`).
- Produces: `public/labs/<id>.zip` for every lab folder, excluding `solution/`. `check:exercises` exits 1 with one line per problem.

- [ ] **Step 1: `build-labs.mjs`** zips each `study/content/labs/<id>/` (fflate `zipSync`) minus `solution/` into `study/web/public/labs/<id>.zip`.
- [ ] **Step 2: `check-exercises.ts`** in a temp dir, using `gcc` with the Global Constraints flags (and a 5 s run timeout), for every exercise:
  - solution: function mode — all `caseNames` pass; program mode — every case `outputsMatch`.
  - starter: compiles, and at least one case does not pass.
  - compiler warnings in solution count as a failure (keep reference code clean).
  For every lab: `make -C <lab> test SRC_DIR=solution` exits 0.
- [ ] **Step 3: Verify** with the Task 4 testdata exercises copied in temporarily: passes; then break a solution and confirm exit 1 naming that exercise. Remove the temporary copies.
- [ ] **Step 4: Commit and push** "Check every exercise with gcc in CI and package labs as zips."

---

### Task 9: Lecture 1 session content

All text follows `beginner-first-writing.mdc`. Every exercise README opens by saying which lesson idea it practices, explains each new word, and ends its statement with what "done" looks like.

**Files:**
- Create: `study/content/sessions/lecture-1.md`; the six exercise folders and one lab folder below
- Modify: `study/content/course.yml` (`session: sessions/lecture-1.md` on `lecture-1`; a changelog line dated 2026-10-28)

**Exercises** (id — lesson — mode — what the student writes — starter's deliberate flaw — case names):

| id | lesson | mode | task | starter flaw | cases |
|---|---|---|---|---|---|
| `ex-sum-squares` | why-low-level | function | `long long sum_squares(int n)` = 1²+…+n² | sums in an `int`, overflows | "small n", "n is zero", "n = 2000 needs a bigger type" |
| `ex-average` | c-data-types | function | `double average(int total, int count)` | `total / count` integer division | "even split", "7 / 2 is 3.5", "negative total" |
| `ex-swap` | memory-and-pointers | function | `void swap(int *a, int *b)` | swaps local copies | "two positives", "negative and positive", "same value" |
| `ex-best-student` | structures | function | `struct student { char name[32]; int id; int grade; };` given; `int best_index(const struct student *s, int n)` (first highest grade) | returns 0 | "best is last", "best is first", "tie keeps the first" |
| `ex-next-ticket` | source-to-process | function | `int next_ticket(void)` returns 1, 2, 3… across calls (static local) | plain local, always 1 | "first call is 1", "counts up", "ten calls" |
| `ex-sum-args` | command-line-arguments | program | prints the sum of the numbers after the program name, then newline | prints only `argv[1]` | `["3","4"]→"7\n"`, `[]→"0\n"`, `["-2","5","10"]→"13\n"` |

**Lab:** `lab-stride-timing` (why-low-level). Files: `README.md`, `Makefile` (`SRC_DIR ?= .`, `run` builds with `-O2` and runs, `test` builds and checks correctness only), `stride.c` (fills a 4096×4096 `int` array, times `sum_rows` and `sum_cols` with `clock_gettime(CLOCK_MONOTONIC)`, the two sum functions left as TODO returning 0), `solution/stride.c`. `make test` checks both sums equal the known total; the README asks the student to run `make run`, write down both times, and explain the difference in one sentence with what the lesson taught about reading memory in order.

**Session order:** for each of the six lessons in syllabus order: 1–3 `learn from=` steps covering its `##` sections (read the lesson to get the slugs), 1–2 of its existing `:::check` ids, then its exercise. The lab comes right after `ex-sum-squares`. Open with a short `learn title="How a session works"` step explaining Next, Skip, Run, Test, and hints.

- [ ] **Step 1: Write the six exercises and the lab.**
- [ ] **Step 2: Run** `npm run check:exercises`. Expected: PASS (every solution passes, every starter fails a case, lab test passes).
- [ ] **Step 3: Write the session file and course.yml change. Run** `npm run build`. Expected: succeeds; `out/sessions/lecture-1/index.html` exists.
- [ ] **Step 4: Reread every new file as a beginner** (rule's "Before finishing" check) and fix any unexplained word.
- [ ] **Step 5: Commit and push** "Add the Lecture 1 guided session with six coding exercises and a timing lab."

---

### Task 10: End-to-end browser verification and deploy

**Files:** none expected; fixes go in the files they belong to.

- [ ] **Step 1:** Preview `study-web`. For each Lecture 1 exercise, paste the starter → Test fails with the expected case names; paste `solution.c` → all pass and Next unlocks.
- [ ] **Step 2:** Trigger each error message once: compile error (underline on the right line), own `main` in a function exercise (Review Focus 1), endless loop, segfault, offline (Retry + download zip opens with the expected files).
- [ ] **Step 3:** Assembly hover mapping; `-O2` toggle.
- [ ] **Step 4:** Reload mid-session → resumes on the same step with the code kept. Check 390 px width and dark mode (resize_window).
- [ ] **Step 5:** `NEXT_PUBLIC_BASE_PATH=/high-performance-systems-programming npm run build`, serve `out/` with a static server under that path, and confirm the session page loads, a lab zip downloads, and Run works.
- [ ] **Step 6:** `npm test`, the Python unittest, and `npm run check:exercises` all pass. Commit any fixes, push, and confirm the GitHub Pages workflow succeeds (`gh run list --limit 1`).
