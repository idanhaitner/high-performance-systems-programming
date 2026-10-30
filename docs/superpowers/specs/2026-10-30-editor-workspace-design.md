# Editor workspace for coding exercises — design

Date: 2026-10-30

## Goal

Replace the cluttered coding step in guided sessions with a LeetCode-style workspace: the question on the left, the editor on the right, a divider between them that can be dragged, and a calm screen with only three main buttons.

### What the student said

- The code editor in the guided session has become messy: too many colors, too many buttons, cluttered question text.
- Use a split layout with a resizable divider, question panel on the left, code editor on the right.
- Give the question panel clean typography and clear sections for description, examples, and hints.
- Use a minimal, consistent color palette.
- Keep only the essential buttons: Run, Submit, Reset.
- Make it accessible: good contrast, keyboard navigation, readable font sizes.

Decisions made while brainstorming:

- **Other tools move rather than disappear.** Format loses its button. Solution becomes a section in the question panel. Assembly becomes a tab next to Output.
- **Coding steps fill the whole window.** The course sidebar, page title and lesson chips are hidden on those steps.
- **Every exercise gets written examples.** All 28 briefs get example blocks in one fixed format.

### Assumptions

- Submit is today's "Test my code" under a new name, and it still marks the step complete.
- Learn, check and lab steps keep today's page.
- Practice cards (`components/Practice.tsx`) and lesson pages are not part of this work.

### Success criteria

1. At 1024×768, opening a coding step shows the question, the editor and Run, Submit and Reset without scrolling the page. Today the editor starts 937px down.
2. The workspace shows exactly three action buttons for the code: Run, Submit, Reset. The only exception is the Retry and Download pair after godbolt.org fails. Step navigation in the top bar (Back, Skip for now, Next) and the Hints and Solution toggles in the question panel are separate from these.
3. Every feature that exists today still works: hints, solution, assembly with its line highlighting, formatting, skip, reset confirmation, and saved code.
4. Every text and control color pair meets WCAG AA (4.5:1 for text, 3:1 for control boundaries and focus rings) in light and dark.
5. Everything in the workspace can be done with the keyboard alone, including moving the dividers and leaving the editor.
6. All 28 briefs have at least one example, and `check:exercises` fails if one is missing.
7. The GitHub run for the final commit passes.

## Non-goals

- No new exercises, and no change to what the tests check.
- No change to how code runs: same godbolt.org calls, same cooldown, same saved-code storage.
- No custom layouts beyond the two dividers (no moving panels, no pop-out windows).
- No redesign of learn, check or lab steps.

## 1. Layout

```
┌─ ← Lecture 1 · Step 3 of 26 · Reread lesson ───── Back  Skip  Next ─┐
│ ▬▬▬▬▬▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭  (clickable step bar)                      │
├───────────────────────┬─┬───────────────────────────────────────────┤
│ Title                 │ │                                           │
│ Description           │ │  Editor                                   │
│ Examples              │ │                                           │
│ ▸ Hints (0 of 3)      │ ├───────────────────────────────────────────┤
│ ▸ Solution            │ │ Output | Assembly                         │
│                       │ │                                           │
│                       │ │ Reset                       Run   Submit  │
└───────────────────────┴─┴───────────────────────────────────────────┘
```

**Full window.** When the current step is an exercise, `Stepper` sets `data-workspace` on `<html>`, and removes it when the step changes or the page closes. CSS then:

- hides `.rail`, the session masthead and the reading progress bar with `display: none`, so they also leave the keyboard's tab order;
- sets the page to the window's height (`100dvh`) with no page scroll, so each panel scrolls on its own.

If a page loads directly onto a coding step, the session header can show briefly until the browser's JavaScript runs, because the saved step is only known then. This is accepted, since the fix would be a blocking script in the page head.

**Top bar.** It replaces `.session-head` and `.session-nav` on coding steps. It holds a link back to the lecture, "Step N of M", the Reread link, and Back, Skip for now and Next. The clickable step bar stays as a thin strip under it, because it is how students return to skipped steps.

**Dividers.**

| Divider | Starting position | Limits |
| --- | --- | --- |
| Question and editor (vertical) | Question takes 40% of the width | Each side at least 320px |
| Editor and results (horizontal) | Results take 35% of the height | Editor at least 160px, results at least 120px |

