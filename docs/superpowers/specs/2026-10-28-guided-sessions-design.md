# Guided sessions with in-site coding — design

Date: 2026-10-28
Status: approved in conversation, awaiting written-spec review

## Goal

Make the study site a replacement for both the lectures and the practice
sessions (tirgulim) of High-Performance Systems Programming. The student should
be able to sit down, open one lecture's **session**, and be walked through it
step by step: read a little, answer a check, write and run real C code on the
page, and — only when the topic needs a real machine — do a lab in VS Code.

### What the student said

- The current site has the reading material but lacks **hands-on coding** and a
  **guided, step-by-step flow**.
- Coding should happen **inside the website** if possible, using an online
  compiler.
- Approach A was chosen: an in-site editor backed by Compiler Explorer
  (godbolt.org), with VS Code kept for labs that need threads, timing, or GPUs.

### Assumptions

- The site stays a static Next.js export on GitHub Pages. No backend.
- One student uses it; progress lives in the browser (`localStorage`), as today.
- Later lectures (caches, many-core, GPUs) will need more labs than Lecture 1.
- All new content follows `.cursor/rules/beginner-first-writing.mdc`.

### Success criteria

1. Lecture 1 has a full session: its existing checks, about 6 coding exercises
   (one per lesson) and 1 lab, all reachable from the lecture page.
2. In the browser, each exercise runs, tests, and shows assembly through
   Compiler Explorer; the reference solution passes and the starter fails.
3. Every failure mode in the table under *Error handling* shows a plain-words
   message and never loses the student's code.
4. CI refuses to deploy if any exercise solution fails its tests, any starter
   passes all of them, or any session reference is broken.
5. Adding Lecture 2's session needs only content files, no code changes.

## Non-goals

- Accounts, sync between devices, or a server of our own.
- An in-browser (WebAssembly) compiler.
- Running threads, OpenMP, CUDA, `perf`, or meaningful timing in the browser;
  those are labs.
- Rewriting the existing lesson pages. They remain the reference reading.

## 1. The guided session flow

One session = one lecture plus its practice session. Each lecture with a
`session:` entry gets a **Start session** button on its lecture page, leading to
`/sessions/<lecture-id>/`.

A session is an ordered list of **steps**, shown one at a time under a progress
bar:

| Step | What the student does |
|---|---|
| **Learn** | Reads one `##` section of an existing lesson (or a short session-only text). |
| **Check** | Answers one existing `:::check` question. |
| **Code** | Writes C in the on-page editor; Run, Test, and Assembly buttons. |
| **Lab** | Downloads a VS Code starter `.zip`, follows the commands shown, ticks "done". |

Rules:

- **Next** unlocks when the check is answered correctly or all tests pass.
  A small "skip for now" link is always present; skipped steps show as
  unfinished in the progress bar.
- Progress and the current step are stored with the existing
  `lib/progress.ts` mechanism, keyed by course id. Returning resumes at the
  last step.
- The editor's contents are saved to `localStorage` per exercise as the
  student types (debounced), and restored on load. A "Reset to starter" button
  restores the original.
- Hints open one at a time. **Show solution** appears after 2 failed test runs.

## 2. The code editor and tests

### Editor

- CodeMirror 6 with C syntax highlighting, themed with the site's light/dark
  tokens. Loaded with a dynamic import on session pages only.
- A one-line note under the editor: "Runs on godbolt.org — your code is sent
  there to compile."

### Compiler Explorer calls (`lib/godbolt.ts`)

- Endpoint: `POST https://godbolt.org/api/compiler/<id>/compile`, JSON in and out.
- One pinned gcc compiler id, kept as a single constant (e.g. gcc 14.x x86-64).
- Flags: `-std=c17 -Wall -Wextra -O0 -g`. Add
  `-fsanitize=address,undefined` only if build step 1 confirms the executor
  supports it.
- **Run:** `filters.execute = true`, `executeParameters = { args, stdin }`.
  Shows stdout, stderr, and exit code. Compiler diagnostics are parsed for
  `line:col` and underlined in the editor.
- **Assembly:** same endpoint without execute, Intel syntax, labels and
  directives filtered. Each assembly line carries its source line; hovering a C
  line highlights its instructions. A **-O0 / -O2** toggle recompiles.
- Buttons are disabled while a request is in flight; a 3-second cooldown
  follows each request.

### Two kinds of exercises

- **Function exercise** (`test.c`): the student writes functions, no `main`.
  The site sends `starter-or-student code` + `\n` + `test.c` as one source in
  one request. `test.c` contains `main`, runs each case, and prints exactly one
  line per case: `PASS <name>` or `FAIL <name>: <message>`. The site parses
  these lines; a missing summary (crash midway) counts the remaining cases as
  failed. Each case may map to a hint in the exercise README.
