// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AsmPanel } from "@/components/session/AsmView";

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

describe("assembly panel", () => {
  it("keeps focus in the panel when Update is pressed, since the button goes away", () => {
    const onUpdate = vi.fn();
    act(() => {
      root.render(createElement(AsmPanel, { lines: [], activeSourceLine: null, onHoverAsm: () => {}, optimize: false, onOptimize: () => {}, onUpdate, locked: false, stale: true, diagnostics: null }));
    });
    const update = [...host.querySelectorAll("button")].find((b) => b.textContent === "Update")!;
    update.focus();
    act(() => update.click());
    expect(onUpdate).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(host.querySelector(".asm-panel"));
  });
});
