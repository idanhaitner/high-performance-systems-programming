// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CheckCard } from "@/components/CheckCard";
import { CheckStep } from "@/components/session/CheckStep";
import type { SessionStep } from "./types";

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

const card = createElement(CheckCard, {
  id: "q1",
  question: "What is 1 + 1?",
  choices: [{ correct: true, text: "Two" }, { correct: false, text: "Three" }],
  why: "One and one make two.",
});
const step = { kind: "check", id: "q1" } as unknown as Extract<SessionStep, { kind: "check" }>;
const renderStep = (onComplete = () => {}, moved = false, done = false) =>
  act(() => root.render(createElement(CheckStep, { step, content: card, done, onComplete, courseId: "c", title: "Question 2 of 8", moved })));
const panes = () => [...host.querySelectorAll(".split-pane")];
const check = () => [...host.querySelectorAll("button")].find((b) => b.textContent === "Check")!;
const pick = (text: string) => act(() => [...host.querySelectorAll("label")].find((l) => l.textContent?.includes(text))!.querySelector("input")!.click());

describe("a check in a practice step", () => {
  it("puts the question on the left and the answers on the right", () => {
    renderStep();
    expect(panes()).toHaveLength(2);
    expect(panes()[0].textContent).toContain("What is 1 + 1?");
    expect(panes()[0].textContent).not.toContain("Two");
    expect(panes()[1].textContent).toContain("Two");
  });
  it("titles the question panel like a coding exercise", () => {
    renderStep();
    expect(panes()[0].querySelector(".question-panel .question-title")?.textContent).toBe("Question 2 of 8");
  });
  it("puts Check under the choices and the result under Check, inside the form so it still submits", () => {
    renderStep();
    pick("Two");
    act(() => check().click());
    const choices = panes()[1].querySelector(".choices")!;
    const result = panes()[1].querySelector(".check-result")!;
    const follows = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(choices, check())).toBe(true);
    expect(follows(check(), result)).toBe(true);
    expect(check().closest(".workspace-actions")).toBeNull();
    expect(check().closest("form")).not.toBeNull();
  });
  it("makes Check the one primary action until the answer is right", () => {
    renderStep();
    expect(check().classList.contains("btn-primary")).toBe(true);
    pick("Two");
    act(() => check().click());
    expect(check().classList.contains("btn-primary")).toBe(false);
  });
  it("leaves Next as the one primary action when coming back to a solved step", () => {
    renderStep(() => {}, false, true);
    expect(check().classList.contains("btn-primary")).toBe(false);
  });
  it("shows the explanation with the answers and completes the step", () => {
    const onComplete = vi.fn();
    renderStep(onComplete);
    pick("Two");
    act(() => check().click());
    expect(panes()[1].textContent).toContain("One and one make two.");
    expect(onComplete).toHaveBeenCalled();
  });
  it("moves focus to the title only after the student moved to this step", () => {
    renderStep();
    expect(document.activeElement).toBe(document.body);
    act(() => root.unmount());
    root = createRoot(host);
    renderStep(() => {}, true);
    expect(document.activeElement?.textContent).toBe("Question 2 of 8");
  });
});

describe("a check in a lesson", () => {
  it("stays one card with no panels", () => {
    act(() => root.render(card));
    expect(panes()).toHaveLength(0);
    expect(host.querySelector(".card.check .actions button")?.textContent).toBe("Check");
    expect(check().classList.contains("btn-primary")).toBe(false);
  });
});
