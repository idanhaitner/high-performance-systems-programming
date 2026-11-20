import { describe, expect, it } from "vitest";
import { findResume, startLabel } from "./progress";

const lessons = [
  { id: "l1-a", title: "Bits", lecture: 1 },
  { id: "l3-b", title: "Caches", lecture: 3 },
];

describe("findResume", () => {
  it("finds the lesson the student opened last", () => {
    expect(findResume(lessons, "l3-b")).toEqual(lessons[1]);
  });

  it("returns null for a new student or a lesson that no longer exists", () => {
    expect(findResume(lessons, undefined)).toBeNull();
    expect(findResume(lessons, "gone")).toBeNull();
  });
});

describe("startLabel", () => {
  it("names the student's current lecture once they have started", () => {
    expect(startLabel(lessons[1])).toBe("Continue lecture 3");
  });

  it("starts at lecture 1 for a new student", () => {
    expect(startLabel(null)).toBe("Start lecture 1");
  });
});
