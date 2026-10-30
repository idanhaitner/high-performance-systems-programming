// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionPanel } from "@/components/session/QuestionPanel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLElement;
let root: Root;

const text = () => host.textContent ?? "";
const headings = () => [...host.querySelectorAll("h3, h4")].map((h) => h.textContent);
const button = (label: string) => {
  const found = [...host.querySelectorAll("button")].find((b) => b.textContent === label);
  if (!found) throw new Error(`no button "${label}"`);
  return found;
};
const click = (label: string) => act(() => button(label).click());
const hasButton = (prefix: string) => [...host.querySelectorAll("button")].some((b) => b.textContent?.startsWith(prefix));

function render(over: Partial<{ examples: ReactNode[]; hints: ReactNode[]; renderSolution: () => ReactNode; focusTitle: boolean }> = {}) {
  act(() => {
    root.render(
      createElement(QuestionPanel, {
        title: "Swap two numbers",
        content: createElement("p", null, "Do the thing"),
        examples: [],
        hints: [],
        renderSolution: () => "the answer",
        focusTitle: false,
        ...over,
      }),
    );
  });
}

beforeEach(() => {
  host = document.body.appendChild(document.createElement("div"));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("question panel", () => {
  it("numbers the examples under an Examples heading", () => {
    render({ examples: [createElement("p", { key: 1 }, "one"), createElement("p", { key: 2 }, "two")] });
    expect(headings()).toEqual(["Description", "Examples", "Example 1", "Example 2"]);
  });

  it("has no Examples heading without examples", () => {
    render();
    expect(headings()).toEqual(["Description"]);
  });

  it("reveals hints one at a time and keeps them across closing", () => {
    render({ hints: ["first", "second", "third"] });
    const toggle = () => button("Hints (0 of 3)");
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(text()).not.toContain("first");

    click("Hints (0 of 3)");
    expect(text()).toContain("first");
    expect(text()).not.toContain("second");
    expect(button("Hints (1 of 3)").getAttribute("aria-expanded")).toBe("true");

    click("Next hint");
    expect(text()).toContain("second");

    click("Hints (2 of 3)");
    expect(text()).not.toContain("first");
    click("Hints (2 of 3)");
    expect(text()).toContain("first");
    expect(text()).toContain("second");
    expect(text()).not.toContain("third");
  });

  it("has no Hints button without hints", () => {
    render();
    expect(hasButton("Hints")).toBe(false);
  });

  it("does not build the solution until it is opened", () => {
    const renderSolution = vi.fn(() => "the answer");
    render({ renderSolution });
    expect(renderSolution).not.toHaveBeenCalled();
    expect(button("Solution").getAttribute("aria-expanded")).toBe("false");

    click("Solution");
    expect(renderSolution).toHaveBeenCalled();
    expect(text()).toContain("the answer");
  });

  it("focuses the title on mount only when asked", () => {
    render({ focusTitle: true });
    expect(document.activeElement).toBe(host.querySelector("h2"));
    act(() => root.unmount());
    root = createRoot(host);
    (document.activeElement as HTMLElement | null)?.blur();
    render({ focusTitle: false });
    expect(document.activeElement).not.toBe(host.querySelector("h2"));
  });
});
