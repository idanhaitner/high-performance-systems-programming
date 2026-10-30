"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Mixed } from "@/lib/bidi";
import { formatC } from "@/lib/format";
import { COOLDOWN_MS, GodboltError, compileAsm, runProgram } from "@/lib/godbolt";
import { splitDiagnostics, type AsmLine, type Diagnostic, type RunOutcome } from "@/lib/run-result";
import { clearCode, readCode, writeCode } from "@/lib/session-store";
import { buildTestSource } from "@/lib/test-output";
import { functionVerdict, programVerdict, type ProgramRun, type TestVerdict } from "@/lib/test-verdict";
import type { SessionStep } from "@/lib/types";
import { exerciseZip } from "@/lib/zip";
import { AsmPanel } from "./AsmView";
import { CaseList, OutcomeView, type CaseView } from "./OutcomeView";
import type { RenderedStep } from "./rendered";

const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => <div className="code-editor code-editor-loading">Loading the editor…</div>,
});

type Result =
  | { kind: "outcome"; outcome: RunOutcome; studentLines: number }
  | { kind: "cases"; cases: CaseView[]; outcome: RunOutcome | null; studentLines: number }
  | { kind: "error"; error: GodboltError };

type Action = "run" | "test" | "asm";
type Asm = { lines: AsmLine[]; failed: Diagnostic[] | null; code: string; optimize: boolean };
type Props = { step: Extract<SessionStep, { kind: "exercise" }>; courseId: string; done: boolean; onComplete: () => void; harness: string; rendered: RenderedStep };

const NO_LINE_LIMIT = Number.MAX_SAFE_INTEGER;

