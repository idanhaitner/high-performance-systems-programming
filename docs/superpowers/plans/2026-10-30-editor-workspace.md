# Editor Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the coding step in guided sessions with a full-window, LeetCode-style workspace: question left, editor right, Run, Submit and Reset as the only code buttons.

**Architecture:** Exercises gain structured examples through the exporter. A generic `Split` component provides the dividers. `CodeStep` keeps its run logic and state but hands display to `QuestionPanel` and `ResultsPanel`. `Stepper` switches the page into workspace mode through a `data-workspace` attribute on `<html>`, which `app/workspace.css` uses to hide the page frame.

**Tech Stack:** Next.js 15 static export, React, TypeScript, CodeMirror 6, vitest with jsdom, Python exporter with unittest.

**Spec:** `docs/superpowers/specs/2026-10-30-editor-workspace-design.md`

All paths are relative to `study/web/` unless they start with `study/content/` or `docs/`.

## Global Constraints

- Exact button labels: `Run`, `Submit`, `Reset`. Busy labels: `Running…`, `Submitting…`.
- Divider starts: question 40% of width, results 35% of height. Limits: each side of the question divider at least 320px; editor at least 160px; results at least 120px.
- Divider keys: arrows 2%, Shift+arrows 10%, Home and End go to the limits, double-click returns to the start.
- Tab layout applies below 768px wide or below 500px tall: `(max-width: 767px), (max-height: 499px)`.
- Text at least 16px, labels at least 14px, code 14–15px. WCAG AA: 4.5:1 for text, 3:1 for control boundaries and focus rings, in light and dark.
- One accent (existing indigo tokens). Green and red only for pass and fail, always with a word or icon.
- No new runtime dependencies. No change to godbolt calls, cooldown, or saved-code storage.
- Do not change learn, check or lab steps, `components/Practice.tsx`, or lesson pages.
- Content follows `.cursor/rules/beginner-first-writing.mdc`. Examples never reveal the approach a hint gives.
- The course is English and left to right. Dividers do not handle right-to-left dragging.
- Component tests live in `lib/*.test.ts` and use `createElement`, following `lib/practice-card.test.ts`, because vitest only includes `lib/**/*.test.ts`.
- Commit and push after each task, with a one-sentence message ending in the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Each pushed task must leave the live site coherent.

## Review Focus

1. A divider position saved on a large monitor, opened in a small window: both panes must still meet their minimums, and the saved preference is not overwritten by the temporary fit. Tests in Task 3.
2. Saved divider value is corrupt, out of range, or storage is blocked: the starting position is used with no error. Tests in Task 3.
3. Leaving a coding step by any route (Back, Next, step bar, the Reread link, browser back): the sidebar and page scroll return. Test in Task 5.
4. Typing, then switching Question and Code tabs or resizing across 768px: code, undo history and cursor survive, because the editor is never unmounted. Browser check in Task 5.
5. A very long brief, very long output, or wide assembly: each panel scrolls on its own, the page itself never scrolls, and the action row stays visible. Browser check in Task 5.

---

### Task 1: Carry examples through the exporter

Examples show in the old layout after the brief, so the site stays coherent until Task 5.

**Files:**
- Modify: `scripts/course-export/studylib.py` (directive set near line 44; `_load_exercise` near line 1300)
- Modify: `scripts/course-export/testdata/study/content/exercises/add-two/README.md`
- Test: `scripts/course-export/test_sessions.py`
- Modify: `lib/types.ts`, `components/session/rendered.ts`, `app/sessions/[id]/page.tsx`, `components/session/CodeStep.tsx`, `lib/zip.ts`
- Test: `lib/zip.test.ts`

**Interfaces:**
- Produces: `Exercise.examples: Block[][]` and `RenderedStep.examples?: ReactNode[]`.

- [ ] **Step 1: Write the failing exporter test**

Add a `:::example` block to the `add-two` fixture, then add to `ExportTests`, finding the step whose `exercise.id` is `add-two`:

```python
def test_examples_are_separated_from_the_statement(self):
    exercise = self.exercise("add-two")
    self.assertEqual(len(exercise["examples"]), 1)
    names = [b.get("name") for b in exercise["statement"]]
    self.assertNotIn("example", names)
```

Add a small `exercise(self, id)` helper to the class if none exists.

- [ ] **Step 2: Run it and confirm it fails**

Run: `python3 -m unittest discover -s scripts/course-export -p 'test_*.py'`
Expected: FAIL. The export rejects the unknown directive, or `examples` is missing.

