"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Blocks } from "@/components/Blocks";
import { Mixed } from "@/lib/bidi";
import { COOLDOWN_MS, GodboltError, compileAsm, runProgram } from "@/lib/godbolt";
import { splitDiagnostics, type AsmLine, type Diagnostic, type RunOutcome } from "@/lib/run-result";
import { clearCode, readCode, readFails, writeCode, writeFails } from "@/lib/session-store";
import { buildTestSource, outputsMatch, parseTestOutput } from "@/lib/test-output";
import type { SessionStep } from "@/lib/types";
import { exerciseZip } from "@/lib/zip";
import { AsmPanel } from "./AsmView";
import { CaseList, OutcomeView, type CaseView } from "./OutcomeView";

const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => <div className="code-editor code-editor-loading">Loading the editor…</div>,
});

type Result =
  | { kind: "outcome"; outcome: RunOutcome; studentLines: number }
  | { kind: "cases"; cases: CaseView[]; outcome: RunOutcome | null; studentLines: number }
  | { kind: "error"; error: GodboltError };

type Action = "run" | "test" | "asm";
type Asm = { lines: AsmLine[]; failed: Diagnostic[] | null; code: string };
type Props = { step: Extract<SessionStep, { kind: "exercise" }>; courseId: string; onComplete: () => void; harness: string };

const NO_LINE_LIMIT = Number.MAX_SAFE_INTEGER;

