"use client";

import { useCallback, useEffect, useState } from "react";
import { Mixed } from "@/lib/bidi";
import { readSession, writeSession, type SessionState } from "@/lib/session-store";
import type { Session, SessionStep } from "@/lib/types";
import { CheckStep } from "./CheckStep";
import { ExerciseStep } from "./ExerciseStep";
import { LabStep } from "./LabStep";
import { LearnStep } from "./LearnStep";

type StepProps = { step: SessionStep; courseId: string; onComplete: () => void; harness: string };

function StepView({ step, courseId, onComplete, harness }: StepProps) {
  switch (step.kind) {
    case "learn":
      return <LearnStep step={step} courseId={courseId} onComplete={onComplete} />;
    case "check":
      return <CheckStep step={step} courseId={courseId} onComplete={onComplete} />;
    case "lab":
      return <LabStep step={step} courseId={courseId} onComplete={onComplete} />;
    case "exercise":
      return <ExerciseStep step={step} courseId={courseId} onComplete={onComplete} harness={harness} />;
  }
}

const label = (step: SessionStep) => (step.kind === "learn" ? step.title : step.kind === "lab" ? step.lab.title : step.kind === "exercise" ? step.exercise.title : "Quick check");

export function Stepper({ session, courseId, harness }: { session: Session; courseId: string; harness: string }) {
  const total = session.steps.length;
  const [state, setState] = useState<SessionState>({ step: 0, done: [], skipped: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readSession(courseId, session.id);
    setState({ ...stored, step: Math.min(Math.max(stored.step, 0), total) });
    setReady(true);
  }, [courseId, session.id, total]);

  useEffect(() => {
    if (ready) writeSession(courseId, session.id, state);
  }, [ready, courseId, session.id, state]);

  const finished = state.step >= total;
  const current = finished ? null : session.steps[state.step];
  const currentId = current?.id;

  const complete = useCallback(() => {
    if (!currentId) return;
    setState((s) => (s.done.includes(currentId) ? s : { ...s, done: [...s.done, currentId], skipped: s.skipped.filter((id) => id !== currentId) }));
  }, [currentId]);

  const go = (step: number) => setState((s) => ({ ...s, step: Math.min(Math.max(step, 0), total) }));
  const skip = () => {
    if (!current) return;
    setState((s) => ({
      ...s,
      step: Math.min(s.step + 1, total),
      skipped: s.skipped.includes(current.id) || s.done.includes(current.id) ? s.skipped : [...s.skipped, current.id],
    }));
  };

  const doneCount = session.steps.filter((step) => state.done.includes(step.id)).length;
  const skippedCount = session.steps.filter((step) => state.skipped.includes(step.id) && !state.done.includes(step.id)).length;

  return (
    <div className="session">
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
      <p className="session-count">{finished ? "Done" : `Step ${state.step + 1} of ${total}`}</p>

      {!ready ? null : current ? (
        <div key={current.id}>
          <StepView step={current} courseId={courseId} onComplete={complete} harness={harness} />
        </div>
      ) : (
        <div className="session-step session-finished">
          <h2>Session finished</h2>
          <p>{doneCount} done, {skippedCount} skipped.</p>
        </div>
      )}

      <div className="session-nav">
        <button type="button" onClick={() => go(state.step - 1)} disabled={state.step === 0}>Back</button>
        {current && (
          <>
            <button type="button" className="session-skip" onClick={skip} disabled={state.done.includes(current.id)}>Skip for now</button>
            <button type="button" className="is-on" onClick={() => go(state.step + 1)} disabled={!state.done.includes(current.id)}>
              {state.step === total - 1 ? "Finish" : "Next"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
