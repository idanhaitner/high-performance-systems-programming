import { useSyncExternalStore } from "react";

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

// Ctrl or Cmd + Enter runs, and adding Shift submits. Ctrl or Cmd + S saves, which compiles.
// Alt is left alone, since it belongs to the browser and the OS.
export function workspaceShortcut(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">): "run" | "submit" | "save" | null {
  if (event.altKey || !(event.ctrlKey || event.metaKey)) return null;
  if (event.key.toLowerCase() === "s") return event.shiftKey ? null : "save";
  if (event.key !== "Enter") return null;
  return event.shiftKey ? "submit" : "run";
}