- [ ] **Step 3: Implement the exporter change**

Add `"example"` to the directive set. In `_load_exercise`, add an `examples` list, append `block["children"]` when `name == "example"`, and return it under `"examples"`.

- [ ] **Step 4: Run it and confirm it passes**

Run the same command. Expected: `OK`.

- [ ] **Step 5: Write the failing zip test**

```ts
it("includes the examples in README.txt", () => {
  const ex = { ...base, examples: [[{ type: "paragraph", text: "add(2, 3) is 5" }]] } as Exercise;
  const readme = strFromU8(unzipSync(exerciseZip(ex, ex.starter, ""))["README.txt"]);
  expect(readme).toContain("Examples");
  expect(readme).toContain("add(2, 3) is 5");
});
```

Adjust the unzip lookup to match how the existing tests in that file read `README.txt`.

- [ ] **Step 6: Run it and confirm it fails**

Run: `npx vitest run lib/zip.test.ts`
Expected: FAIL on the missing text.

- [ ] **Step 7: Implement the data and display changes**

- Add `examples: Block[][]` to `Exercise` in `lib/types.ts`, and `examples: []` to every `Exercise` test fixture (`grep -rn "caseHints: {}" lib`).
- In `lib/zip.ts`, have `readme` add an `Examples` section after the statement, only when there are examples, using `blockText`.
- Add `examples?: ReactNode[]` to `RenderedStep`, and fill it in `renderStep` in `page.tsx` the same way as `hints`.
- In `CodeStep`, render `rendered.examples` directly after `rendered.content`.

- [ ] **Step 8: Run all checks**

Run: `npm test && python3 -m unittest discover -s scripts/course-export -p 'test_*.py' && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 9: Commit and push**

Message: `Let exercise briefs carry examples as their own blocks.`

### Task 2: Write examples for all 28 exercises

**Files:**
- Modify: `study/content/exercises/*/README.md` (all 28)
- Modify: `scripts/check-exercises.ts`

- [ ] **Step 1: Add the failing check**

In `check-exercises.ts`, add `examples: unknown[]` to the local `Exercise` type. For each exercise with an empty list, add the problem `` `${id}: needs at least one :::example block` ``.

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run check:exercises`
Expected: FAIL, with 28 problems about missing examples.

- [ ] **Step 3: Write the examples**

For each brief, add one to three blocks directly after the statement text and before the first `:::hint`, in this exact format:

```
:::example
**Input:** `average(7, 2)`

**Output:** `3.5`
:::
```

- Function exercises: Input is the call. Program exercises (the 4 with `cases.yml`): Input is the command line or typed input, Output is what the program prints.
- Take values from that exercise's `test.c` or `cases.yml`. Add an optional `**Why:**` line only where it helps a beginner, and never state the approach from a hint.
- Move existing example bullet lists and prose examples into blocks, so nothing appears twice. Find the lists with `grep -lE '^- \`' study/content/exercises/*/README.md`.
- Keep the line "You are done when Test shows…" unchanged. Task 5 renames it together with the button.

- [ ] **Step 4: Cross-check each example against its tests**

For each exercise, confirm each example's Input and Output appears in `test.c` or `cases.yml`, or follows from running `solution.c` with it. Fix any that disagree.
Expected: every example verified, listed in the task report.

- [ ] **Step 5: Run the check**

Run: `npm run check:exercises`
Expected: `28 exercises, 2 labs checked: all good`.

- [ ] **Step 6: Commit and push**

Message: `Give every exercise worked examples of a correct answer.`

### Task 3: Split divider

**Files:**
- Create: `lib/split.ts`, `lib/split.test.ts`, `components/session/Split.tsx`
- Modify: `lib/session-store.ts`, `lib/session-store.test.ts`

**Interfaces:**
- Produces, in `lib/split.ts`:
  - `type Limits = { min: number; max: number }`
  - `fractionLimits(total: number, minFirst: number, minSecond: number): Limits`
  - `clampFraction(fraction: number, limits: Limits): number`
  - `moveFraction(current: number, key: string, shift: boolean, orientation: "vertical" | "horizontal", limits: Limits): number | null`
  - `parseSaved(raw: string | null, fallback: number): number`
- Produces, in `lib/session-store.ts`: `readSplit(courseId: string, name: string): string | null` and `writeSplit(courseId: string, name: string, fraction: number): void`, using the key `` `${storageKey(courseId)}:split:${name}` `` and the file's existing safe `get` and `set`.
- Produces, in `Split.tsx`: `Split` with props `{ courseId: string; name: string; orientation: "vertical" | "horizontal"; start: number; minFirst: number; minSecond: number; label: string; first: ReactNode; second: ReactNode; className?: string }`. `"vertical"` means a vertical divider with panes side by side, and `start` is the first pane's share.

- [ ] **Step 1: Write the failing logic tests in `lib/split.test.ts`**

```ts
const wide = fractionLimits(1000, 320, 320);

