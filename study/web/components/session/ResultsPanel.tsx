"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

type Tab = "output" | "assembly";

type Props = {
  tab: Tab;
  onTab(tab: Tab): void;
  output: ReactNode;
  assembly: ReactNode;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "output", label: "Output" },
  { id: "assembly", label: "Assembly" },
];

export function ResultsPanel({ tab, onTab, output, assembly }: Props) {
  const buttons = useRef<Record<Tab, HTMLButtonElement | null>>({ output: null, assembly: null });

  const move = (e: KeyboardEvent, from: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    e.preventDefault();
    const next = TABS[(from + step + TABS.length) % TABS.length].id;
    onTab(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className="results-panel">
      <div className="results-tabs" role="tablist" aria-label="Results">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { buttons.current[t.id] = el; }}
            type="button"
            role="tab"
            id={`results-tab-${t.id}`}
            className="results-tab"
            aria-selected={tab === t.id}
            aria-controls={`results-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => onTab(t.id)}
            onKeyDown={(e) => move(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Both panels stay mounted, so the live region is already in place when a result arrives. */}
      <div role="tabpanel" id="results-panel-output" aria-labelledby="results-tab-output" aria-live="polite" className="results-body" hidden={tab !== "output"}>
        {output}
      </div>
      <div role="tabpanel" id="results-panel-assembly" aria-labelledby="results-tab-assembly" className="results-body" hidden={tab !== "assembly"}>
        {assembly}
      </div>
    </div>
  );
}