- **Whole-program exercise** (`cases.yml`): 1–3 cases, each with `args`,
  `stdin`, and `expected` stdout. One request per case. Comparison ignores
  trailing whitespace at line ends and a final newline.

## 3. Content layout

All under `study/content/`.

```
sessions/lecture-1.md          one per lecture
exercises/<id>/README.md        task, hints, per-case hint names
exercises/<id>/starter.c
exercises/<id>/test.c           function exercise, or…
exercises/<id>/cases.yml        …whole-program exercise
exercises/<id>/solution.c
labs/<id>/README.md             what to do and which commands to run
labs/<id>/Makefile              `make` builds, `make test` checks
labs/<id>/*.c, test files
```

### Session file

Front matter gives `id`, `lecture`, and `title`. The body is a sequence of
step blocks in the existing `:::` syntax:

```
:::learn from="memory-and-pointers#every-variable-has-a-value-and-an-address"
:::

:::learn title="Before you code"
A short session-only paragraph.
:::

:::check ref=chk-byte
:::

:::exercise ref=ex-swap
:::

:::lab ref=lab-stride-timing
:::
```

- `from="<topic-id>#<heading-slug>"` pulls one `##` section of a lesson, using
  the same slugs the lesson page uses for its "On this page" list.
- `check ref=` points at an existing `:::check id=` in any lesson.
- `course.yml` gains `session: sessions/lecture-1.md` on each lecture that has
  one.

### Labs

At build time each `labs/<id>/` folder is zipped into
`public/labs/<id>.zip`. The **Download to run in VS Code** fallback for a
code exercise (see *Error handling*) is generated in the browser from the
student's current code, the exercise's `test.c` or `cases.yml`, and a fixed
`Makefile` template.

### Lecture 1 content (first build)

- One session file walking through all six Lecture 1 lessons in order, using
  their existing checks.
- About 6 code exercises, one per lesson (e.g. integer division and
  conversions, swap through pointers, array sum with pointer walking, struct
  fill and print, a sizeof/padding prediction, `argc`/`argv` sum as a
  whole-program exercise).
- 1 lab: timing row-by-row versus column-by-column traversal of a large 2D
  array, from the "why the machine matters" lesson.

## 4. Error handling

The student's code is always saved locally first, so no error loses work.

| Situation | Detection | Message and action |
|---|---|---|
| Godbolt unreachable / 5xx / >15 s | fetch error, status, `AbortController` timeout | "The online compiler can't be reached right now." **Retry** and **Download to run in VS Code**. |
| Rate-limited | HTTP 429 | "Too many runs in a short time — try again in N seconds." Countdown on the button. |
| Endless program | executor timeout flag / exit status | "Your program ran too long. Is there a loop that never stops?" |
| Crash | exit code 139 / signal 11, and other signals | Names the signal and explains it in beginner terms (e.g. segmentation fault = used memory it doesn't own). |
| Huge output | length check | Shows the first 10,000 characters and says the rest was cut. |
| Compile error | non-zero build result | Diagnostics listed and underlined; Test and Run results not shown. |

**Stop condition:** if build step 1 finds Compiler Explorer rejects browser
requests from the GitHub Pages origin (CORS) or cannot execute programs, work
stops and the approach goes back to the student for a decision. No silent
switch to another service.

## 5. Testing

1. **Exercise check script** — new `study/web/scripts/check-exercises.mjs`,
   `npm run check:exercises`, run locally and as a CI step before `npm run
   build`. Using local gcc with the same flags, it verifies that every
   `solution.c` passes every case, every `starter.c` fails at least one, every
   `ref=` and `from=` in a session resolves, and every lab's `make test`
   passes with its reference code.
2. **Unit tests** — Vitest for network-free logic: parsing `PASS`/`FAIL`
   lines, whole-program output comparison, mapping godbolt responses and exit
   codes to the messages above, and diagnostic line parsing. Run in CI.
3. **Browser verification** — in the preview, run each Lecture 1 exercise
   against live Compiler Explorer with the solution (all pass) and the starter
   (fails); trigger each error message (offline, compile error, crash, endless
   loop); check 390 px width and dark mode; confirm a production static export
   with `NEXT_PUBLIC_BASE_PATH` still works.

## Build order

1. Verify Compiler Explorer from a browser page on a local dev server: CORS,
   execute with args and stdin, assembly with source lines, sanitizer support.
   Apply the stop condition if it fails.
2. Session route, step model, progress, and Learn/Check steps.
3. Editor, godbolt client, Run/Test/Assembly, error handling, unit tests.
4. Exercise and lab content format, check script, CI step, lab zips.
5. Lecture 1 session content, exercises, and lab.
6. Browser verification and a deploy.
