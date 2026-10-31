"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Mixed } from "@/lib/bidi";
import { readSession, resumeStep, writeSession, type SessionState } from "@/lib/session-store";
import type { Session, SessionStep } from "@/lib/types";
import { CheckStep } from "./CheckStep";
import { ExerciseStep } from "./ExerciseStep";
import { LabStep } from "./LabStep";
import { LearnStep } from "./LearnStep";
import type { RenderedStep } from "./rendered";
import { WorkspaceBar } from "./WorkspaceBar";

type StepProps = { step: SessionStep; courseId: string; done: boolean; onComplete: () => void; harness: string; rendered: RenderedStep; moved: boolean; intro?: ReactNode; checkTitle: string };

function StepView({ step, courseId, done, onComplete, harness, rendered, moved, intro, checkTitle }: StepProps) {
  switch (step.kind) {
    case "learn":
      return <LearnStep step={step} content={rendered.content} onComplete={onComplete} intro={intro} />;
    case "check":
      return <CheckStep step={step} content={rendered.content} done={done} onComplete={onComplete} courseId={courseId} title={checkTitle} moved={moved} />;
    case "lab":
      return <LabStep step={step} content={rendered.content} done={done} onComplete={onComplete} />;
    case "exercise":
      return <ExerciseStep step={step} courseId={courseId} done={done} onComplete={onComplete} harness={harness} rendered={rendered} moved={moved} />;
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
  intro,
}: {
  session: Session;
  courseId: string;
  harness: string;
  rendered: Record<string, RenderedStep>;
  lectureNumber: number | null;
  intro: ReactNode;
}) {
  const total = session.steps.length;
  // A string, so a re-render with the same steps does not send the student back to the resume point.
  const stepIds = session.steps.map((step) => step.id).join("\n");
  const [state, setState] = useState<SessionState>({ step: 0, done: [], skipped: [] });
  const [ready, setReady] = useState(false);
  // False until the student moves, so the page load has no entrance and takes no focus.
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const stored = readSession(courseId, session.id);
    setState({ ...stored, step: resumeStep(stepIds.split("\n"), stored) });
    setReady(true);
  }, [courseId, session.id, stepIds]);

  useEffect(() => {
    if (ready) writeSession(courseId, session.id, state);
  }, [ready, courseId, session.id, state]);

  // Fetched ahead of time, so reaching the first coding step does not flash "Loading the editor".
  const hasExercise = session.steps.some((step) => step.kind === "exercise");
  useEffect(() => {
    if (hasExercise) void import("./Editor");
  }, [hasExercise]);

  const shownStep = useRef<number | null>(null);

  // The button the student pressed can vanish or turn off on the new step, which drops focus to the page.
  // A question or exercise focuses its own title, so this covers the reading steps. Never on page load.
  useEffect(() => {
    if (!ready) return;
    const from = shownStep.current;
    shownStep.current = state.step;
    if (from === null || from === state.step || !moved) return;
    const heading = document.querySelector<HTMLElement>(".session .reading-step > h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [ready, state.step, moved]);

  const finished = state.step >= total;
  const current = finished ? null : session.steps[state.step];
  const currentId = current?.id;
  const lesson = currentId ? rendered[currentId]?.lesson : undefined;

  const complete = useCallback(() => {
    if (!currentId) return;
    setState((s) => (s.done.includes(currentId) ? s : { ...s, done: [...s.done, currentId], skipped: s.skipped.filter((id) => id !== currentId) }));
  }, [currentId]);

  const go = (step: number) => {
    setMoved(true);
    setState((s) => ({ ...s, step: Math.min(Math.max(step, 0), total) }));
  };
  const skip = () => {
    if (!current) return;
    setMoved(true);
    setState((s) => ({
      ...s,
      step: Math.min(s.step + 1, total),
      skipped: s.skipped.includes(current.id) || s.done.includes(current.id) ? s.skipped : [...s.skipped, current.id],
    }));
  };

  const doneCount = session.steps.filter((step) => state.done.includes(step.id)).length;
  const skippedCount = session.steps.filter((step) => state.skipped.includes(step.id) && !state.done.includes(step.id)).length;
  const checks = session.steps.filter((step) => step.kind === "check");
  const checkTitle = `Question ${checks.findIndex((step) => step.id === currentId) + 1} of ${checks.length}`;
  const opening = state.step === 0 && current?.kind === "learn";

  return (
    <div className="session">
      {/* The title is on screen only at the opening, and stays in the outline on every other step. */}
      {!(ready && opening) && <h1 className="sr-only"><Mixed text={session.title} /></h1>}
      <WorkspaceBar
        lectureNumber={lectureNumber}
        where={!ready ? "" : finished ? "All steps seen" : `Step ${state.step + 1} of ${total}`}
        kind={ready && current ? { id: current.kind, label: kindLabel(current) } : undefined}
        lesson={ready ? lesson : undefined}
        canGoBack={ready && state.step > 0}
        onBack={() => go(state.step - 1)}
        onSkip={skip}
        canSkip={ready && !!current && !state.done.includes(current.id)}
        onNext={() => go(state.step + 1)}
        canNext={ready && !!current && state.done.includes(current.id)}
        nextLabel={state.step === total - 1 ? "Finish" : "Next"}
        atEnd={finished}
      />
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

      {!ready ? null : current ? (
        <div key={current.id} className={moved ? "session-current step-in" : "session-current"}>
          <StepView step={current} courseId={courseId} done={state.done.includes(current.id)} onComplete={complete} harness={harness} rendered={rendered[current.id] ?? {}} moved={moved} intro={opening ? intro : undefined} checkTitle={checkTitle} />
        </div>
      ) : (
        <div className="session-step reading-step session-finished">
          <h2>{lectureNumber ? `Lecture ${lectureNumber} practice finished` : "Practice finished"}</h2>
          <p>{doneCount} done, {skippedCount} skipped.</p>
          {skippedCount > 0 && <p>Skipped steps are striped in the bar above. Click one to go back and try it again.</p>}
          <p><Link href="/#deck">Back to all lectures</Link></p>
        </div>
      )}
    </div>
  );
}
