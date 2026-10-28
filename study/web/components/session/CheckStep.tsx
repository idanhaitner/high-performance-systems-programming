"use client";

import { useEffect } from "react";
import { Blocks } from "@/components/Blocks";
import type { SessionStep } from "@/lib/types";

export function CheckStep({ step, courseId, onComplete }: { step: Extract<SessionStep, { kind: "check" }>; courseId: string; onComplete: () => void }) {
  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; correct: boolean }>).detail;
      if (detail && detail.id === step.id && detail.correct === true) onComplete();
    };
    window.addEventListener("study-check", listener);
    return () => window.removeEventListener("study-check", listener);
  }, [step.id, onComplete]);
  return (
    <div className="session-step">
      <p className="kicker">Quick check</p>
      <Blocks blocks={[step.block]} courseId={courseId} />
    </div>
  );
}
