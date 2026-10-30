import { storageKey } from "./progress";

export type SessionState = { step: number; done: string[]; skipped: string[] };

const empty = (): SessionState => ({ step: 0, done: [], skipped: [] });

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

function get(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked or full; progress just won't be saved.
  }
}

export function readSession(courseId: string, sessionId: string): SessionState {
  const raw = get(`${storageKey(courseId)}:session:${sessionId}`);
  if (!raw) return empty();
  try {
    const parsed = JSON.parse(raw) as Partial<SessionState> | null;
    if (!parsed || typeof parsed !== "object") return empty();
    const step = typeof parsed.step === "number" && Number.isFinite(parsed.step) ? parsed.step : 0;
    return { step, done: strings(parsed.done), skipped: strings(parsed.skipped) };
  } catch {
    return empty();
  }
}

// Where to reopen: the first step not yet done or skipped. Stored step numbers go
// stale when a session's content changes, but step ids stay true. Past the last
// step means every step has been handled.
export function resumeStep(stepIds: string[], state: SessionState): number {
  const open = stepIds.findIndex((id) => !state.done.includes(id) && !state.skipped.includes(id));
  return open === -1 ? stepIds.length : open;
}

export function writeSession(courseId: string, sessionId: string, state: SessionState) {
  set(`${storageKey(courseId)}:session:${sessionId}`, JSON.stringify(state));
}

export function readCode(courseId: string, exerciseId: string): string | null {
  return get(`${storageKey(courseId)}:code:${exerciseId}`);
}

export function writeCode(courseId: string, exerciseId: string, code: string) {
  set(`${storageKey(courseId)}:code:${exerciseId}`, code);
}

export function clearCode(courseId: string, exerciseId: string) {
  try {
    localStorage.removeItem(`${storageKey(courseId)}:code:${exerciseId}`);
  } catch {
    // ignore
  }
}

export function readFails(courseId: string, exerciseId: string): number {
  const n = Number(get(`${storageKey(courseId)}:fails:${exerciseId}`));
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export function writeFails(courseId: string, exerciseId: string, n: number) {
  set(`${storageKey(courseId)}:fails:${exerciseId}`, String(n));
}
