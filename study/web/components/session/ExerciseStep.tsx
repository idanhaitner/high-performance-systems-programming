"use client";

import { Mixed } from "@/lib/bidi";
import type { SessionStep } from "@/lib/types";

export function ExerciseStep({ step }: { step: Extract<SessionStep, { kind: "exercise" }>; courseId: string; onComplete: () => void }) {
  return (
    <div className="session-step">
      <p className="kicker">Coding exercise</p>
      <h2><Mixed text={step.exercise.title} /></h2>
      <p className="session-note">Coding exercise coming in the next step of the build</p>
    </div>
  );
}
