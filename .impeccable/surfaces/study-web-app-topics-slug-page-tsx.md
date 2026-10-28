---
version: 1
slug: "study-web-app-topics-slug-page-tsx"
primary_target: "study/web/app/topics/[slug]/page.tsx"
related_targets: ["study/web/app/layout.tsx","study/web/app/glossary/page.tsx","study/web/app/sessions/[id]/page.tsx"]
---

## Scope

The whole study site's visual world (redesign), first expressed on the lesson page. Visitor mode for lessons, glossary, and sessions: Read. The home page will later be designed as a landing page (Persuade) inside this same world.

## Audience and job

Students in the course, starting from zero, learning a lecture in order and coming back to review. They want it to feel modern and fun to learn from, not technical (user steer, 2026-10-28).

## Direction contract

THESIS: Every idea is a card you can hold, flip, and collect; a lecture is a deck you work through. Refuses the grey docs-site sidebar-plus-article and the dark hacker/terminal look.

OWN-WORLD: Soft periwinkle ground (#f1efff), deep indigo ink (#1b1740), electric blue (#4b3cf5) for "you are here"; card kinds by colour: mint definitions, coral checks, sunflower highlights. Thick rounded cards (about 22px radius) with a 2px ink outline, pill tabs, a fanned deck. Bricolage Grotesque for display, Figtree for reading, JetBrains Mono for code. Raise (Tabbed Binder Boards): each lecture owns one full-strength hue on its tab, deck, and cards. Raise (Iridescent Cloud Edge): colour never sits behind running text.

STORY: The reader sees where they are in the deck, reads a short calm column, meets a definition card and a check card right beside the text, flips or answers them, and watches the deck count go up.

FIRST VIEWPORT: Top bar: wordmark, pill tabs (Lecture 1, Lecture 2, Glossary), and a "cards collected" counter on the right. Left: a fanned three-card deck (done, done, current lesson number at 64px) above the lesson list with tick tiles. Centre: a white rounded sheet with a 60px title (no kicker; "Lesson 3 of 6" lives in the top-bar counter), the lead, and the reading column at about 62ch. Right: the mint definition card, tilted slightly, and the coral check card. The primary action is the check card, plus "Start session" for the lecture.

FORM: Flash-card deck, candidate 7 of my ordered list in the re-roll round. seed:a7c972e6bca446f4. Signature interaction: a check card flips to show the explanation once answered; every answer stays visible and the one you pick lifts forward (raise from Struck Cathode). Wrong answers are marked by shape as well as colour (raise from Darkroom Exposure Record). Motion: card lift and flip only, under 300ms, and off under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Hue for each later lecture (Lecture 1 is electric blue).
- Whether the session pages use the same deck metaphor for steps.
- Dark mode palette.