it("keeps both panes at their minimums", () => {
  expect(wide).toEqual({ min: 0.32, max: 0.68 });
});
it("clamps a position saved on a larger window", () => {
  expect(clampFraction(0.9, wide)).toBe(0.68);
});
it("splits by the minimums when the window is too small for both", () => {
  const tight = fractionLimits(320, 320, 320);
  expect(tight.min).toBe(0.5);
  expect(tight.max).toBe(0.5);
});
it("does not limit before the size is known", () => {
  expect(fractionLimits(0, 320, 320)).toEqual({ min: 0, max: 1 });
});
it("moves by 2%, or 10% with Shift, on the divider's own axis", () => {
  expect(moveFraction(0.4, "ArrowRight", false, "vertical", wide)).toBeCloseTo(0.42);
  expect(moveFraction(0.4, "ArrowLeft", true, "vertical", wide)).toBeCloseTo(0.32);
  expect(moveFraction(0.65, "ArrowDown", false, "horizontal", wide)).toBeCloseTo(0.67);
  expect(moveFraction(0.4, "ArrowUp", false, "vertical", wide)).toBeNull();
});
it("goes to the limits with Home and End", () => {
  expect(moveFraction(0.4, "Home", false, "vertical", wide)).toBe(0.32);
  expect(moveFraction(0.4, "End", false, "vertical", wide)).toBe(0.68);
});
it.each([[null], ["abc"], ["-1"], ["2"], ["NaN"], ["0"], ["1"]])("falls back on saved value %s", (raw) => {
  expect(parseSaved(raw, 0.4)).toBe(0.4);
});
it("reads a valid saved value", () => {
  expect(parseSaved("0.55", 0.4)).toBe(0.55);
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx vitest run lib/split.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/split.ts`**

- [ ] **Step 4: Run them and confirm they pass**

- [ ] **Step 5: Write failing component and storage tests**

In `lib/split.test.ts`, under `// @vitest-environment jsdom`, render `Split` with a stubbed `getBoundingClientRect` width of 1000 and check:

- The divider has `role="separator"`, `aria-orientation="vertical"`, `aria-label`, `tabindex="0"`, and `aria-valuenow="40"`, with `aria-valuemin="32"` and `aria-valuemax="68"`.
- Dispatching `ArrowRight` gives `aria-valuenow="42"` and saves it, and a remount shows 42.
- `Shift+ArrowLeft` from 40 gives 32, the limit.
- A double-click returns to 40.
- With a stored `"garbage"`, it renders at 40 and does not throw.
- With `localStorage.getItem` stubbed to throw, it renders at 40.
- A saved `0.9` displays at 68 but stays `0.9` in storage, until the student moves the divider.

- [ ] **Step 6: Run them and confirm they fail**

- [ ] **Step 7: Implement `Split.tsx` and the storage functions**

- Set the position as an inline `--split` custom property on the root `.split` element. Add `data-orientation` for CSS.
- Drag with pointer events and `setPointerCapture`, saving on pointer up.
- Use `ResizeObserver`, guarded with `typeof ResizeObserver`, to re-clamp the displayed value. Keep the saved preference in a ref, so fitting a small window never overwrites it.
- Render both panes at all times.

- [ ] **Step 8: Run all tests**

Run: `npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 9: Commit and push**

Message: `Add a draggable, keyboard-friendly divider that remembers its place.`

### Task 4: Question and results panels

**Files:**
- Create: `components/session/QuestionPanel.tsx`, `components/session/ResultsPanel.tsx`
- Modify: `components/session/AsmView.tsx`
- Test: `lib/question-panel.test.ts`, `lib/results-panel.test.ts`

**Interfaces:**
- Produces: `QuestionPanel` with props `{ title: string; content: ReactNode; examples: ReactNode[]; hints: ReactNode[]; renderSolution: () => ReactNode; focusTitle: boolean }`. It owns the hint and solution open state, moved from `CodeStep`.
- Produces: `ResultsPanel` with props `{ tab: "output" | "assembly"; onTab(tab: "output" | "assembly"): void; output: ReactNode; assembly: ReactNode }`.
- Changes: `AsmPanel` gains `onUpdate(): void`.

- [ ] **Step 1: Write the failing tests**

`QuestionPanel`:

- Shows headings Description and Examples, and "Example 1", "Example 2" for two examples. With no examples it has no Examples heading.
- Hints starts as a closed button with `aria-expanded="false"`, labelled `Hints (0 of 3)`, with no hint text showing.
- The first click shows hint 1 and `Hints (1 of 3)`. `Next hint` shows hint 2.
- Closing and reopening keeps 2 hints showing.
- With no hints, there is no Hints button.
- Solution is closed, and `renderSolution` is not called until opened.
- With `focusTitle` true the title has focus on mount, and with false it does not.

`ResultsPanel`:

- `role="tablist"`, with two `role="tab"` elements named Output and Assembly, and `aria-selected` on the current one.
- Clicking calls `onTab`.
- `ArrowRight` from Output calls `onTab("assembly")` and `ArrowLeft` from Output wraps to Assembly.
- Only the selected tab's panel is visible, and the output panel is inside an `aria-live="polite"` region.

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx vitest run lib/question-panel.test.ts lib/results-panel.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the panels**

- The title is an `h2` with `tabIndex={-1}`.
- `ResultsPanel` keeps both panels mounted, hiding the other with `hidden`, so the output's live region stays in place.
- In `AsmPanel`, replace the stale text with `Your code changed.` plus an `Update` button that calls `onUpdate`, disabled when `locked`.

- [ ] **Step 4: Run them and confirm they pass**

- [ ] **Step 5: Commit and push**

Message: `Add the question and results panels for the coding workspace.`

### Task 5: Assemble the workspace

This task lands the visible change in one commit, including the wording, so the buttons and the text always agree. Use the `frontend-design:frontend-design` skill for visual details, inside the Global Constraints.

**Files:**
- Create: `lib/workspace.ts`, `lib/workspace.test.ts`, `components/session/WorkspaceBar.tsx`, `app/workspace.css`
- Modify: `components/session/CodeStep.tsx`, `components/session/ExerciseStep.tsx`, `components/session/Stepper.tsx`, `app/layout.tsx`, `app/globals.css`
- Modify: `study/content/exercises/*/README.md`, `study/content/sessions/lecture-1.md`, `study/content/sessions/lecture-2.md`

**Interfaces:**
- Produces: `useWorkspaceMode(active: boolean): void` in `lib/workspace.ts`, which sets `document.documentElement.dataset.workspace = ""` in `useLayoutEffect` and removes it on cleanup.
- Produces: `WorkspaceBar` with props `{ lectureNumber: number | null; step: number; total: number; lesson?: { id: string; title: string }; canGoBack: boolean; onBack(): void; onSkip(): void; canSkip: boolean; onNext(): void; canNext: boolean; nextLabel: string }`.
- Consumes: `Split`, `QuestionPanel`, `ResultsPanel`, `RenderedStep.examples`.

- [ ] **Step 1: Write the failing tests in `lib/workspace.test.ts`**

```ts
it("marks the page while active", () => { /* render with true */ expect("workspace" in document.documentElement.dataset).toBe(true); });
it("clears the mark when no longer active", () => { /* rerender with false */ expect("workspace" in document.documentElement.dataset).toBe(false); });
it("clears the mark on unmount, such as following the Reread link", () => { /* unmount */ expect("workspace" in document.documentElement.dataset).toBe(false); });
```

For `WorkspaceBar`, test that:

- It shows `Step 3 of 26`, the Reread link to `/topics/<id>`, and a `Lecture 1` link to `/#deck`.
- Next is disabled when `canNext` is false.
- Next has class `btn-primary` only when `canNext` is true.
- `nextLabel` is displayed.

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx vitest run lib/workspace.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the hook and `WorkspaceBar`**

