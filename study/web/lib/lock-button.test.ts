// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LockButton } from "@/components/session/LockButton";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLElement;
let root: Root;

const button = () => host.querySelector("button") as HTMLButtonElement;
const render = (locked: boolean, onClick = vi.fn()) => {
  act(() => root.render(createElement(LockButton, { locked, onClick }, "Run")));
  return onClick;
};

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("LockButton", () => {
  it("keeps keyboard focus when it locks", () => {
    render(false);
    button().focus();
    render(true);
    expect(document.activeElement).toBe(button());
    expect(button().disabled).toBe(false);
    expect(button().getAttribute("aria-disabled")).toBe("true");
  });

  it("ignores presses while locked", () => {
    const onClick = render(true);
    act(() => button().click());
    expect(onClick).not.toHaveBeenCalled();
  });

  it("works normally when unlocked", () => {
    const onClick = render(false);
    act(() => button().click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(button().hasAttribute("aria-disabled")).toBe(false);
  });
});
