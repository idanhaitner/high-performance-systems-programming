"use client";

import Link from "next/link";
import { Mixed } from "@/lib/bidi";
import type { SessionStep } from "@/lib/types";

type Props = {
  lectureNumber: number | null;
  where: string;
  kind?: { id: SessionStep["kind"]; label: string };
  lesson?: { id: string; title: string };
  canGoBack: boolean;
  onBack(): void;
  onSkip(): void;
  canSkip: boolean;
  onNext(): void;
  canNext: boolean;
  nextLabel: string;
  atEnd: boolean;
};

export function WorkspaceBar({ lectureNumber, where, kind, lesson, canGoBack, onBack, onSkip, canSkip, onNext, canNext, nextLabel, atEnd }: Props) {
  return (
    <div className="workspace-bar">
      <div className="workspace-where">
        <Link className="workspace-lecture" href="/#deck">{lectureNumber ? `Lecture ${lectureNumber}` : "All lectures"}</Link>
        {kind && <span className="step-kind" data-kind={kind.id}>{kind.label}</span>}
        <p className="workspace-count">{where}</p>
        {lesson && (
          <Link className="workspace-lesson" href={`/topics/${lesson.id}`}>
            Reread: <Mixed text={lesson.title} />
          </Link>
        )}
      </div>
      <div className="workspace-nav">
        <button type="button" className="btn-quiet" onClick={onBack} disabled={!canGoBack}>Back</button>
        {!atEnd && (
          <>
            <button type="button" className="btn-quiet" onClick={onSkip} disabled={!canSkip}>Skip for now</button>
            {/* Next stays plain until the step is solved, so the step's own action is the one primary button until then. */}
            <button type="button" className={canNext ? "btn-primary" : undefined} onClick={onNext} disabled={!canNext}>{nextLabel}</button>
          </>
        )}
      </div>
    </div>
  );
}
