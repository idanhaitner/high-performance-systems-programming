"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

// When the student moves to another page, the new page fades up into place (globals.css .page-enter).
// The first page load does not animate.
export function PageEnter({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const first = useRef(path);
  const moved = useRef(false);
  if (path !== first.current) moved.current = true;

  return (
    <div key={path} className={moved.current ? "page-enter" : undefined}>
      {children}
    </div>
  );
}