- [ ] **Step 4: Run them and confirm they pass**

- [ ] **Step 5: Rewire `Stepper`**

- Call `useWorkspaceMode(ready && current?.kind === "exercise")`.
- On coding steps render `WorkspaceBar`, then the step bar `ol`, then the step. Do not render `.session-head` or `.session-nav`. Other steps are unchanged.
- Pass `moved={dir !== 0}` to `ExerciseStep`, and through to `CodeStep`.

- [ ] **Step 6: Rewire `CodeStep`**

- Structure: a `Split` (`name="question"`, vertical, start `0.4`, mins 320 and 320). First pane is `QuestionPanel` with `focusTitle={moved}`. Second pane is a `Split` (`name="results"`, horizontal, start `0.65`, mins 160 and 120) with `Editor` first and `ResultsPanel` second, then the action row below it.
- Action row: `Reset` on the left (quiet), `Run` (secondary) and `Submit` (primary until `done`, then secondary) on the right. Keep the reset confirmation as it is, shown in place of the row.
- Add `tab` state. `act("run")` and `act("test")` switch to Output, as does any error from any action, including assembly.
- Selecting the Assembly tab calls `act("asm")` when `!asm || asm.code !== code`. If the code changes while the tab stays open, nothing compiles until the student presses Update, which calls `act("asm")` through `AsmPanel.onUpdate`.
- Output before the first run shows exactly: `Run shows what your code prints. Submit checks it against the tests. Both send your code to godbolt.org, a website that compiles C.`
- Add `view` state, `"question" | "code"`, rendered as a `role="tablist"` at the top of the workspace, which CSS shows only in the tab layout. Setting it only changes a `data-view` attribute. The editor is never conditionally rendered.
- Remove the Format button, the "Show assembly" button, `.code-foot` and `.code-help`. Keep `tidy`, its shortcuts, and Retry and Download in the error state.