Positions are saved in the browser as one preference for all exercises, not one per exercise. If storage is unavailable, the starting positions are used.

**Small windows.** Below 768px wide, or below 500px tall, the split becomes two tabs, Question and Code, with no dividers. The Code tab stacks the editor, the results and the action row, and that tab scrolls. The chosen tab resets to Question on each new step.

**Assembly.** The editor stays full width in the right column, and assembly moves out of its current side-by-side position into the results area.

## 2. Question panel

Sections, in order, with one heading style:

1. **Title**, as the panel's main heading.
2. **Description**, from the brief's text.
3. **Examples**, from the new example blocks, numbered "Example 1", "Example 2".
4. **Hints**, collapsed and showing how many are revealed ("Hints (1 of 3)"). The first opening reveals hint 1. "Next hint" reveals the rest one at a time. Closing keeps the count, as it does today.
5. **Solution**, collapsed, showing the read-only editor when opened. It is available at any time, as it is today.

Text is at least 16px with a line length capped by the panel width at about 70 characters. Headings are plain text in one weight, with no boxes, pills or colored chips.

## 3. Content changes

**Example block.** A new `:::example` directive in each brief's `README.md`:

```
:::example
**Input:** `average(7, 2)`

**Output:** `3.5`
:::
```

- Input is the call for a function exercise. For a program exercise it is the command line or typed input, and output is what the program prints.
- Each brief gets one to three examples, and an optional short **Why:** line where it helps.
- Examples show what a correct answer looks like and never how to reach it. They must not contain the approach that a hint reveals. This follows the "no spoon-feeding" preference for exercises.
- Values come from the exercise's real test cases where possible, so an example can never disagree with the tests.
- Bullet lists of examples already in the briefs (4 of 28) and examples written in the prose move into example blocks, so nothing appears twice.
- Text follows `beginner-first-writing.mdc`.

**Parser and data.**

- `studylib.py`: add `example` to the known directives, and in `_load_exercise` collect example blocks separately from the statement.
- `lib/types.ts`: `Exercise` gains `examples: Block[][]`.
- `app/sessions/[id]/page.tsx`: render them into `RenderedStep` as `examples`.
- `lib/zip.ts`: the downloaded `README.txt` is built from `statement` only, so it must add the examples or they would vanish from the download.
- `scripts/check-exercises.ts`: fail when an exercise has no examples.

**Wording that the redesign makes wrong.**

- All 28 briefs say "You are done when Test shows…". Change "Test" to "Submit".
- Any brief that mentions the Test button in other wording changes the same way, such as "The Test button calls your function".
- Line 12 of both `content/sessions/lecture-1.md` and `lecture-2.md` explains the old controls: "the task above the editor", Format, Run or Test, Test my code, Show assembly. Rewrite it for the new screen.

## 4. Buttons and behavior

**Action row**, always visible at the bottom of the right column:

- **Reset** on the left, quiet. It keeps today's confirmation, shown in place of the row, with focus moving to "Keep my code", Escape to cancel, and focus returning afterward.
- **Run** on the right, secondary.
- **Submit** on the right, primary.

Run and Submit call the existing `act("run")` and `act("test")`, and keep the busy labels ("Running…", "Submitting…"), cooldown and rate-limit behavior. Once a step is solved Submit becomes secondary, and Next in the top bar becomes the one primary button. This keeps today's rule.

**Format.** The button goes. Formatting still runs before every Run and Submit, and `Shift+Alt+F` and `Cmd/Ctrl+S` still work. The session intro mentions the shortcut.

**Results area**, with two tabs:

- **Output** shows the existing `OutcomeView` and `CaseList`. Run and Submit switch to it. Before the first run it shows a short line explaining what will appear there, plus the note that code is sent to godbolt.org to compile. That note replaces today's paragraph under the buttons.
- **Assembly** moves the existing `AsmPanel` here, with its optimization toggle and its line highlighting between C and assembly. Opening the tab compiles if nothing current is shown. When the code has changed since, the panel offers Update. There is no more "Show assembly" button.

