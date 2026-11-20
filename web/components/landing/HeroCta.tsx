"use client";

import Link from "next/link";
import type { ResumeLesson } from "@/lib/progress";
import { useResume } from "./useResume";

// Start at lesson 1, or pick up where the student stopped last time.
export function HeroCta({ courseId, lessons }: { courseId: string; lessons: ResumeLesson[] }) {
  const resume = useResume(courseId, lessons);

  const first = lessons[0];
  if (!first) return null;
  return (
    <div className="hero-actions">
      <Link className="landing-cta" href={`/topics/${(resume ?? first).id}`}>
        {resume ? "Continue where you stopped" : "Start lecture 1"}
        <span className="cta-arrow" aria-hidden="true">→</span>
      </Link>
      {resume && <span className="hero-resume">Next up: {resume.title}</span>}
    </div>
  );
}
