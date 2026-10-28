"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readProgress } from "@/lib/progress";

type Lesson = { id: string; title: string };

// Start at lesson 1, or pick up where the student stopped last time.
export function HeroCta({ courseId, lessons }: { courseId: string; lessons: Lesson[] }) {
  const [resume, setResume] = useState<Lesson | null>(null);

  useEffect(() => {
    const last = readProgress(courseId).last;
    setResume(lessons.find((lesson) => lesson.id === last) ?? null);
  }, [courseId, lessons]);

  const first = lessons[0];
  if (!first) return null;
  return (
    <div className="hero-actions">
      <Link className="landing-cta" href={`/topics/${(resume ?? first).id}`}>
        {resume ? "Continue where you stopped" : "Start lecture 1"}
      </Link>
      {resume && <span className="hero-resume">Next up: {resume.title}</span>}
    </div>
  );
}
