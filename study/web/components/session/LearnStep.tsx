"use client";

import { useEffect, type ReactNode } from "react";
import { Mixed } from "@/lib/bidi";
import type { SessionStep } from "@/lib/types";

export function LearnStep({ step, content, onComplete, intro }: { step: Extract<SessionStep, { kind: "learn" }>; content: ReactNode; onComplete: () => void; intro?: ReactNode }) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);
  return (
    <div className="session-step reading-step">
      {intro}
      <h2><Mixed text={step.title} /></h2>
      {content}
    </div>
  );
}
