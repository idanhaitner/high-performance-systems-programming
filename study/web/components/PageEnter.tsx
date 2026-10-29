"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

// When the student moves to another page, the new page fades up into place (globals.css .page-enter).
// The first page load does not animate, and neither does a change that a view transition already animates.
export function PageEnter({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const first = useRef(path);
  const moved = useRef(false);
  if (path !== first.current) moved.current = true;
  // A view transition (ViewTransitions.tsx) already animates the change, so the fallback fade stays off.
  const animate = moved.current && !(typeof document !== "undefined" && document.documentElement.dataset.vt);

  return (
    <div key={path} className={animate ? "page-enter" : undefined}>
      {children}
    </div>
  );
}
