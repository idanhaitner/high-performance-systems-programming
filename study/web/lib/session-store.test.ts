// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCode,
  readCode,
  readSession,
  resumeStep,
  writeCode,
  writeSession,
} from "./session-store";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("session state", () => {
  it("defaults when nothing is stored", () => {
    expect(readSession("c", "s1")).toEqual({ step: 0, done: [], skipped: [] });
  });

  it("round-trips under study:<course>:session:<id>", () => {
    const state = { step: 2, done: ["a", "b"], skipped: ["c"] };
    writeSession("c", "s1", state);
    expect(readSession("c", "s1")).toEqual(state);
    expect(JSON.parse(localStorage.getItem("study:c:session:s1")!)).toEqual(state);
  });

  it("returns the default for corrupt JSON", () => {
    localStorage.setItem("study:c:session:s1", "{nope");
    expect(readSession("c", "s1")).toEqual({ step: 0, done: [], skipped: [] });
  });

  it("returns the default for the wrong shape", () => {
    localStorage.setItem("study:c:session:s1", JSON.stringify({ step: "x", done: 3, skipped: [1, "ok"] }));
    expect(readSession("c", "s1")).toEqual({ step: 0, done: [], skipped: ["ok"] });
  });

  it("does not clamp step (the caller does)", () => {
    writeSession("c", "s1", { step: 99, done: [], skipped: [] });
    expect(readSession("c", "s1").step).toBe(99);
  });
});

describe("resumeStep", () => {
  const ids = ["a", "b", "c"];

  it("starts at the first step when nothing is done", () => {
    expect(resumeStep(ids, { step: 0, done: [], skipped: [] })).toBe(0);
  });

  it("passes done and skipped steps", () => {
    expect(resumeStep(ids, { step: 0, done: ["a"], skipped: ["b"] })).toBe(2);
  });

  it("ignores a stale step number and ids that no longer exist", () => {
    expect(resumeStep(ids, { step: 18, done: ["a", "gone"], skipped: [] })).toBe(1);
  });

  it("goes past the end when every step is handled", () => {
    expect(resumeStep(ids, { step: 1, done: ["a", "b"], skipped: ["c"] })).toBe(3);
  });
});

describe("code", () => {
  it("round-trips code under study:<course>:code:<id>", () => {
    expect(readCode("c", "e1")).toBeNull();
    writeCode("c", "e1", "int x;");
    expect(readCode("c", "e1")).toBe("int x;");
    expect(localStorage.getItem("study:c:code:e1")).toBe("int x;");
    clearCode("c", "e1");
    expect(readCode("c", "e1")).toBeNull();
  });
});

describe("when localStorage throws", () => {
  beforeEach(() => {
    const boom = () => {
      throw new Error("blocked");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(boom);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(boom);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(boom);
  });

  it("reads return defaults", () => {
    expect(readSession("c", "s")).toEqual({ step: 0, done: [], skipped: [] });
    expect(readCode("c", "e")).toBeNull();
  });

  it("writes do not throw", () => {
    expect(() => writeSession("c", "s", { step: 1, done: [], skipped: [] })).not.toThrow();
    expect(() => writeCode("c", "e", "x")).not.toThrow();
    expect(() => clearCode("c", "e")).not.toThrow();
  });
});
