"use client";

import { useEffect, useRef, useState } from "react";
import { Mixed } from "@/lib/bidi";
import { readLabPage, writeLabPage } from "@/lib/session-store";
import type { SessionStep } from "@/lib/types";
import type { RenderedLabPage } from "./rendered";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function LabStep({ step, pages, courseId, done, onComplete }: { step: Extract<SessionStep, { kind: "lab" }>; pages: RenderedLabPage[]; courseId: string; done: boolean; onComplete: () => void }) {
  const [finished, setFinished] = useState(done);
  // The stepper shows a step only in the browser, so storage can be read on the first render.
  const [shown, setShown] = useState(() => Math.min(readLabPage(courseId, step.id), pages.length - 1));
  const frame = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const zip = step.lab.zip.startsWith("/") ? step.lab.zip : `/${step.lab.zip}`;
  const page = pages[shown];
  const last = shown === pages.length - 1;
  const next = pages[shown + 1];

  useEffect(() => {
    if (!moved.current) return;
    frame.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [shown]);

  const open = (index: number) => {
    moved.current = true;
    setShown(index);
    writeLabPage(courseId, step.id, index);
  };

  return (
    <div className="session-step reading-step lab-step" ref={frame}>
      <h2><Mixed text={step.lab.title} /></h2>
      <aside className="lab-side">
        <nav aria-label="Pages of this lab">
          <ol className="lab-nav">
            {pages.map((item, index) => (
              <li key={index} className={item.part !== pages[index - 1]?.part ? "starts-part" : undefined} data-part={item.part ?? undefined}>
                <button type="button" className="lab-nav-item" aria-current={index === shown ? "page" : undefined} onClick={() => open(index)}>
                  <span className="lab-nav-number" aria-hidden="true">{index + 1}</span>
                  <span className="lab-nav-title">{item.part && <span className="sr-only">{item.part}: </span>}<Mixed text={item.title} /></span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <a className="session-download" href={`${basePath}${zip}`} download>Download the lab files (.zip)</a>
      </aside>
      <section className="lab-page">
        <p className="lab-page-where">{page.part ? `${page.part} · ` : ""}Page {shown + 1} of {pages.length}</p>
        <h3 ref={heading} tabIndex={-1}><Mixed text={page.title} /></h3>
        {page.content}
        {last && (
          <label className="session-confirm">
            <input
              type="checkbox"
              checked={finished}
              disabled={done}
              onChange={(event) => {
                setFinished(event.target.checked);
                if (event.target.checked) onComplete();
              }}
            />
            I finished this lab in VS Code
          </label>
        )}
        <div className="lab-page-nav">
          <button type="button" className="btn-quiet" disabled={shown === 0} onClick={() => open(shown - 1)}>Previous page</button>
          {next && <button type="button" className="btn-primary" onClick={() => open(shown + 1)}>Next: <Mixed text={next.title} /></button>}
        </div>
      </section>
    </div>
  );
}
