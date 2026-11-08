// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PracticeCard } from "@/components/Practice";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLElement;
let root: Root;

const labels = () => [...host.querySelectorAll("button")].map((b) => b.textContent);
const hints = () => host.querySelectorAll(".hint").length;
const click = (label: string) =>
  act(() => {
    const button = [...host.querySelectorAll("button")].find((b) => b.textContent === label);
    if (!button) throw new Error(`no button "${label}" in ${labels().join(", ")}`);
    button.click();
  });

function render(hintTexts: string[]) {
  act(() => {
    root.render(
      createElement(PracticeCard, {
        id: "p1",
        courseId: "c",
        kind: "exercise",
        summary: "A task",
        statement: "Do it",
        hints: hintTexts,
        solution: "The answer",
      }),
    );
  });
  click("PracticeA taskOpen");
}

beforeEach(() => {
  localStorage.clear();
  host = document.body.appendChild(document.createElement("div"));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("practice card hints", () => {
  it("opens, closes, and reopens with the revealed hints kept", () => {
    render(["first", "second"]);
    expect(hints()).toBe(0);

    click("Show hint");
    expect(hints()).toBe(1);
    click("Next hint (2 of 2)");
    expect(hints()).toBe(2);
    expect(labels()).not.toContain("Next hint (2 of 2)");

    click("Hide hints");
    expect(hints()).toBe(0);
    click("Show hints");
    expect(hints()).toBe(2);
  });

  it("uses the singular for one hint and offers no next hint", () => {
    render(["only"]);
    click("Show hint");
    expect(labels()).toContain("Hide hint");
    expect(labels().some((label) => label?.startsWith("Next hint"))).toBe(false);
  });

  it("toggles the solution apart from the hints", () => {
    render(["first"]);
    click("Show hint");
    click("Show solution");
    expect(host.querySelector(".solution")?.textContent).toContain("The answer");
    click("Hide solution");
    expect(host.querySelector(".solution")).toBeNull();
    expect(hints()).toBe(1);
  });
});
