export type Theme = "light" | "dark";

export const THEME_KEY = "study:theme";
const SYSTEM_DARK = "(prefers-color-scheme: dark)";

// The student's own choice wins. Until they make one, the page follows their device.
export function resolveTheme(stored: string | null, systemDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return systemDark ? "dark" : "light";
}

// Runs in <head> before the first paint, so a dark page never flashes white. It repeats resolveTheme because it cannot import.
export const themeScript = `(function(){var t=null;try{t=localStorage.getItem(${JSON.stringify(THEME_KEY)})}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia(${JSON.stringify(SYSTEM_DARK)}).matches?"dark":"light";document.documentElement.dataset.theme=t})()`;

function readStored(): string | null {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export function isDark(): boolean {
  return document.documentElement.dataset.theme === "dark";
}

export function chooseTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage can be blocked or full; the choice just lasts until the page reloads.
  }
}

// Calls back when the theme changes for any reason: a switch, another tab, or the device's own setting.
export function watchTheme(onChange: () => void): () => void {
  const root = document.documentElement;
  const system = matchMedia(SYSTEM_DARK);
  const sync = () => {
    root.dataset.theme = resolveTheme(readStored(), system.matches);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_KEY) sync();
  };
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  system.addEventListener("change", sync);
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    system.removeEventListener("change", sync);
    window.removeEventListener("storage", onStorage);
  };
}
