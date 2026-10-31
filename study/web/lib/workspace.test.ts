// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspaceBar } from "@/components/session/WorkspaceBar";
import { workspaceShortcut } from "./workspace";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLElement;
let root: Root;

beforeEach(() => {
  host = document.body.appendChild(document.createElement("div"));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("WorkspaceBar", () => {
  const props = {
    lectureNumber: 1,
    where: "Step 3 of 26",
    kind: { id: "exercise", label: "Coding exercise" } as { id: "exercise"; label: string } | undefined,
    atEnd: false,
    lesson: { id: "why-low-level", title: "Why low level" },
    canGoBack: true,
    onBack: vi.fn(),
    onSkip: vi.fn(),
    canSkip: true,
    onNext: vi.fn(),
    canNext: true,
    nextLabel: "Next",
  };
  const render = (over: Partial<typeof props> | { lectureNumber: null } | { lesson: undefined } = {}) =>
    act(() => root.render(createElement(WorkspaceBar, { ...props, ...over })));
  const link = (text: string) => [...host.querySelectorAll("a")].find((a) => a.textContent?.includes(text));
  const button = (text: string) => [...host.querySelectorAll("button")].find((b) => b.textContent === text)!;

  it("shows where the student is", () => {
    render();
    expect(host.textContent).toContain("Step 3 of 26");
  });
  it("labels the kind of step, for every kind", () => {
    render();
    const chip = host.querySelector(".step-kind");
    expect(chip?.textContent).toBe("Coding exercise");
    expect(chip?.getAttribute("data-kind")).toBe("exercise");
  });
  it("shows no label when no step is open", () => {
    render({ kind: undefined });
    expect(host.querySelector(".step-kind")).toBeNull();
  });
  it("offers only Back once the practice is finished", () => {
    render({ atEnd: true });
    expect(button("Back")).toBeDefined();
    expect(host.querySelectorAll("button")).toHaveLength(1);
  });
  it("links back to the lecture", () => {
    render();
    expect(link("Lecture 1")?.getAttribute("href")).toBe("/#deck");
  });
  it("still links back when the session has no lecture", () => {
    render({ lectureNumber: null });
    expect(link("All lectures")?.getAttribute("href")).toBe("/#deck");
  });
  it("links to the lesson to reread", () => {
    render();
    expect(link("Reread")?.getAttribute("href")).toBe("/topics/why-low-level");
    expect(link("Reread")?.textContent).toContain("Why low level");
  });
  it("leaves the Reread link out when the step has no lesson", () => {
    render({ lesson: undefined });
    expect(link("Reread")).toBeUndefined();
  });
  it("disables Next until the step can be left", () => {
    render({ canNext: false });
    expect(button("Next").disabled).toBe(true);
  });
  it("makes Next primary only when it can be pressed", () => {
    render({ canNext: false });
    expect(button("Next").classList.contains("btn-primary")).toBe(false);
    render({ canNext: true });
    expect(button("Next").disabled).toBe(false);
    expect(button("Next").classList.contains("btn-primary")).toBe(true);
  });
  it("displays the label it is given", () => {
    render({ nextLabel: "Finish" });
    expect(button("Finish")).toBeDefined();
  });
  it("disables Back and Skip when they cannot be used", () => {
    render({ canGoBack: false, canSkip: false });
    expect(button("Back").disabled).toBe(true);
    expect(button("Skip for now").disabled).toBe(true);
  });
  it("calls back for each button", () => {
    const onBack = vi.fn();
    const onSkip = vi.fn();
    const onNext = vi.fn();
    render({ onBack, onSkip, onNext });
    act(() => button("Back").click());
    act(() => button("Skip for now").click());
    act(() => button("Next").click());
    expect([onBack, onSkip, onNext].map((f) => f.mock.calls.length)).toEqual([1, 1, 1]);
  });
});

describe("workspaceShortcut", () => {
  const key = (o: object) => ({ key: "Enter", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...o });
  it("runs on Ctrl or Cmd + Enter", () => {
    expect(workspaceShortcut(key({ ctrlKey: true }))).toBe("run");
    expect(workspaceShortcut(key({ metaKey: true }))).toBe("run");
  });
  it("submits with Shift added", () => {
    expect(workspaceShortcut(key({ ctrlKey: true, shiftKey: true }))).toBe("submit");
  });
  it("ignores plain Enter, Alt, and other keys", () => {
    expect(workspaceShortcut(key({}))).toBeNull();
    expect(workspaceShortcut(key({ ctrlKey: true, altKey: true }))).toBeNull();
    expect(workspaceShortcut(key({ key: "a", ctrlKey: true }))).toBeNull();
  });
});