- [ ] **Step 7: Write `app/workspace.css` and import it in `layout.tsx` after `landing.css`**

Scope everything under `html[data-workspace]`:

- `display: none` on `.rail`, `.session-masthead`, and the reading progress bar. Single-column `.shell`, no card padding on `.page.chapter`.
- `html` and `body` at `100dvh` with `overflow: hidden`. `.session` as a flex column with `min-height: 0` all the way down through `.step-in`.
- `.split` grid using `--split` for the first track, with the divider between. A hit target at least 8px wide, and a visible focus ring.
- `.cm-editor { height: 100% }`, overriding the theme's `.cm-scroller` minimum height.
- Each panel `overflow: auto`, keeping `.cm-scroller`'s own scroll.
- Question panel text capped at `max-width: 70ch`, with plain headings in one weight and no boxes, pills or colored chips.
- `@media (max-width: 767px), (max-height: 499px)`: dividers hidden, panes shown according to `data-view`, the view tablist shown, and the Code view scrolling.

Remove the rules in `globals.css` for classes that no longer exist: `.code-foot`, `.code-help*`, `.code-privacy`, `.code-split`. Check with grep that nothing else uses them.

- [ ] **Step 8: Update the wording**

- In all 28 briefs, replace `You are done when Test shows` with `You are done when Submit shows`.
- In `study/content/exercises/ex-sum-squares/README.md`, replace `The Test button` with `The Submit button`.
- Replace line 12 of both session files with exactly:

```
A coding exercise gives you the function's first line, and the panel on the left says what it must do. You write the rest on the right. **Run** shows what your code prints. **Submit** checks it against small test cases, and all of them must pass. Your code is tidied by itself each time you press either one, or when you press Ctrl+S (Cmd+S on a Mac). The **Assembly** tab shows the machine instructions the compiler made; it is there if you are curious. If you get stuck, **Hints** opens one hint at a time, and **Solution** shows a finished answer. Try the exercise first, because you learn more that way. To move out of the editor with the keyboard, press Esc and then Tab.
```

- Confirm nothing stale remains: `grep -rnE '\bTest\b (shows|button)|Test my code|Show assembly' ../content` gives no output.

- [ ] **Step 9: Check Review Focus items 4 and 5 in the browser**

Use `preview_start` with `study-web`, and open a coding step at 1024×768.

- Type in the editor, switch to the phone viewport and back, and switch Question and Code tabs. Expected: code, cursor and undo all survive.
- With a long brief and long output, run: `document.documentElement.scrollHeight === innerHeight`. Expected: `true`, and the action row is inside the window.
- Assembly with a wide line scrolls inside its panel.

- [ ] **Step 10: Run all checks**

Run: `npm test && python3 -m unittest discover -s scripts/course-export -p 'test_*.py' && npm run check:exercises && npx tsc --noEmit && npm run build`
Expected: all pass.

- [ ] **Step 11: Commit and push**

