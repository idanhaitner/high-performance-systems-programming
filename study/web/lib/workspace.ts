import { useLayoutEffect, useSyncExternalStore } from "react";

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

// The same sizes as the small layout in app/workspace.css, where the question and the code take turns behind tabs.
const TAB_LAYOUT = "(max-width: 767px), (max-height: 499px)";

export function useTabLayout(): boolean {
  return useSyncExternalStore(
    (changed) => {
      const query = window.matchMedia(TAB_LAYOUT);
      query.addEventListener("change", changed);
      return () => query.removeEventListener("change", changed);
    },
    () => window.matchMedia(TAB_LAYOUT).matches,
    () => false,
  );
}

// Ctrl or Cmd + Enter runs, and adding Shift submits. Alt is left alone, since it belongs to the browser and the OS.
export function workspaceShortcut(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">): "run" | "submit" | null {
  if (event.key !== "Enter" || event.altKey || !(event.ctrlKey || event.metaKey)) return null;
  return event.shiftKey ? "submit" : "run";
}
