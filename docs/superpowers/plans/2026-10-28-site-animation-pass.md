# Site Animation Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the cards that display badly and the animations that misbehave across the whole study site. Then add a small number of animations that give feedback or keep content from jumping.

**Architecture:** CSS in `study/web/app/globals.css` and `app/landing.css`, plus small edits to `components/session/Stepper.tsx`, `components/session/CodeStep.tsx`, `components/ReadingProgress.tsx` and `app/page.tsx`. Each task adds assertions to a new browser script, `study/web/scripts/check-motion.mjs`, before the fix. The existing `check-landing.mjs` must keep passing.

**Tech Stack:** Next.js 15 static export, plain CSS tokens, Playwright 1.64.

**Spec:** the animation review in this conversation (phases 1 and 2).

## Global Constraints

- One curve everywhere: the existing `--ease` (`cubic-bezier(0.22, 1, 0.36, 1)`). No new curves.
- Animate `transform` and `opacity` only. No `width`, `height` or `top`.
- Durations: press 100ms, hover 150–200ms, content entering 200ms. The only longer moment is the hero deal-in, at most 600ms in total.
- Hover movement is gated with `@media (hover: hover) and (pointer: fine)`.
- Reduced motion: no movement. Fades of 150ms or less may stay.
- Check at 1440 and 390 with no console errors.
- Commit after each task.

## Review Focus

1. A lesson with many definitions in one section (`source-to-process`): no side card may sit next to a different section's heading.
2. Pressing Next quickly several times: each step appears, and no stale step stays half faded.
3. Reduced motion: the step change, run output and hero fan all appear at once, without movement.
4. Running the same code twice with the same output: the student can still tell a new result arrived.
5. Phones with no hover: no lesson-hop card or step segment stays lifted or grown after a tap.

---

## Group 1: Broken (root causes found)

### Task 1: Side cards drift away from their text on wide screens

**Root cause:**
- At 1400px and wider, definition and check cards float into a side column (`globals.css:604-611`), and each one has `clear: right`.
- When a section has more cards than its text is tall, the cards stack down the column and spill into the next section.
- Measured gaps at 1440px between a card and the paragraph it belongs to: 1028, 496, 544, 310 and 303px on `source-to-process`, 429 and 311px on `memory-and-pointers`, and 231px on `c-data-types`.
- In practice, the `.rodata` and "Automatic storage" definitions sit beside "The running program: a process".

- [ ] Write `check-motion.mjs`, group `side-cards`. At 1440px, on all six lessons, no floated card's top edge may be below the next `h2` after it in the source.
- [ ] Run it. Expected: FAIL on 3 lessons.
- [ ] Fix with `.page.lesson h2 { clear: both; }` inside the 1400px block. Each section then starts below the previous section's cards.
- [ ] Run it. Expected: PASS. Then screenshot `source-to-process` at 1440px and check the white space left above each heading. If the gap above any `h2` is more than 400px, stop and report it rather than tuning.
- [ ] Commit.

### Task 2: Progress bars animate `width`, and the menu icon animates `top`

**Root cause:**
- `.chapter-bar > span { transition: width 0.6s }` (`globals.css:594`) animates a layout property, so the browser re-lays out the page on every frame.
- `.rail-toggle-icon` animates `top` (`globals.css:817`).

- [ ] Add a group `layout-props`: no element's computed `transition-property` may include `width`, `height`, `top`, `left`, `right` or `bottom`.
- [ ] Run it. Expected: FAIL.
- [ ] Change the bar fill to `transform: scaleX(var(--fill))` with `transform-origin: left` (`right` under `[dir="rtl"]`), at 400ms. Set `--fill` in `ChapterProgress.tsx`.
- [ ] Move the icon bars with `translateY(±5px)` instead of `top`.
- [ ] Run it. Expected: PASS.
- [ ] Commit.

### Task 3: Hover effects stick after a tap on phones

**Root cause:** `.chapter-hop:hover` (`globals.css:584`, the next/previous lesson cards) and `.session-seg:hover::before` (`globals.css:686`, the step segments) are not limited to mouse users, so on a phone a tap leaves the card lifted or the segment grown.

- [ ] Add a group `touch-hover`: at 390px with touch, hover over `.chapter-hop` and `.session-seg`. The computed `transform` of `.chapter-hop` and of the segment's bar must stay unchanged.
- [ ] Run it. Expected: FAIL.
- [ ] Move both hover rules inside `@media (hover: hover) and (pointer: fine)`.
- [ ] Run it. Expected: PASS.
- [ ] Commit.

### Task 4: The reading progress bar re-renders React on every scroll event

**Root cause:** `ReadingProgress.tsx:11-15` calls `setState` from a scroll listener with no `requestAnimationFrame` throttle. Every scroll event re-renders the component.

- [ ] Add a group `progress-bar`: scroll a lesson to the middle, wait one frame, and the bar's `scaleX` must be within 0.02 of the scroll ratio.
- [ ] Run it (this guards the behaviour; it may already pass).
- [ ] Write the transform straight to a ref inside one `requestAnimationFrame` per frame, and remove the state.
- [ ] Run it. Expected: PASS.
- [ ] Commit.

