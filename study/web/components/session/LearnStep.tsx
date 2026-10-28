"use client";

import { useEffect, type ReactNode } from "react";
import { Mixed } from "@/lib/bidi";
import type { SessionStep } from "@/lib/types";

export function LearnStep({ step, content, onComplete }: { step: Extract<SessionStep, { kind: "learn" }>; content: ReactNode; onComplete: () => void }) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);
  return (
    <div className="session-step">
      <p className="kicker">Read</p>
      <h2><Mixed text={step.title} /></h2>
      {content}
    </div>
  );
}
