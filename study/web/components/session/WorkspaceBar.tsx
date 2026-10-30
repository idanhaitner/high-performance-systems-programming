"use client";

import Link from "next/link";
import { Mixed } from "@/lib/bidi";

type Props = {
  lectureNumber: number | null;
  step: number;
  total: number;
  lesson?: { id: string; title: string };
  canGoBack: boolean;
  onBack(): void;
  onSkip(): void;
  canSkip: boolean;
  onNext(): void;
  canNext: boolean;
  nextLabel: string;
};

export function WorkspaceBar({ lectureNumber, step, total, lesson, canGoBack, onBack, onSkip, canSkip, onNext, canNext, nextLabel }: Props) {
  return (
    <div className="workspace-bar">
      <div className="workspace-where">
        <Link className="workspace-lecture" href="/#deck">{lectureNumber ? `Lecture ${lectureNumber}` : "All lectures"}</Link>
        <p className="workspace-count">Step {step} of {total}</p>
        {lesson && (
          <Link className="workspace-lesson" href={`/topics/${lesson.id}`}>
            Reread: <Mixed text={lesson.title} />
          </Link>
        )}
      </div>
      <div className="workspace-nav">
        <button type="button" className="btn-quiet" onClick={onBack} disabled={!canGoBack}>Back</button>
        <button type="button" className="btn-quiet" onClick={onSkip} disabled={!canSkip}>Skip for now</button>
        {/* Next stays plain until the step is solved, so Submit is the one primary button until then. */}
        <button type="button" className={canNext ? "btn-primary" : undefined} onClick={onNext} disabled={!canNext}>{nextLabel}</button>
      </div>
    </div>
  );
}
