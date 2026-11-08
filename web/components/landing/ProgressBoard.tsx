"use client";

import { Fragment, useEffect, useState } from "react";
import { readProgress } from "@/lib/progress";

type Lecture = { id: string; number: number; title: string; lessons: { id: string; practiceIds: string[] }[] };

// A small program that adds up four numbers by walking a pointer along them. It is real C and prints 9.
const PROGRAM = [
  "#include <stdio.h>",
  "",
  "int main(void) {",
  "  int data[4] = {3, 1, 4, 1};",
  "  int *p = data;",
  "  int sum = 0;",
  "  for (int i = 0; i < 4; i++) {",
  "    sum += *p;",
  "    p++;",
  "  }",
  '  printf("%d\\n", sum);',
  "  return 0;",
  "}",
];

type Token = { text: string; kind: string };
const PATTERN = /(#include|\bint\b|\bvoid\b|\bfor\b|\breturn\b)|(<stdio\.h>|"[^"]*")|(\b\d+\b)|(\bmain\b|\bprintf\b)|(\w+|\s+|.)/g;
const KINDS = ["key", "str", "num", "fn", "plain"];

function tokenize(line: string): Token[] {
  const out: Token[] = [];
  for (const match of line.matchAll(PATTERN)) {
    const index = match.slice(1).findIndex((group) => group !== undefined);
    out.push({ text: match[0], kind: KINDS[index] });
  }
  return out;
}

const LINES = PROGRAM.map(tokenize);
const TOTAL_CHARS = PROGRAM.reduce((sum, line) => sum + line.length + 1, 0);

// The hero picture: your progress is a real C program that writes itself. The share of practice steps you have solved
// is the share of the program that has been typed. The rest waits in dim ghost text, so you can see what is still to
// come. Until the last line is typed, the console says the program does not compile. Finish every step and it runs.
export function ProgressBoard({ courseId, lectures }: { courseId: string; lectures: Lecture[] }) {
  const [solved, setSolved] = useState<string[]>([]);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const sync = () => setSolved(readProgress(courseId).solved);
    sync();
    window.addEventListener("study-progress", sync);
    return () => window.removeEventListener("study-progress", sync);
  }, [courseId]);

  const ids = lectures.flatMap((lecture) => lecture.lessons.flatMap((lesson) => lesson.practiceIds));
  const total = ids.length;
  const done = ids.filter((id) => solved.includes(id)).length;
  const target = total ? Math.round((done / total) * TOTAL_CHARS) : 0;

  // Type toward the target at a steady pace, so the code writes itself instead of jumping.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(target);
      return;
    }
    let frame = 0;
    let last = performance.now();
    let position = 0;
    setTyped((current) => { position = current; return current; });
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      position += Math.sign(target - position) * Math.min(Math.abs(target - position), (dt / 1000) * 55);
      const whole = Math.round(position);
      setTyped((current) => (current === whole ? current : whole));
      if (Math.abs(target - position) > 0.01) frame = requestAnimationFrame(step);
    };
    const start = window.setTimeout(() => { last = performance.now(); frame = requestAnimationFrame(step); }, 600);
    return () => { clearTimeout(start); cancelAnimationFrame(frame); };
  }, [target]);

  const finished = total > 0 && typed >= TOTAL_CHARS;
  let budget = typed;
  let caretDrawn = false;

  return (
    <figure className="pboard">
      <div className="pboard-code" role="img" aria-label={`A small C program that is ${Math.round((typed / TOTAL_CHARS) * 100)} percent written. It grows as you solve practice steps.`}>
        <div className="pboard-bar" aria-hidden="true">
          <i /><i /><i />
          <span>sum.c</span>
        </div>
        <pre aria-hidden="true">
          {LINES.map((tokens, row) => {
            const caret = <span className="pboard-caret" />;
            const node = (
              <div className="pboard-line" key={row}>
                <span className="pboard-no">{row + 1}</span>
                <span>
                  {tokens.length === 0 && budget === 0 && !caretDrawn && ((caretDrawn = true), caret)}
                  {tokens.map((token, index) => {
                    const shown = Math.max(0, Math.min(token.text.length, budget));
                    budget -= token.text.length;
                    const here = shown < token.text.length && !caretDrawn;
                    if (here) caretDrawn = true;
                    return (
                      <Fragment key={index}>
                        {shown > 0 && <span className={`tk-${token.kind}`}>{token.text.slice(0, shown)}</span>}
                        {here && caret}
                        {shown < token.text.length && <span className="pboard-ghost">{token.text.slice(shown)}</span>}
                      </Fragment>
                    );
                  })}
                  {finished && row === LINES.length - 1 && caret}
                </span>
              </div>
            );
            budget -= 1; // the line break
            return node;
          })}
        </pre>
        <div className="pboard-console" aria-hidden="true">
          <p><b>$</b> gcc sum.c &amp;&amp; ./a.out</p>
          {finished ? (
            <p className="is-ok"><span>9</span> <em>exit code 0</em></p>
          ) : (
            <p className="is-error">{"error: expected '}' at end of input"}</p>
          )}
        </div>
      </div>
      <figcaption>
        <span className="pboard-lead">Your progress is a program that writes itself.</span>
        <span aria-live="polite">
          {done === 0
            ? "It starts empty. Solve a question or an exercise and the next lines of C appear."
            : finished
              ? `All ${total} steps solved. The program compiles and prints 9.`
              : `${done} of ${total} steps solved. The program will not compile until you finish them all.`}
        </span>
      </figcaption>
    </figure>
  );
}