## Group 2: High-impact animations (passed the frequency and purpose checks)

### Task 5: Landing page via `/animate`: deal the hero cards in once

The one authored moment of the site. Cards are the brand, and the home page is seen occasionally.

- On first paint, the fan cards rise from `translateY(24px)` with `opacity: 0` to their resting rotation.
- Each card takes 400ms on `--ease`, staggered 40ms in order, so the whole deal takes 600ms.
- Use `@starting-style` on `.fan a`, so no script is needed. The cards are clickable from the first frame.
- Reduced motion: no deal-in.
- Rejected for the landing page: per-section scroll reveals. Every section would get the same entrance, which adds noise.

- [ ] Group `hero-deal`: at load, the last card's computed opacity is below 1 at 100ms and equal to 1 at 900ms. With `reducedMotion: "reduce"` it is 1 at 0ms.
- [ ] Run `/animate` on `.fan` with this recipe, then run the group. Expected: PASS. `check-landing.mjs` must still pass.
- [ ] Commit.

### Task 6: A session step appears instantly when you press Next or Back

**Where:** `Stepper.tsx:106-109`. The step is keyed by its id, so it remounts, but it does so with no transition. Next also calls `scrollIntoView`, which smooth-scrolls because `html` has `scroll-behavior: smooth`, so each step waits on a slow scroll.

**Purpose:** spatial consistency (you move forward or back) and avoiding a jarring jump.

**Frequency:** tens of times per session, so keep it subtle.

**Recipe:**
- `.session-step-in { animation: step-in 200ms var(--ease) both; }`
- `@keyframes step-in { from { opacity: 0; transform: translateX(calc(var(--dir) * 12px)); } }`
- `--dir` is 1 for Next and -1 for Back, set on the wrapper.
- Scroll with `behavior: "instant"`.
- Reduced motion: a 150ms opacity fade only.

- [ ] Group `step-change`:
  - After Next, the new step's animation name is `step-in` and `--dir` is 1.
  - After Back, `--dir` is -1.
  - Three quick Nexts end with one step and opacity 1.
- [ ] Run it. Expected: FAIL.
- [ ] Implement.
- [ ] Run it. Expected: PASS.
- [ ] Commit.

### Task 7: Run and Test results swap with no sign that a new run happened

**Where:** `CodeStep.tsx:250-262`. Running the same code twice gives identical output, so nothing visible changes.

**Purpose:** feedback.

**Recipe:**
- Key the results wrapper by a run counter.
- `animation: fade-in 200ms var(--ease) both`, reusing the existing keyframe (opacity plus 4px).

**Also:** in `CheckCard.tsx:315-316`, the "Yes / That is not it" line pops in while the explanation below it fades in. Give the result line the same fade so the two arrive together.

- [ ] Group `feedback`:
  - On the session's first exercise, press Run twice. The output wrapper's animation restarts, meaning the element is new.
  - Answer a check: `.check-result` has animation `fade-in`.
  - This needs a live network call to godbolt.org. If it is offline, the group reports itself as skipped, not passed.
- [ ] Run it. Expected: FAIL.
- [ ] Implement.
- [ ] Run it. Expected: PASS.
- [ ] Commit.

## Group 3: Nice-to-have

- **Task 8:** a practice card opening from its fold row (`Practice.tsx:81→92`) snaps open. Fade the body in with `fade-in` at 200ms.
- **Task 9:** "Session finished" (`Stepper.tsx:111`) is the one completion moment. It rises from `scale(0.97)` with `opacity: 0` over 300ms. This is the only place a slightly longer beat is allowed.

## Rejected (and why)

- **Search results dropdown** (`SearchBox.tsx:47`): opened by typing, so it should not animate.
- **Rail lecture accordion** (`Rail.tsx:162`): navigation used many times a session. A height animation would animate layout, and the chevron already shows the state.
- **Answer choice hover** (`CheckCard.tsx:286`): tens of times per check, and the background change is enough.
- **Glossary jump links and scroll reveals on lesson text:** content the student is reading should not move for style.
- **Scroll reveals for every landing section:** the same entrance on every section is noise. The hero deal-in is the one authored moment.

## Reduced motion (audited)

- **Already correct:**
  - The global rule in `globals.css` (keeps colour and fades, drops movement).
  - The landing block.
  - `Reveal.tsx` (keeps the words lit).
  - `scroll-behavior` switches to `auto`.
- **Gaps that the tasks above close:**
  - The new deal-in, step-change and result animations each need their reduce variant (Tasks 5–7).
  - The chapter bar fill needs one too (Task 2).

## Final step

Follow verification-before-completion:
- Re-screenshot every touched page at 1440 and 390.
- Run `check-motion` and `check-landing`.
- Confirm there are no console errors.
- Show before and after for the cards: the side cards on `source-to-process` at 1440px, and the hero fan deal-in as frames at 0, 150, 300 and 600ms.
