"use client";

import type { SessionStep } from "@/lib/types";
import { CodeStep } from "./CodeStep";

type Props = { step: Extract<SessionStep, { kind: "exercise" }>; courseId: string; onComplete: () => void; harness: string };

export function ExerciseStep(props: Props) {
  return <CodeStep {...props} />;
}
