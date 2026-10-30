import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site fonts", () => {
  it("are bundled with the project, so a build never downloads them", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).not.toContain("next/font/google");
  });
});
