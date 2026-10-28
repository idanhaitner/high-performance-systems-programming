"use client";

import { useEffect, useRef } from "react";

// A thin bar across the top that grows with how far the page is scrolled.
// It writes the transform directly, at most once per frame, so scrolling never re-renders React.
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const place = () => {
      frame = 0;
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div className="reading-progress" ref={bar} style={{ transform: "scaleX(0)" }} />;
}
