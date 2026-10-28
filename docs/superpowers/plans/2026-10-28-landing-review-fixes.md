# Landing Page Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken cards and card animations on the home page, then apply the highest-value design and motion polish found in the review.

**Architecture:** All changes are CSS in `study/web/app/landing.css` and `study/web/app/globals.css`, plus small edits to `study/web/app/page.tsx` and `study/web/components/landing/*`. Each task is verified by one Playwright script, `study/web/scripts/check-landing.mjs`, run against the dev server. The script grows one assertion group per task, written first so that it fails before the fix.

**Tech Stack:** Next.js 15 static export, plain CSS with tokens in `globals.css`, Playwright 1.64 (already a dev dependency).

**Spec:** the review report in this conversation (the root causes in Phase 1, the critique and audit in Phase 2, and the animation table in Phase 3).

## Global Constraints

- Widths verified on every task: 1440, 1024, 768, 390.
- Animate only `transform` and `opacity` for movement. Colour and background may transition.
- Hover feedback runs at 150–200ms, press at 100–160ms, and entering or exiting elements at 200–300ms. Keep the existing `--ease` (`cubic-bezier(0.22, 1, 0.36, 1)`).
- Gate hover movement with `@media (hover: hover) and (pointer: fine)`.
- Reduced motion removes movement and keeps colour and opacity changes.
- Do not invent testimonials, numbers or claims (PRODUCT.md, "Evidence on Hand").
- Copy follows `.cursor/rules/beginner-first-writing.mdc`: explain a word before using it.
- Commit after each task. Do not push until the user says so.

## Review Focus

1. Keyboard user tabs through the hero fan: each focused card must come to the front with its title readable.
2. Dark mode (`prefers-color-scheme: dark`): no fan card may show the card behind it through its background.
3. Phone width 390 with no hover: no card stays lifted after a tap, and every link in the nav and footer is at least 44px tall.
4. JavaScript fails or has not run yet: the tagline must be readable rather than stuck at 30% ink.
5. Reduced motion: cards do not move, and the tagline words end fully lit.

---

## Group 1: Broken (do first)

### Task 1: Restore the padding on the how-it-works and benefit cards

**Root cause:** `landing.css:17` `.page.landing :is(ul, ol) li { padding-inline-start: 0; }` has specificity (0,2,2). It beats `.how-card { padding: 24px }` (0,1,0) and `.benefits li` (0,1,1), so the computed left padding is 0. `globals.css` never pads `li`, so the rule does nothing useful.

**Files:** create `study/web/scripts/check-landing.mjs`; modify `study/web/app/landing.css:17` and `study/web/package.json` (`"check:landing": "node scripts/check-landing.mjs"`).

- [ ] Write `check-landing.mjs`. It loads `http://localhost:8732/` at each width and exits 1 on failure. First assertion group, `cards-padded`: every `.how-card` and `.benefits li` has computed `padding-left` equal to `padding-right`, both 24px. Also log console errors and fail on any of them.
- [ ] Run `npm --prefix study/web run check:landing`. Expected: FAIL, `cards-padded` reports `0px`.
- [ ] Delete line 17.
- [ ] Run again. Expected: PASS.
- [ ] Commit.

### Task 2: The hero fan picks the wrong card and hides the focused one

**Root cause:**
- Hovering anywhere on `.fan` widens the spread from 9° to 13° (`landing.css:124`), which moves every card. The card under a still pointer changes, so the hover jumps and flickers. The probe showed the pointer starting over card 2 and ending over card 0.
- Each lifted card stays below the cards that come after it in source order, because nothing raises its z-index. Keyboard focus on cards 1–5 is covered (the probe reported "focus card 2 → covered").
- The move takes 500ms, and hover is not gated, so on touch the card stays lifted after a tap.

**Files:** modify `study/web/app/landing.css` (fan block, lines 111–143 and the reduced-motion block).

- [ ] Add a `fan-front` assertion group:
  - For each fan link, focus it and wait 300ms. `elementFromPoint` at the centre of its `.fan-title` must land inside that same `li`.
  - Hover card 2 and sample `elementFromPoint` at a fixed point 10 times over 700ms. Every sample must be the same `li`.
