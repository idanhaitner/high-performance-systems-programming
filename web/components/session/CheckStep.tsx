"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import type { SessionStep } from "@/lib/types";
import { CheckFrameContext, type CheckFrame } from "./check-frame";
import { QUESTION_SPLIT, Split } from "./Split";

type Props = { step: Extract<SessionStep, { kind: "check" }>; content: ReactNode; done: boolean; onComplete: () => void; courseId: string; title: string; moved: boolean };

export function CheckStep({ step, content, done, onComplete, courseId, title, moved }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; correct: boolean }>).detail;
      if (detail && detail.id === step.id && detail.correct === true) onComplete();
    };
    window.addEventListener("study-check", listener);
    return () => window.removeEventListener("study-check", listener);
  }, [step.id, onComplete]);

  useEffect(() => {
    if (moved) titleRef.current?.focus();
  }, [moved]);

  // The same divider as a coding exercise, so the question stays put and only the right side changes between them.
  const frame = useCallback<CheckFrame>(({ question, answers, results, right }) => (
    <Split
      {...QUESTION_SPLIT}
      courseId={courseId}
      label="Resize the question and answers panels"
      first={
        <div className="question-panel">
          <h2 ref={titleRef} tabIndex={-1} className="question-title">{title}</h2>
          {question}
        </div>
      }
      second={
        // Check sits right under the choices, so the answer and the button are close, and the result appears below them.
        <div className="check-answers">
          {answers}
          <div className="check-actions">
            {/* Once the step is solved, Next in the top bar is the one primary action. */}
            <button type="submit" className={done || right ? undefined : "btn-primary"}>Check</button>
          </div>
          {results}
        </div>
      }
    />
  ), [courseId, title, done]);

  return (
    <div className="session-step check-step">
      <CheckFrameContext.Provider value={frame}>{content}</CheckFrameContext.Provider>
    </div>
  );
}
