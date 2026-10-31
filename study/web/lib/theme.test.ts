// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { chooseTheme, isDark, resolveTheme, THEME_KEY, themeScript, watchTheme } from "./theme";

function runScript(stored: string | null, systemDark: boolean, blocked = false) {
  const documentElement = { dataset: {} as Record<string, string> };
  const localStorage = {
    getItem(key: string) {
      if (blocked) throw new Error("blocked");
      return key === THEME_KEY ? stored : null;
    },
  };
  new Function("localStorage", "matchMedia", "document", themeScript)(localStorage, () => ({ matches: systemDark }), { documentElement });
  return documentElement.dataset.theme;
}

describe("resolveTheme", () => {
  it("follows the device until the student chooses", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("lets the student's choice win over the device", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("ignores a stored value it does not know", () => {
    expect(resolveTheme("purple", false)).toBe("light");
  });
});

describe("themeScript", () => {
  it("decides the same way as resolveTheme", () => {
    for (const stored of [null, "light", "dark", "purple"]) {
      for (const systemDark of [true, false]) {
        expect(runScript(stored, systemDark)).toBe(resolveTheme(stored, systemDark));
      }
    }
  });

  it("still sets a theme when storage is blocked", () => {
    expect(runScript("light", true, true)).toBe("dark");
  });
});

describe("watchTheme", () => {
  function fakeSystem() {
    const listeners = new Set<() => void>();
    const system = {
      matches: false,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
      flip(matches: boolean) {
        system.matches = matches;
        listeners.forEach((listener) => listener());
      },
      listeners,
    };
    vi.stubGlobal("matchMedia", () => system);
    return system;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("follows the device while the student has not chosen", () => {
    const system = fakeSystem();
    const stop = watchTheme(() => {});
    system.flip(true);
    expect(isDark()).toBe(true);
    system.flip(false);
    expect(isDark()).toBe(false);
    stop();
  });

  it("stops following the device once the student chooses", () => {
    const system = fakeSystem();
    const stop = watchTheme(() => {});
    chooseTheme("light");
    system.flip(true);
    expect(isDark()).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
    stop();
  });

  it("picks up a choice made in another tab", () => {
    fakeSystem();
    const stop = watchTheme(() => {});
    localStorage.setItem(THEME_KEY, "dark");
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY }));
    expect(isDark()).toBe(true);
    stop();
  });

  it("removes its listeners when it stops", () => {
    const system = fakeSystem();
    watchTheme(() => {})();
    expect(system.listeners.size).toBe(0);
  });
});
