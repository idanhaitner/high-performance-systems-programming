"use client";

import type { AsmLine, Diagnostic } from "@/lib/run-result";

type ViewProps = {
  lines: AsmLine[];
  activeSourceLine: number | null;
  onHoverAsm(sourceLine: number | null): void;
};

export function AsmView({ lines, activeSourceLine, onHoverAsm }: ViewProps) {
  return (
    <pre className="asm-lines" aria-label="Assembly code" onMouseLeave={() => onHoverAsm(null)}>
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
  locked: boolean;
  stale: boolean;
  diagnostics: Diagnostic[] | null;
};

export function AsmPanel({ optimize, onOptimize, locked, stale, diagnostics, ...view }: PanelProps) {
  return (
    <aside className="asm-panel" aria-label="Assembly">
      <p className="asm-intro">This is the machine code your C turns into. Hover a line of C to see its instructions.</p>
      <div className="asm-toggle" role="group" aria-label="Optimization level">
        <button type="button" aria-pressed={!optimize} disabled={locked} onClick={() => onOptimize(false)}>-O0</button>
        <button type="button" aria-pressed={optimize} disabled={locked} onClick={() => onOptimize(true)}>-O2</button>
        <span className="asm-hint">{optimize ? "-O2 asks the compiler to make the code faster." : "-O0 keeps the code close to what you wrote."}</span>
      </div>
      {stale && <p className="asm-stale" role="status">Your code changed. Press Assembly again to update.</p>}
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
