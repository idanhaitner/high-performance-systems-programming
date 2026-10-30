"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mixed } from "@/lib/bidi";
import { readSession, resumeStep, writeSession, type SessionState } from "@/lib/session-store";
import type { Session, SessionStep } from "@/lib/types";
import { CheckStep } from "./CheckStep";
import { ExerciseStep } from "./ExerciseStep";
import { LabStep } from "./LabStep";
import { LearnStep } from "./LearnStep";
import type { RenderedStep } from "./rendered";

type StepProps = { step: SessionStep; courseId: string; done: boolean; onComplete: () => void; harness: string; rendered: RenderedStep };

function StepView({ step, courseId, done, onComplete, harness, rendered }: StepProps) {
  switch (step.kind) {
    case "learn":
      return <LearnStep step={step} content={rendered.content} onComplete={onComplete} />;
    case "check":
      return <CheckStep step={step} content={rendered.content} onComplete={onComplete} />;
    case "lab":
      return <LabStep step={step} content={rendered.content} done={done} onComplete={onComplete} />;
    case "exercise":
      return <ExerciseStep step={step} courseId={courseId} done={done} onComplete={onComplete} harness={harness} rendered={rendered} />;
  }
}

const KIND: Record<SessionStep["kind"], string> = { learn: "Recap", check: "Quick question", exercise: "Coding exercise", lab: "Lab" };

// A recap copies a lesson section ("learn:topic#section"); any other reading is the practice's own.
const kindLabel = (step: SessionStep) => (step.kind === "learn" && !step.id.includes("#") ? "Start here" : KIND[step.kind]);

const label = (step: SessionStep) => (step.kind === "learn" ? step.title : step.kind === "lab" ? step.lab.title : step.kind === "exercise" ? step.exercise.title : "Quick check");

export function Stepper({
  session,
  courseId,
  harness,
  rendered,
  lectureNumber,
}: {
  session: Session;
  courseId: string;
  harness: string;
  rendered: Record<string, RenderedStep>;
  lectureNumber: number | null;
}) {
  const total = session.steps.length;
  // A string, so a re-render with the same steps does not send the student back to the resume point.
  const stepIds = session.steps.map((step) => step.id).join("\n");
  const [state, setState] = useState<SessionState>({ step: 0, done: [], skipped: [] });
  const [ready, setReady] = useState(false);
  // Which way the student last moved: 1 forward, -1 back, 0 before any move (no entrance on page load).
  const [dir, setDir] = useState(0);

  useEffect(() => {
    const stored = readSession(courseId, session.id);
    setState({ ...stored, step: resumeStep(stepIds.split("\n"), stored) });
    setReady(true);
  }, [courseId, session.id, stepIds]);

  useEffect(() => {
    if (ready) writeSession(courseId, session.id, state);
  }, [ready, courseId, session.id, state]);

  const top = useRef<HTMLDivElement>(null);
  const shown = useRef<number | null>(null);

  // Moving to another step starts it from the top, so a long step never opens halfway down.
  useEffect(() => {
    if (!ready) return;
    if (shown.current !== null && shown.current !== state.step) {
      const box = top.current?.getBoundingClientRect();
      if (box && box.top < 0) top.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
    shown.current = state.step;
  }, [ready, state.step]);

  const finished = state.step >= total;
  const current = finished ? null : session.steps[state.step];
  const currentId = current?.id;
  const lesson = currentId ? rendered[currentId]?.lesson : undefined;

  const complete = useCallback(() => {
    if (!currentId) return;
    setState((s) => (s.done.includes(currentId) ? s : { ...s, done: [...s.done, currentId], skipped: s.skipped.filter((id) => id !== currentId) }));
  }, [currentId]);

  const go = (step: number) => {
    setDir(Math.sign(step - state.step));
    setState((s) => ({ ...s, step: Math.min(Math.max(step, 0), total) }));
  };
  const skip = () => {
    if (!current) return;
    setDir(1);
    setState((s) => ({
      ...s,
      step: Math.min(s.step + 1, total),
      skipped: s.skipped.includes(current.id) || s.done.includes(current.id) ? s.skipped : [...s.skipped, current.id],
    }));
  };

  const doneCount = session.steps.filter((step) => state.done.includes(step.id)).length;
  const skippedCount = session.steps.filter((step) => state.skipped.includes(step.id) && !state.done.includes(step.id)).length;

  return (
    <div className="session" ref={top}>
      <ol className="session-bar" aria-label="Session progress">
        {session.steps.map((step, index) => {
          const status = state.done.includes(step.id) ? "done" : state.skipped.includes(step.id) ? "skipped" : index === state.step ? "current" : "upcoming";
          return (
            <li key={step.id}>
              <button
                type="button"
                className="session-seg"
                data-status={status}
                aria-current={index === state.step ? "step" : undefined}
                aria-label={`Step ${index + 1} of ${total}: ${label(step)} (${status})`}
                onClick={() => go(index)}
              />
            </li>
          );
        })}
      </ol>
      <div className="session-head">
        {current && <span className="step-kind" data-kind={current.kind}>{kindLabel(current)}</span>}
        <p className="session-count">{finished ? "All steps seen" : `Step ${state.step + 1} of ${total}`}</p>
        {lesson && (
          <Link className="session-lesson" href={`/topics/${lesson.id}`}>
            Reread: <Mixed text={lesson.title} />
          </Link>
        )}
      </div>

      {!ready ? null : current ? (
        <div key={current.id} className={dir ? "step-in" : undefined} style={dir ? ({ "--dir": dir } as React.CSSProperties) : undefined}>
          <StepView step={current} courseId={courseId} done={state.done.includes(current.id)} onComplete={complete} harness={harness} rendered={rendered[current.id] ?? {}} />
        </div>
      ) : (
        <div className="session-step session-finished">
          <h2>{lectureNumber ? `Lecture ${lectureNumber} practice finished` : "Practice finished"}</h2>
          <p>{doneCount} done, {skippedCount} skipped.</p>
          {skippedCount > 0 && <p>Skipped steps are striped in the bar above. Click one to go back and try it again.</p>}
          <p><Link href="/#deck">Back to all lectures</Link></p>
        </div>
      )}

      <div className="session-nav">
        <button type="button" className="btn-quiet" onClick={() => go(state.step - 1)} disabled={state.step === 0}>Back</button>
        {current && (
          <>
            <button type="button" className="session-skip btn-quiet" onClick={skip} disabled={state.done.includes(current.id)}>Skip for now</button>
            <button type="button" className="btn-primary" onClick={() => go(state.step + 1)} disabled={!state.done.includes(current.id)}>
              {state.step === total - 1 ? "Finish" : "Next"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