- [ ] Run. Expected: FAIL.
- [ ] Delete `.fan:hover li { … }` and its reduced-motion twin.
- [ ] Raise the active card: `.fan li:has(> a:is(:hover, :focus-visible)) { z-index: 1; }`.
- [ ] Lift it 16px instead of 24px. Put the lift on `.fan a` inside `@media (hover: hover) and (pointer: fine)` for hover, and keep `:focus-visible` ungated. Transition `transform 200ms var(--ease)` and remove the `li` transition.
- [ ] Run. Expected: PASS.
- [ ] Commit.

### Task 3: Fan card 5 is see-through in dark mode

**Root cause:** `.fan li:nth-child(6n + 5) a` uses `--accent-soft`, which is `rgb(143 134 255 / 0.18)` in dark mode, so card 4 shows through it.

**Files:** modify `study/web/app/landing.css` (fan colours).

- [ ] Add a `fan-opaque` assertion group: in a dark-scheme context (`colorScheme: "dark"`), every `.fan a` has a computed background alpha of 1.
- [ ] Run. Expected: FAIL on card 5.
- [ ] Use `background: color-mix(in oklch, var(--accent-soft), var(--card-solid))`, or a solid equivalent that reads the same in light mode.
- [ ] Run. Expected: PASS.
- [ ] Commit.

### Task 4: The tagline stays at 30% ink when JavaScript has not run

**Root cause:** `.tagline-word` starts dim in CSS (1.9:1 contrast). Only `Reveal.tsx` lights the words, so with no JavaScript, before hydration, or for a static reader, the words stay dim.

**Files:** modify `study/web/app/landing.css` (tagline block) and `study/web/components/landing/Reveal.tsx`.

- [ ] Add a `tagline-readable` assertion group:
  - With JavaScript disabled, every `.tagline-word` has full ink colour.
  - With `reducedMotion: "reduce"`, every word is lit.
- [ ] Run. Expected: FAIL.
- [ ] Make words dim only under `.tagline.is-armed .tagline-word:not(.is-lit)`. In `Reveal`, add `is-armed` to `.tagline` only when `matchMedia("(prefers-reduced-motion: no-preference)")` matches.
- [ ] Run. Expected: PASS.
- [ ] Commit.

## Group 2: High-impact polish

### Task 5: Motion timing pass (from the animation review)

**Files:** modify `study/web/app/landing.css` and `study/web/app/globals.css`.

| Element | Now | Change to |
|---|---|---|
| `.landing-cta`, `.deck-session` hover | `transform` + `box-shadow` at 300ms | 160ms. Hover movement gated to fine pointers. `:active` returns in 100ms. |
| `.deck-grid a` hover lift | 300ms, ungated | 200ms, gated to fine pointers |
| `.landing-links a` background | 300ms | 150ms |
| `.landing-toggle` icon morph | 500ms | 250ms |
| `.faq summary::after` rotate | 300ms | 200ms |
| `.check-why` (lesson cards) | `flip-in` rotating 70° in 3D, shown on every answer | the existing `fade-in` (opacity plus 4px), 200ms |
| Global `button:hover` lift (`globals.css:164`) | ungated, so it sticks after a tap on phones | gated to fine pointers |
| Reduced motion (`globals.css`) | `transition: none !important` on everything | `transition-property: color, background-color, border-color, opacity !important`, with animations still off |

- [ ] Add a `motion` assertion group:
  - No `transition-duration` above 0.3s on `.landing-cta`, `.deck-grid a`, `.fan a` or `.landing-links a`.
  - At 390 with `hasTouch`, tapping `.deck-grid a` then going back leaves no `transform`.
- [ ] Run. Expected: FAIL.
- [ ] Apply the table.
- [ ] Run. Expected: PASS. Also check the tagline still lights up with reduced motion on.
- [ ] Commit.

### Task 6: Touch targets and the nav breakpoint

**Files:** modify `study/web/app/landing.css`.

