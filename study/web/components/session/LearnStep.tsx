"use client";

import { useEffect } from "react";
import { Blocks } from "@/components/Blocks";
import { Mixed } from "@/lib/bidi";
import type { SessionStep } from "@/lib/types";

export function LearnStep({ step, courseId, onComplete }: { step: Extract<SessionStep, { kind: "learn" }>; courseId: string; onComplete: () => void }) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);
  return (
    <div className="session-step">
      <p className="kicker">Read</p>
      <h2><Mixed text={step.title} /></h2>
      <Blocks blocks={step.blocks} courseId={courseId} />
    </div>
  );
}
