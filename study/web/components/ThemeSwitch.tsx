"use client";

import { useSyncExternalStore } from "react";
import { chooseTheme, isDark, watchTheme } from "@/lib/theme";

export function ThemeSwitch() {
  const dark = useSyncExternalStore(watchTheme, isDark, () => false);
  return (
    <button
      type="button"
      className="theme-switch"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => chooseTheme(isDark() ? "light" : "dark")}
    >
      {/* Both icons are always there and CSS picks one, so the right one shows before the page's script runs. */}
      <svg className="theme-icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
      <svg className="theme-icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