- [ ] Add a `targets` assertion group: at 390, every `a` and `button` inside `.landing-nav` and `.landing-foot` measures at least 44×44.
- [ ] Run. Expected: FAIL (footer links are 20px tall, the toggle is 40px).
- [ ] Make footer links `display: inline-flex; align-items: center; min-height: 44px`. Make `.landing-toggle` 44px.
- [ ] Move the "hide `.landing-links`" rule from `max-width: 1024px` to `max-width: 860px`. At 1024 the bar has room for the links.
- [ ] Run. Expected: PASS. Check the 1024 screenshot shows all four links on one line.
- [ ] Commit.

### Task 7: Hierarchy and rhythm

**Files:** modify `study/web/app/landing.css`.

- Hero `h1`: 3.75rem / 1 at widths of 1280 and up. It is 3rem now, the same size as the tagline, so the hero does not lead.
- Tagline `p`: 2.25rem (36px) on desktop and 1.875rem below 800px.
- `.tagline` padding: 64px instead of 96px. It currently stacks about 270px of empty space after the hero.
- `.benefits li`: add `border: 2px solid var(--edge)`, because the tile is only 1.13:1 against the page. Optionally rotate it like the other cards.
- `.fan` under 800px: `height: 13rem`. Set `.fan-title` to `hyphens: none` and give `.fan a` 12px of padding so "Command-line" stays on one line.

- [ ] Add a `hierarchy` assertion group:
  - At 1440, the `h1` font size is larger than the tagline font size.
  - Benefit tiles have a 2px border.
  - At 390, `.fan-title` of the top card spans at most 2 lines.
- [ ] Run. Expected: FAIL.
- [ ] Apply the changes.
- [ ] Run. Expected: PASS.
- [ ] Commit.

### Task 8: Beginner-first fixes in the copy and progress

**Files:** modify `study/web/app/page.tsx` (STEPS, BENEFITS) and `study/web/components/ChapterProgress.tsx`.

- How-card 3: "look at the assembly the compiler made" becomes "look at the assembly, the machine's own instructions, that the compiler made".
- Benefit "Code without setup": add what Compiler Explorer is ("a free website that compiles C").
- `ChapterProgress`: render nothing while solved is 0. On a first visit, seven empty "0 / N solved" bars read like a test the student is already failing.

- [ ] Add a `progress` assertion group: with empty `localStorage`, there are no `.deck-grid` progress elements. After writing one solved id into the progress key (see `lib/progress.ts`), the matching bar appears.
- [ ] Run. Expected: FAIL.
- [ ] Apply the changes.
- [ ] Run. Expected: PASS.
- [ ] Commit.

## Group 3: Nice-to-have

These are optional, and each one stands on its own.

- **Task 9.** Dark-mode variants of `--mint`, `--coral` and `--sun`, about 15% darker. Today the full-strength colours glare on `#131127` during night study.
- **Task 10.** The mobile menu closes when the empty part of the overlay is tapped. Lock scrolling on `html` as well as `body`, because iOS ignores `body { overflow: hidden }`.
- **Task 11.** When a FAQ answer opens, fade it in (`fade-in`, 200ms), so the opening reads as a change rather than a jump.
- **Task 12.** Tagline words stay lit once lit, and do not un-light on scroll up. Each word is revealed once.
- **Task 13.** Move the offset shadows on `.deck-grid a` and `.landing-cta` hover to a `::after` layer that moves with `transform`. That removes the `box-shadow` paint on every hover.

## Needs your decision (not scheduled)

- **D1. Show the product.** Replace the benefits grid, or one how-card, with a static mock of a real check card and a code card with output and assembly, taken from Lecture 1. Both reviews rate this the biggest gain in how specific and convincing the page feels. It is a new section, about half a day of work.
- **D2. One first step.** The hero says "Start lecture 1" (the lesson), while the guided session is a quiet pill further down. Choose one: point the hero CTA at the guided session, or keep the lesson and add a single line such as "New here? Follow the guided session."

## Final step

Run `/impeccable polish` on the landing page. Then follow verification-before-completion:
- Re-screenshot every section at 1440, 1024, 768 and 390.
- Run `check:landing` with no failures.
- Confirm there are no console errors.
- Show before and after crops of the how-it-works cards, the benefit tiles and the hero fan (hovered, keyboard-focused, and in dark mode).
