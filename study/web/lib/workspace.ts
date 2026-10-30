import { useLayoutEffect } from "react";

// Marks the page as a full-window workspace (app/workspace.css). A layout effect,
// so the sidebar and the page scroll are gone before the first paint of the step.
export function useWorkspaceMode(active: boolean): void {
  useLayoutEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.dataset.workspace = "";
    return () => {
      delete root.dataset.workspace;
    };
  }, [active]);
}

// Ctrl or Cmd + Enter runs, and adding Shift submits. Alt is left alone, since it belongs to the browser and the OS.
export function workspaceShortcut(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">): "run" | "submit" | null {
  if (event.key !== "Enter" || event.altKey || !(event.ctrlKey || event.metaKey)) return null;
  return event.shiftKey ? "submit" : "run";
}
