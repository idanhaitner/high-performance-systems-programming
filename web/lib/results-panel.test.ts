// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResultsPanel } from "@/components/session/ResultsPanel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLElement;
let root: Root;

const tabs = () => [...host.querySelectorAll<HTMLElement>('[role="tab"]')];
const panel = (name: string) => host.querySelector<HTMLElement>(`[role="tabpanel"][aria-labelledby="results-tab-${name}"]`)!;

function render(tab: "output" | "assembly", onTab = vi.fn()) {
  act(() => {
    root.render(createElement(ResultsPanel, { tab, onTab, output: "the output", assembly: "the assembly" }));
  });
  return onTab;
}

const press = (el: HTMLElement, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  });

beforeEach(() => {
  host = document.body.appendChild(document.createElement("div"));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("results panel", () => {
  it("is a tablist of Output and Assembly with the current one selected", () => {
    render("assembly");
    expect(host.querySelector('[role="tablist"]')).not.toBeNull();
    expect(tabs().map((t) => t.textContent)).toEqual(["Output", "Assembly"]);
    expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "true"]);
  });

  it("reports a clicked tab", () => {
    const onTab = render("output");
    act(() => tabs()[1].click());
    expect(onTab).toHaveBeenCalledWith("assembly");
  });

  it("moves with the arrow keys and wraps around", () => {
    const onTab = render("output");
    press(tabs()[0], "ArrowRight");
    expect(onTab).toHaveBeenLastCalledWith("assembly");
    press(tabs()[0], "ArrowLeft");
    expect(onTab).toHaveBeenLastCalledWith("assembly");
    expect(onTab).toHaveBeenCalledTimes(2);
  });

  it("lets the keyboard reach both panels, so long output can be scrolled", () => {
    render("output");
    expect(panel("output").getAttribute("tabindex")).toBe("0");
    expect(panel("assembly").getAttribute("tabindex")).toBe("0");
  });

  it("shows only the selected panel, with the output in a live region", () => {
    render("output");
    expect(panel("output").hidden).toBe(false);
    expect(panel("assembly").hidden).toBe(true);
    expect(panel("output").closest('[aria-live="polite"]')).not.toBeNull();

    render("assembly");
    expect(panel("output").hidden).toBe(true);
    expect(panel("assembly").hidden).toBe(false);
  });
});
