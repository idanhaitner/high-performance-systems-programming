import type { ComponentProps } from "react";

// A real disabled button drops keyboard focus to the page, so one that locks during a run only looks and acts disabled.
export function LockButton({ locked, onClick, ...props }: ComponentProps<"button"> & { locked: boolean }) {
  return <button type="button" {...props} aria-disabled={locked || undefined} onClick={locked ? undefined : onClick} />;
}
