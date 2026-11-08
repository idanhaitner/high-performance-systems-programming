import { describe, expect, it } from "vitest";
import { CHIP, layoutBoard, levelOf } from "./progress-board";

describe("levelOf", () => {
  it("puts untouched lessons on disk and finished lessons in the registers", () => {
    expect(levelOf(0, 4)).toBe(3);
    expect(levelOf(0, 0)).toBe(3);
    expect(levelOf(1, 4)).toBe(2);
    expect(levelOf(2, 4)).toBe(1);
    expect(levelOf(4, 4)).toBe(0);
  });
});

describe("layoutBoard", () => {
  it("keeps closer levels higher up, and wraps long rows", () => {
    const { places, tops, height } = layoutBoard([0, 3, 3, 3]);
    expect(tops[0]).toBeGreaterThan(CHIP);
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
    expect(places[0].y).toBeLessThan(places[1].y);
    expect(places[2].x).toBeGreaterThan(places[1].x);
    expect(height).toBeGreaterThan(places[3].y);
    const wide = layoutBoard(Array(30).fill(3));
    expect(wide.places[12].y).toBeGreaterThan(wide.places[0].y);
  });
});
