"use client";

import { useEffect, type ReactNode } from "react";
import type { SessionStep } from "@/lib/types";

export function CheckStep({ step, content, onComplete }: { step: Extract<SessionStep, { kind: "check" }>; content: ReactNode; onComplete: () => void }) {
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
      {content}
    </div>
  );
}