export function CodeStep({ step, courseId, onComplete, harness }: Props) {
  const ex = step.exercise;
  const [code, setCode] = useState(() => readCode(courseId, ex.id) ?? ex.starter);
  const [result, setResult] = useState<Result | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [busy, setBusy] = useState(false);
  const [cooling, setCooling] = useState(false);
  const [wait, setWait] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [fails, setFails] = useState(() => readFails(courseId, ex.id));
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [lastAction, setLastAction] = useState<Action>("test");
  const [asm, setAsm] = useState<Asm | null>(null);
  const [asmOpen, setAsmOpen] = useState(false);
  const [optimize, setOptimize] = useState(false);
  const [hoverC, setHoverC] = useState<number | null>(null);
  const [hoverAsm, setHoverAsm] = useState<number | null>(null);

  const codeRef = useRef(code);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coolTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsRef = useRef(fails);
  failsRef.current = fails;

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

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const showOutcome = (outcome: RunOutcome, studentLines: number) => {
    const found = outcome.kind === "compile-error" ? outcome.diagnostics : outcome.kind === "ok" ? outcome.warnings : [];
    setDiagnostics(splitDiagnostics(found, studentLines).inEditor);
  };

  const failRun = () => {
    const n = failsRef.current + 1;
    failsRef.current = n;
    setFails(n);
    writeFails(courseId, ex.id, n);
  };

  const doRun = async () => {
    const source = ex.mode === "function" ? buildTestSource(code, harness, ex.test ?? "") : { source: code, studentLines: NO_LINE_LIMIT };
    const first = ex.cases[0];
    const outcome = await runProgram(source.source, ex.mode === "program" && first ? { args: first.args, stdin: first.stdin } : {});
    showOutcome(outcome, source.studentLines);
    setResult({ kind: "outcome", outcome, studentLines: source.studentLines });
  };

  const doTest = async () => {
    let cases: CaseView[];
    let outcome: RunOutcome | null = null;
    let studentLines = NO_LINE_LIMIT;
    if (ex.mode === "function") {
      const built = buildTestSource(code, harness, ex.test ?? "");
      studentLines = built.studentLines;
      outcome = await runProgram(built.source);
      showOutcome(outcome, studentLines);
      const stdout = outcome.kind === "compile-error" ? "" : outcome.stdout;
      cases = parseTestOutput(stdout, ex.caseNames).map((c) => ({ ...c, hint: ex.caseHints[c.name] ?? null }));
      if (outcome.kind === "compile-error") {
        setResult({ kind: "outcome", outcome, studentLines });
        failRun();
        return;
      }
      if (outcome.kind === "ok" && cases.every((c) => c.status === "pass")) outcome = null;
    } else {
      cases = [];
      for (const c of ex.cases) {
        const o = await runProgram(code, { args: c.args, stdin: c.stdin });
        if (o.kind === "compile-error") {
          showOutcome(o, studentLines);
          setResult({ kind: "outcome", outcome: o, studentLines });
          failRun();
          return;
        }
        const hint = c.hint ? [{ type: "paragraph" as const, text: c.hint }] : null;
        if (o.kind === "ok" && outputsMatch(o.stdout, c.expected)) cases.push({ name: c.name, status: "pass", message: "", hint });
        else if (o.kind === "ok") cases.push({ name: c.name, status: "fail", message: `Expected:\n${c.expected}\nYour program printed:\n${o.stdout}`, hint });
        else if (o.kind === "timeout") cases.push({ name: c.name, status: "fail", message: "Your program ran too long. Is there a loop that never stops?", hint });
        else cases.push({ name: c.name, status: "fail", message: `${o.name}. ${o.explanation}`, hint });
      }
      showOutcome({ kind: "ok", exitCode: 0, stdout: "", stderr: "", truncated: false, warnings: [] }, studentLines);
    }
    setResult({ kind: "cases", cases, outcome: outcome && outcome.kind !== "ok" ? outcome : null, studentLines });
    if (cases.length > 0 && cases.every((c) => c.status === "pass")) onComplete();
    else failRun();
  };

  const doAsm = async (opt: boolean) => {
    const { lines, diagnostics: found } = await compileAsm(code, { optimize: opt });
    const errors = found.filter((d) => d.severity === "error");
    setDiagnostics(splitDiagnostics(found, NO_LINE_LIMIT).inEditor);
    setAsm({ lines, failed: errors.length > 0 ? found : null, code });
  };

  const act = async (action: Action, opt = optimize) => {
    if (busy || cooling || wait > 0) return;
    setLastAction(action);
    setBusy(true);
    setConfirmReset(false);
    try {
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
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    clearCode(courseId, ex.id);
    codeRef.current = ex.starter;
    setCode(ex.starter);
    setResult(null);
    setDiagnostics([]);
    setConfirmReset(false);
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

  const pickOptimize = (opt: boolean) => {
    setOptimize(opt);
    act("asm", opt);
  };

  const linked = useMemo(() => (hoverAsm === null ? [] : [hoverAsm]), [hoverAsm]);
  const locked = busy || cooling || wait > 0;
  const error = result?.kind === "error" ? result.error : null;

  return (
    <div className="session-step code-step">
      <p className="kicker">Coding exercise</p>
      <h2><Mixed text={ex.title} /></h2>
      <Blocks blocks={ex.statement} courseId={courseId} />

      <div className={asmOpen ? "code-split has-asm" : "code-split"}>
        <Editor value={code} onChange={edit} diagnostics={diagnostics} onHoverLine={setHoverC} highlightLines={linked} />
        {asmOpen && (
          <AsmPanel
            lines={asm?.lines ?? []}
            activeSourceLine={hoverC ?? hoverAsm}
            onHoverAsm={setHoverAsm}
            optimize={optimize}
            onOptimize={pickOptimize}
            locked={locked}
            stale={asm !== null && asm.code !== code}
            diagnostics={asm?.failed ?? null}
          />
        )}
      </div>
      <p className="code-privacy">Runs on godbolt.org — your code is sent there to compile.</p>

      <div className="code-actions">
        <button type="button" onClick={() => act("run")} disabled={locked}>{busy && lastAction === "run" ? "Running…" : "Run"}</button>
        <button type="button" className="is-on" onClick={() => act("test")} disabled={locked}>{busy && lastAction === "test" ? "Testing…" : "Test"}</button>
        <button type="button" aria-pressed={asmOpen} onClick={openAsm} disabled={locked && !asmOpen}>{busy && lastAction === "asm" ? "Compiling…" : "Assembly"}</button>
        {confirmReset ? (
          <span className="code-confirm" role="alert">
            Replace your code with the starter code?
            <button type="button" onClick={reset}>Yes, reset</button>
            <button type="button" onClick={() => setConfirmReset(false)}>Cancel</button>
          </span>
        ) : (
          <button type="button" className="session-skip" onClick={() => setConfirmReset(true)}>Reset to starter</button>
        )}
      </div>

      <div aria-live="polite">
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
            <CaseList cases={result.cases} courseId={courseId} />
          </>
        )}
      </div>

      {ex.hints.length > 0 && (
        <div className="code-hints">
          {ex.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="code-hint">
              <p className="code-label">Hint {i + 1}</p>
              <Blocks blocks={hint} courseId={courseId} />
            </div>
          ))}
          {hintsShown < ex.hints.length && (
            <button type="button" onClick={() => setHintsShown((n) => n + 1)}>Show a hint</button>
          )}
        </div>
      )}

      {fails >= 2 && (
        <div className="code-solution">
          {solutionOpen ? (
            <>
              <p className="code-label">Solution (read only)</p>
              <Editor value={ex.solution} onChange={() => {}} diagnostics={[]} readOnly />
            </>
          ) : (
            <button type="button" onClick={() => setSolutionOpen(true)}>Show solution</button>
          )}
        </div>
      )}
    </div>
  );
}