**When godbolt.org fails**, Output shows the message with Retry and "Download to run in VS Code", as it does today. They appear only in this state.

## 5. Code structure

`CodeStep.tsx` is 345 lines and does everything. It is split along the new layout:

| Unit | Job |
| --- | --- |
| `components/session/Split.tsx` | A generic two-pane divider: drag, keyboard, limits, saved position. Knows nothing about exercises. |
| `lib/split.ts` | Pure logic for limits and key steps, so it can be unit tested. |
| `components/session/QuestionPanel.tsx` | Title, description, examples, hints, solution. |
| `components/session/ResultsPanel.tsx` | Output and Assembly tabs. |
| `components/session/WorkspaceBar.tsx` | The top bar and thin step bar. |
| `components/session/CodeStep.tsx` | Keeps the state and the run logic, and arranges the panels. |

`Stepper` keeps owning step state. It renders `WorkspaceBar` instead of `.session-head` and `.session-nav` on coding steps, and sets `data-workspace`.

Divider dragging uses a small component of our own rather than a library such as `react-resizable-panels`, because only two dividers are needed and the project keeps few dependencies.

## 6. Visual system

Uses the site's existing tokens in `globals.css`, in a new section scoped to the workspace.

- **Neutrals** for surfaces, text and borders.
- **One accent**, the existing indigo, for the primary button, focus rings, the active tab and the current step.
- **Green and red only for pass and fail** in results. They always come with a word or an icon, never color alone.
- **Removed on this screen:** the yellow "Coding exercise" chip, thick outlined pills, and the floating bottom nav bar.
- **Type:** body at least 16px, labels at least 14px, code 14–15px in the existing mono font.
- **Motion:** keep the existing step entrance, which already respects reduced motion. Nothing new moves.

The `frontend-design` skill guides the visual details during the build, inside these limits.

## 7. Accessibility

**Dividers.** Each is `role="separator"` with an `aria-label`, `aria-orientation` and `aria-valuenow/min/max`, and can take focus.

| Key | Effect |
| --- | --- |
| Arrow keys | Move by 2% |
| Shift + arrow keys | Move by 10% |
| Home / End | Go to the limits |
| Double-click | Back to the starting position |

**Shortcuts.** `Ctrl/Cmd+Enter` runs and `Ctrl/Cmd+Shift+Enter` submits, from anywhere in the workspace. In the editor they must take priority over `defaultKeymap`, which binds `Mod-Enter`. Both are shown in the buttons' tooltips and accessible names.

**Leaving the editor.** The editor uses `indentWithTab`, so Tab normally stays inside it, which can trap a keyboard user. `Esc` then `Tab` must move focus out of the editor. This is checked in the browser, and a key binding is added if CodeMirror does not already provide it. The session intro explains it.

**Other.**

- Results and tabs use `role="tablist"`, with arrow keys between tabs.
- Results stay in an `aria-live="polite"` region.
- Hints and Solution use `aria-expanded`.
- Moving from one step to another puts focus on the new question's title, since the old controls have gone from the screen. Opening the page does not move focus.
- Focus rings are always visible.
- Contrast is measured, not judged by eye (see Testing).

## 8. Testing

**Unit tests (vitest)**

- `lib/split.ts`: limits, key steps, and bad or missing saved values falling back to the start.
- Zip: `README.txt` includes the examples.

**Exporter tests (unittest)**

- `:::example` blocks are separated from the statement and passed through.

**Content check**

- `check:exercises` fails for an exercise with no examples, and passes for all 28.

**Browser checks, in the running site**

- At 1024×768 and 1440×900, the first screen matches success criterion 1.
- Drag each divider, reload, and confirm the position is kept.
- Run, Submit, solved state, Reset and its confirmation, hints, solution, Assembly with line highlighting, and skip then return.
- A full pass with the keyboard only, including `Esc` then `Tab`.
- Saved code survives moving between steps and reloading.
- A learn, check and lab step still show today's page, with the sidebar back.
- Light and dark, and phone width (375px).
- Contrast ratios computed from the rendered colors in both themes.
- No console errors.

**Final gate:** the CI steps pass locally, and the GitHub run for the final commit passes, per `github-tests-must-pass.mdc`.
