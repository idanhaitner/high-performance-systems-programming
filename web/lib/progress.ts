export type Progress = {
  solved: string[];
  last?: string;
};

export function storageKey(courseId: string) {
  return `study:${courseId}`;
}

export function readProgress(courseId: string): Progress {
  if (typeof window === "undefined") return { solved: [] };
  try {
    const raw = localStorage.getItem(storageKey(courseId));
    if (!raw) return { solved: [] };
    const parsed = JSON.parse(raw) as Progress;
    return {
      solved: Array.isArray(parsed.solved) ? parsed.solved.filter((id) => typeof id === "string") : [],
      last: typeof parsed.last === "string" ? parsed.last : undefined,
    };
  } catch {
    return { solved: [] };
  }
}

export function writeProgress(courseId: string, progress: Progress) {
  try {
    localStorage.setItem(storageKey(courseId), JSON.stringify(progress));
  } catch {
    // Storage can be blocked or full; the page still works, progress just isn't kept.
  }
  window.dispatchEvent(new Event("study-progress"));
}

export type ResumeLesson = { id: string; title: string; lecture: number };

// The lesson the student opened last, if it is still part of the course.
export function findResume<T extends { id: string }>(lessons: T[], last: string | undefined): T | null {
  return lessons.find((lesson) => lesson.id === last) ?? null;
}

// The label of the landing page's start button: the first lecture for a new student, their lecture after that.
export function startLabel(resume: ResumeLesson | null) {
  return resume ? `Continue lecture ${resume.lecture}` : "Start lecture 1";
}
