"use client";

import { useState, type ReactNode } from "react";
import { Mixed } from "@/lib/bidi";
import type { SessionStep } from "@/lib/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function LabStep({ step, content, done, onComplete }: { step: Extract<SessionStep, { kind: "lab" }>; content: ReactNode; done: boolean; onComplete: () => void }) {
  const [finished, setFinished] = useState(done);
  const zip = step.lab.zip.startsWith("/") ? step.lab.zip : `/${step.lab.zip}`;
  return (
    <div className="session-step reading-step">
      <h2><Mixed text={step.lab.title} /></h2>
      {content}
      <p>
        <a className="session-download" href={`${basePath}${zip}`} download>Download the lab files (.zip)</a>
      </p>
      <label className="session-confirm">
        <input
          type="checkbox"
          checked={finished}
          disabled={done}
          onChange={(event) => {
            setFinished(event.target.checked);
            if (event.target.checked) onComplete();
          }}
        />
        I finished this lab in VS Code
      </label>
    </div>
  );
}
