"use client";

import type { SessionStep } from "@/lib/types";
import { CodeStep } from "./CodeStep";
import type { RenderedStep } from "./rendered";

type Props = { step: Extract<SessionStep, { kind: "exercise" }>; courseId: string; done: boolean; onComplete: () => void; harness: string; rendered: RenderedStep; moved: boolean };

export function ExerciseStep(props: Props) {
  return <CodeStep {...props} />;
}