export function CodeStep({ step, courseId, done, onComplete, harness, rendered }: Props) {
  const ex = step.exercise;
  const [code, setCode] = useState(() => readCode(courseId, ex.id) ?? ex.starter);
  const [result, setResultState] = useState<Result | null>(null);
  // Counts results, so a new run replaces the result block and fades it in even when the output is the same.
  const [runId, setRunId] = useState(0);
  const setResult = (next: Result) => {
    setResultState(next);
    setRunId((n) => n + 1);
  };
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [busy, setBusy] = useState(false);
  const [cooling, setCooling] = useState(false);
  const [wait, setWait] = useState(0);
  // How many hints are revealed, and whether they are on screen. Closing keeps the count, so reopening does not start over.
  const [hintsShown, setHintsShown] = useState(0);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [lastAction, setLastAction] = useState<Action>("test");
  const [asm, setAsm] = useState<Asm | null>(null);
  const [asmOpen, setAsmOpen] = useState(false);
  const [hoverC, setHoverC] = useState<number | null>(null);
  const [hoverAsm, setHoverAsm] = useState<number | null>(null);

  const codeRef = useRef(code);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coolTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const refocusReset = useRef(false);

  const flush = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      writeCode(courseId, ex.id, codeRef.current);
    }
  }, [courseId, ex.id]);

  useEffect(() => () => {
    flush();
    if (coolTimer.current) clearTimeout(coolTimer.current);
  }, [flush]);

  const edit = useCallback((value: string) => {
    codeRef.current = value;
    setCode(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      writeCode(courseId, ex.id, codeRef.current);
    }, 500);
  }, [courseId, ex.id]);

  const tidy = useCallback(async () => {
    const before = codeRef.current;
    const formatted = await formatC(before);
    // The first format downloads the formatter, so the student may have typed something newer by now.
    if (formatted !== before && codeRef.current === before) edit(formatted);
  }, [edit]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const showOutcome = (outcome: RunOutcome, studentLines: number) => {
    const found = outcome.kind === "compile-error" ? outcome.diagnostics : outcome.kind === "ok" ? outcome.warnings : [];
    setDiagnostics(splitDiagnostics(found, studentLines).inEditor);
  };

  // The prompt replaces the buttons that had focus, so focus moves with it and comes back when it closes.
  useEffect(() => {
    if (confirmReset) keepRef.current?.focus();
    else if (refocusReset.current) resetRef.current?.focus();
    refocusReset.current = false;
  }, [confirmReset]);

  const closeConfirm = () => {
    refocusReset.current = true;
    setConfirmReset(false);
  };

  // These run after tidy, so they read the ref: the `code` in this render is from before the format.
  const doRun = async () => {
    const code = codeRef.current;
    const source = ex.mode === "function" ? buildTestSource(code, harness, ex.test ?? "") : { source: code, studentLines: NO_LINE_LIMIT };
    const first = ex.cases[0];
    const outcome = await runProgram(source.source, ex.mode === "program" && first ? { args: first.args, stdin: first.stdin } : {});
    showOutcome(outcome, source.studentLines);
    setResult({ kind: "outcome", outcome, studentLines: source.studentLines });
  };

  const doTest = async () => {
    const code = codeRef.current;
    let verdict: TestVerdict;
    let studentLines = NO_LINE_LIMIT;
    if (ex.mode === "function") {
      const built = buildTestSource(code, harness, ex.test ?? "");
      studentLines = built.studentLines;
      const outcome = await runProgram(built.source);
      showOutcome(outcome, studentLines);
      verdict = functionVerdict(outcome, ex.caseNames);
    } else {
      const runs: ProgramRun[] = [];
      for (const c of ex.cases) {
        const outcome = await runProgram(code, { args: c.args, stdin: c.stdin });
        runs.push({ name: c.name, expected: c.expected, outcome });
        if (outcome.kind === "compile-error") break;
      }
      verdict = programVerdict(runs);
      const broken = verdict.kind === "outcome" ? verdict.outcome : null;
      showOutcome(broken ?? { kind: "ok", exitCode: 0, stdout: "", stderr: "", truncated: false, warnings: [], fullStdout: "", cutOff: false }, studentLines);
    }
    if (verdict.kind === "outcome") {
      setResult({ kind: "outcome", outcome: verdict.outcome, studentLines });
      return;
    }
    const hints = new Map<string, ReactNode>(
      ex.mode === "function"
        ? Object.entries(rendered.caseHints ?? {})
        : ex.cases.filter((c) => c.hint).map((c) => [c.name, <p key={c.name}>{c.hint}</p>]),
    );
    const cases = verdict.cases.map((c) => ({ ...c, hint: hints.get(c.name) ?? null }));
    setResult({ kind: "cases", cases, outcome: verdict.outcome, studentLines });
    if (verdict.done) onComplete();
  };

  const doAsm = async (opt: boolean) => {
    const code = codeRef.current;
    const { lines, diagnostics: found } = await compileAsm(code, { optimize: opt });
    const errors = found.filter((d) => d.severity === "error");
    setDiagnostics(splitDiagnostics(found, NO_LINE_LIMIT).inEditor);
    setAsm({ lines, failed: errors.length > 0 ? found : null, code, optimize: opt });
  };

  // The level shown on the toggle is the level of the assembly on screen, so a
  // failed fetch leaves both on the old level.
  const shownOptimize = asm?.optimize ?? false;

  const act = async (action: Action, opt = shownOptimize) => {
    if (busy || cooling || wait > 0) return;
    setLastAction(action);
    setBusy(true);
    setConfirmReset(false);
    try {
      await tidy();
      await (action === "run" ? doRun() : action === "test" ? doTest() : doAsm(opt));
    } catch (error) {
      const e = error instanceof GodboltError ? error : new GodboltError("unreachable");
      setResult({ kind: "error", error: e });
      if (e.kind === "rate-limited") setWait(e.retryAfter || 30);
    } finally {
      setBusy(false);
      setCooling(true);
      coolTimer.current = setTimeout(() => setCooling(false), COOLDOWN_MS);
    }
  };

  const download = () => {
    const bytes = exerciseZip(ex, code, harness);
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/zip" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ex.id}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Some browsers start the download after click returns, so free the file later.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const reset = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    clearCode(courseId, ex.id);
    codeRef.current = ex.starter;
    setCode(ex.starter);
    setResultState(null);
    setDiagnostics([]);
    closeConfirm();
  };

  const toggleHints = () => {
    setHintsShown((n) => Math.max(n, 1));
    setHintsOpen((open) => !open);
  };

  const openAsm = () => {
    if (!asmOpen || !asm || asm.code !== code) {
      setAsmOpen(true);
      act("asm");
    } else {
      setAsmOpen(false);
      setHoverAsm(null);
    }
  };

  const pickOptimize = (opt: boolean) => act("asm", opt);

  // Matches openAsm: an open panel with nothing current fetches again instead of closing.
  const asmLabel = !asmOpen ? "Show assembly" : !asm || asm.code !== code ? "Update assembly" : "Hide assembly";

  const linked = useMemo(() => (hoverAsm === null ? [] : [hoverAsm]), [hoverAsm]);
  const hintNodes = rendered.hints ?? [];
  const hintNoun = hintNodes.length > 1 ? "hints" : "hint";
  const hintToggle = hintsOpen ? `Hide ${hintNoun}` : hintsShown > 0 ? `Show ${hintNoun}` : "Show hint";
  const locked = busy || cooling || wait > 0;
  const error = result?.kind === "error" ? result.error : null;

  return (
    <div className="session-step code-step">
      <h2><Mixed text={ex.title} /></h2>
      {rendered.content}
      {rendered.examples}

      <div className={asmOpen ? "code-split has-asm" : "code-split"}>
        <Editor value={code} onChange={edit} diagnostics={diagnostics} onHoverLine={setHoverC} onFormat={tidy} highlightLines={linked} />
        {asmOpen && (
          <AsmPanel
            lines={asm?.lines ?? []}
            activeSourceLine={hoverC ?? hoverAsm}
            onHoverAsm={setHoverAsm}
            optimize={shownOptimize}
            onOptimize={pickOptimize}
            locked={locked}
            stale={asm !== null && asm.code !== code}
            diagnostics={asm?.failed ?? null}
          />
        )}
      </div>

      <div className="code-actions">
        {confirmReset ? (
          <div className="code-confirm" role="alert" onKeyDown={(e) => { if (e.key === "Escape") closeConfirm(); }}>
            <p>Replace your code with the starter code?</p>
            <div className="code-confirm-actions">
              <button type="button" className="btn-quiet" ref={keepRef} onClick={closeConfirm}>Keep my code</button>
              <button type="button" className="btn-danger" onClick={reset}>Yes, reset</button>
            </div>
          </div>
        ) : (
          <>
            {/* Once the step is solved, Next in the bar below is the one primary action. */}
            <button type="button" className={done ? undefined : "btn-primary"} onClick={() => act("test")} disabled={locked}>{busy && lastAction === "test" ? "Testing…" : "Test my code"}</button>
            <button type="button" onClick={() => act("run")} disabled={locked}>{busy && lastAction === "run" ? "Running…" : "Run"}</button>
            <button type="button" className="btn-quiet" title="Shift+Alt+F, or Cmd/Ctrl+S" onClick={tidy}>Format</button>
            <button type="button" className="code-reset btn-quiet" ref={resetRef} onClick={() => setConfirmReset(true)}>Reset to starter</button>
          </>
        )}
      </div>
      <div className="code-foot">
        <p className="code-privacy">Test checks your answer. Run only shows what your code prints. Both send your code to godbolt.org, a website that compiles C.</p>
        <button type="button" className="btn-subtle" aria-expanded={asmOpen} onClick={openAsm} disabled={locked}>{busy && lastAction === "asm" ? "Compiling…" : asmLabel}</button>
      </div>

      <div aria-live="polite">
        <div key={runId} className="code-run">
          {error && (
            <div className="code-result" data-state="bad">
              <p className="code-headline">{error.message}</p>
              <div className="code-actions">
                <button type="button" onClick={() => act(lastAction)} disabled={locked}>{wait > 0 ? `Retry in ${wait}s` : "Retry"}</button>
                <button type="button" className="session-download" onClick={download}>Download to run in VS Code</button>
              </div>
            </div>
          )}
          {result?.kind === "outcome" && <OutcomeView outcome={result.outcome} studentLines={result.studentLines} />}
          {result?.kind === "cases" && (
            <>
              {result.outcome && <OutcomeView outcome={result.outcome} studentLines={result.studentLines} />}
              <CaseList cases={result.cases} />
            </>
          )}
        </div>
      </div>

      <div className="code-help">
        {/* The toggles stay put when a panel opens, so the same spot closes it again. */}
        <div className="code-help-bar">
          <p className="code-help-label">Stuck?</p>
          {hintNodes.length > 0 && (
            <button type="button" className="btn-help" aria-expanded={hintsOpen} onClick={toggleHints}>{hintToggle}</button>
          )}
          <button type="button" className="btn-quiet" aria-expanded={solutionOpen} onClick={() => setSolutionOpen((open) => !open)}>
            {solutionOpen ? "Hide solution" : "Show solution"}
          </button>
        </div>
        {hintsOpen && (
          <div className="code-hints">
            {hintNodes.slice(0, hintsShown).map((hint, i) => (
              <div key={i} className="code-hint">
                <p className="code-label">Hint {i + 1} of {hintNodes.length}</p>
                {hint}
              </div>
            ))}
            {hintsShown < hintNodes.length && (
              <button type="button" className="btn-help" onClick={() => setHintsShown((n) => n + 1)}>Next hint ({hintsShown + 1} of {hintNodes.length})</button>
            )}
          </div>
        )}
        {solutionOpen && (
          <div className="code-solution">
            <p className="code-label">Solution (read only)</p>
            <Editor value={ex.solution} onChange={() => {}} diagnostics={[]} readOnly />
          </div>
        )}
      </div>
    </div>
  );
}
