"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Moving to another page of the site runs as a view transition (globals.css ::view-transition-*): the old page
// lifts away and the new one rises in, and the title of the lesson card you clicked flies into the new page's
// heading. Browsers without view transitions, and reduced motion, keep the plain page-enter fade (PageEnter.tsx).
export function ViewTransitions() {
  const router = useRouter();
  const path = usePathname();
  const arrived = useRef<(() => void) | null>(null);

  // The new page has rendered, so the transition can take its picture of it.
  useEffect(() => {
    arrived.current?.();
    arrived.current = null;
  }, [path]);

  useEffect(() => {
    if (!document.startViewTransition || !matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      // Other sites, and links within this page, behave as usual.
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (basePath && !url.pathname.startsWith(basePath)) return;

      event.preventDefault();
      const href = url.pathname.slice(basePath.length) + url.search + url.hash;
      // The clicked card's title becomes the shared element that flies into the next page's heading.
      const title = link.querySelector<HTMLElement>("[data-vt-title]");
      if (title) {
        // Only one element per page may carry a name, so the current lesson heading steps aside.
        document.querySelectorAll<HTMLElement>(".masthead h1").forEach((heading) => (heading.style.viewTransitionName = "none"));
        title.style.viewTransitionName = "lesson-title";
      }
      const root = document.documentElement;
      root.dataset.vt = "on";

      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            arrived.current = resolve;
            // If the page never arrives, do not hold the screen frozen.
            setTimeout(resolve, 1500);
            router.push(href);
          }),
      );
      transition.finished.finally(() => {
        delete root.dataset.vt;
        if (title) title.style.viewTransitionName = "";
      });
    };

    // Capture phase, so this runs before Next's own link handler, which then sees the event is handled.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
