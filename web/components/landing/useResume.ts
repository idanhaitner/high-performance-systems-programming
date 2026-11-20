"use client";

import { useEffect, useState } from "react";
import { findResume, readProgress, type ResumeLesson } from "@/lib/progress";

// The lesson to pick up from, kept in step with the progress saved in this browser.
export function useResume(courseId: string, lessons: ResumeLesson[]) {
  const [resume, setResume] = useState<ResumeLesson | null>(null);

  useEffect(() => {
    const sync = () => setResume(findResume(lessons, readProgress(courseId).last));
    sync();
    window.addEventListener("study-progress", sync);
    return () => window.removeEventListener("study-progress", sync);
  }, [courseId, lessons]);

  return resume;
}