Message: `Turn coding exercises into a full-window split workspace.`

### Task 6: Keyboard shortcuts and focus

**Files:**
- Modify: `lib/workspace.ts`, `lib/workspace.test.ts`, `components/session/CodeStep.tsx`

**Interfaces:**
- Produces: `workspaceShortcut(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">): "run" | "submit" | null`.

- [ ] **Step 1: Write the failing tests**

```ts
const key = (o: object) => ({ key: "Enter", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...o });
it("runs on Ctrl or Cmd + Enter", () => {
  expect(workspaceShortcut(key({ ctrlKey: true }))).toBe("run");
  expect(workspaceShortcut(key({ metaKey: true }))).toBe("run");
});
it("submits with Shift added", () => {
  expect(workspaceShortcut(key({ ctrlKey: true, shiftKey: true }))).toBe("submit");
});
it("ignores plain Enter, Alt, and other keys", () => {
  expect(workspaceShortcut(key({}))).toBeNull();
  expect(workspaceShortcut(key({ ctrlKey: true, altKey: true }))).toBeNull();
  expect(workspaceShortcut(key({ key: "a", ctrlKey: true }))).toBeNull();
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npx vitest run lib/workspace.test.ts`
Expected: FAIL, `workspaceShortcut` is not exported.

- [ ] **Step 3: Implement and wire them**

- Add `workspaceShortcut` to `lib/workspace.ts`.
- In `CodeStep`, add a `document` `keydown` listener in the capture phase, so it runs before CodeMirror's `Mod-Enter` binding. On a match, call `preventDefault` and `stopPropagation`, then `act`. `act` already ignores presses while locked. Do nothing while the reset confirmation is open.
- Add the shortcuts to the buttons' `title` and `aria-keyshortcuts`: `Control+Enter Meta+Enter` for Run, and `Control+Shift+Enter Meta+Shift+Enter` for Submit.

- [ ] **Step 4: Run them and confirm they pass**

- [ ] **Step 5: Check keyboard use in the browser**

In the open preview, using keyboard actions only:

- `Cmd/Ctrl+Enter` inside the editor runs the code and adds no blank line.
- `Esc` then `Tab` leaves the editor. CodeMirror's `tabFocusMode` already provides this, so no key binding should be needed. If it does not work, add one.
- Tab reaches every control in order, and the dividers move with arrow keys.
- Next moves focus to the new question's title. Opening the page does not move focus.

- [ ] **Step 6: Commit and push**

Message: `Add Run and Submit shortcuts, and move focus to each new question.`

### Task 7: Final verification

Use the `superpowers:verification-before-completion` skill. This task fixes what it finds and changes nothing else.

- [ ] **Step 1: Check the success criteria in the browser**

At 1024×768 and 1440×900:

- Criterion 1: the question, editor, and all three buttons are in the first screen.
- Criterion 2: the buttons in the workspace's action row are exactly Run, Submit, Reset.
- Criterion 3, on a function exercise and on a program exercise (`ex-count-args`): Run, Submit, solved state with Next as primary, Reset and its confirmation, hints, solution, Assembly with line highlighting and `-O2`, Skip and return through the step bar, and saved code after reload.
- Divider positions survive a reload.
- A learn, check and lab step show today's page with the sidebar back, and so does the finished screen.
- Block godbolt.org in the browser or simulate it failing, if possible, to see Retry and Download. If this can't be simulated, say so in the report.

- [ ] **Step 2: Measure contrast**

With `javascript_tool`, compute WCAG ratios from rendered colors for: question text, headings, button labels in each state, tab labels, step bar segments, divider, focus ring, and pass and fail text. Do this in light and dark using `resize_window` with `colorScheme`.
Expected: at least 4.5:1 for text and 3:1 for control boundaries and rings. Fix any failure in `workspace.css`.

- [ ] **Step 3: Check the phone layout at 375px**

Expected: Question and Code tabs, no horizontal page scroll, text at least 16px, no console errors.

- [ ] **Step 4: Run every CI step locally**

Run: `npm test && python3 -m unittest discover -s scripts/course-export -p 'test_*.py' && npm run check:exercises && npm run build`
Expected: all pass.

- [ ] **Step 5: Commit fixes, push, and wait for GitHub**

```bash
gh run watch "$(gh run list --commit "$(git rev-parse HEAD)" --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status
```

Expected: exit 0, with `build` and `deploy` both successful for the final commit. Name the run in the report.
