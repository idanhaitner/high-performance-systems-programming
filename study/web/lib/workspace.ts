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
