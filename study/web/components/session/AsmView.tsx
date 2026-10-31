"use client";

import { useRef } from "react";
import type { AsmLine, Diagnostic } from "@/lib/run-result";
import { LockButton } from "./LockButton";

type ViewProps = {
  lines: AsmLine[];
  activeSourceLine: number | null;
  onHoverAsm(sourceLine: number | null): void;
};

export function AsmView({ lines, activeSourceLine, onHoverAsm }: ViewProps) {
  return (
    <pre className="asm-lines" aria-label="Assembly code" tabIndex={0} onMouseLeave={() => onHoverAsm(null)}>
      {lines.map((l, i) => (
        <span
          key={i}
          className={`asm-line${l.sourceLine === null ? " asm-label" : ""}${l.sourceLine !== null && l.sourceLine === activeSourceLine ? " is-linked" : ""}`}
          onMouseEnter={() => onHoverAsm(l.sourceLine)}
        >
          {l.text === "" ? " " : l.text}
        </span>
      ))}
    </pre>
  );
}

type PanelProps = ViewProps & {
  optimize: boolean;
  onOptimize(optimize: boolean): void;
  onUpdate(): void;
  locked: boolean;
  stale: boolean;
  diagnostics: Diagnostic[] | null;
};

export function AsmPanel({ optimize, onOptimize, onUpdate, locked, stale, diagnostics, ...view }: PanelProps) {
  const panel = useRef<HTMLElement>(null);

  // Update turns off during the compile and then goes away, so focus waits in the panel.
  const update = () => {
    panel.current?.focus();
    onUpdate();
  };

  return (
    <aside ref={panel} tabIndex={-1} className="asm-panel" aria-label="Assembly">
      <p className="asm-intro">This is the machine code your C turns into. Point at a line of C with the mouse, or move the typing cursor to it, to light up the instructions it became.</p>
      <div className="asm-toggle" role="group" aria-label="Optimization level">
        <LockButton locked={locked} aria-pressed={!optimize} onClick={() => onOptimize(false)}>-O0</LockButton>
        <LockButton locked={locked} aria-pressed={optimize} onClick={() => onOptimize(true)}>-O2</LockButton>
        <span className="asm-hint">{optimize ? "-O2 asks the compiler to make the code faster." : "-O0 keeps the code close to what you wrote."}</span>
      </div>
      {stale && (
        <p className="asm-stale" role="status">
          Your code changed. <button type="button" disabled={locked} onClick={update}>Update</button>
        </p>
      )}
      {diagnostics ? (
        <div className="asm-failed">
          <p className="code-headline">Your code did not compile, so there is no assembly to show.</p>
          <ul className="code-diags">
            {diagnostics.map((d, i) => (
              <li key={i}><strong>Line {d.line}</strong> ({d.severity}): {d.text}</li>
            ))}
          </ul>
        </div>
      ) : (
        <AsmView {...view} />
      )}
    </aside>
  );
}
