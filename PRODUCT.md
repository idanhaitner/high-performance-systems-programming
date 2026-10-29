# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

University students taking High-Performance Systems Programming, starting with the site's author and shared with classmates in the same course. They start from zero: no prior C, no idea what a bit pattern, a cache, or a process is. They use the site to learn a lecture for the first time, practise before exercises and exams, and come back to check a definition.

## Product Purpose

A study site that replaces both the lectures and the practice sessions (tirgulim) of the course. Each lecture becomes a set of lessons written for beginners, plus a guided session that walks the student through it step by step: read a little, answer a check, write and run real C on the page, and do a lab in VS Code only when the topic needs a real machine (threads, timing, GPUs). Success means a student can sit down with no background, work through a lecture in order, and leave able to write and reason about the code.

## Positioning

Unlike lecture slides or a generic C tutorial, every page follows this course's lectures in order. It is written for someone who has never seen the material, and it lets the student compile and run C (and see the assembly) without leaving the page.

## Operating Context

- Students study on laptops, often at night and in long sittings, and sometimes on phones to review.
- The in-page editor runs code through Compiler Explorer (godbolt.org). Labs that need a real machine are done in VS Code.
- Content lives in `study/content/` (`course.yml`, `topics/`, `exercises/`) and follows `.cursor/rules/beginner-first-writing.mdc`.
- Course lectures arrive over the semester. Lectures 1 (data, memory, and running programs) and 2 (memory management) are written; later lectures (caches, the processor, many-core machines, GPUs) are still to come.

## Capabilities and Constraints

- Static Next.js export on GitHub Pages. No backend, no accounts, no sync between devices.
- Progress is stored in the browser (`localStorage`).
- Surfaces: the course home page, lecture/topic lesson pages, guided session pages (learn, check, code, lab steps), a glossary, and search.
- Lessons include code blocks (Shiki), maths (KaTeX), definitions, checks, and problems.
- The course content is English, left to right. The font setup already loads Hebrew, so a Hebrew course may follow; that is undecided.
- Practice sets under `c/practice/` stay unsolved; only the lesson exercises have reference solutions.

## Evidence on Hand

- Real course content: Lectures 1 and 2 (six lessons each), their glossary terms, their exercises and labs, and the changelog in `study/content/`.
- Source lecture PDFs listed under `sources` in `course.yml`.
- No testimonials, usage numbers, or endorsements exist. Do not invent any.

## Product Principles

1. A beginner can learn every page in order, without looking anything up.
2. Doing beats reading: every idea leads quickly to a check or to code the student runs.
3. Follow the course, not a generic curriculum: the lecture order and terms are the backbone.
4. Never lose the student's work or progress.
5. Work offline from the browser, without accounts or a server.
