import { describe, expect, it } from "vitest";
import { C_REFERENCE, findFunctions, SUGGESTIONS } from "./c-reference";

const top = (query: string, count = 2) => findFunctions(query).slice(0, count).map((entry) => entry.name);

describe("findFunctions", () => {
  it("finds a function from what it does, in plain words", () => {
    expect(top("copy a string")).toEqual(expect.arrayContaining(["strcpy"]));
    expect(top("how long is a string", 3)).toEqual(expect.arrayContaining(["strlen"]));
    expect(top("compare two strings", 2)).toEqual(expect.arrayContaining(["strcmp"]));
    expect(top("allocate an array", 3)).toEqual(expect.arrayContaining(["malloc"]));
    expect(top("free memory", 2)).toContain("free");
    expect(top("make an array bigger", 3)).toContain("realloc");
    expect(top("sort an array", 1)).toEqual(["qsort"]);
  });

  it("finds a function by its name", () => {
    expect(top("strlen", 1)).toEqual(["strlen"]);
    expect(top("memcpy", 1)).toEqual(["memcpy"]);
    expect(top("snprintf", 1)).toEqual(["sprintf / snprintf"]);
  });

  it("returns nothing for filler or nonsense", () => {
    expect(findFunctions("how do I")).toEqual([]);
    expect(findFunctions("zebra")).toEqual([]);
  });

  it("answers every suggestion it offers", () => {
    for (const suggestion of SUGGESTIONS) expect(findFunctions(suggestion).length).toBeGreaterThan(0);
  });

  it("gives every entry a header, a signature, and an example", () => {
    for (const entry of C_REFERENCE) {
      expect(entry.header && entry.signature && entry.example && entry.does).toBeTruthy();
    }
  });
});
