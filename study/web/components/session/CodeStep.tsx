"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { formatC } from "@/lib/format";
import { COOLDOWN_MS, GodboltError, compileAsm, runProgram } from "@/lib/godbolt";
import { splitDiagnostics, type AsmLine, type Diagnostic, type RunOutcome } from "@/lib/run-result";
import { clearCode, readCode, writeCode } from "@/lib/session-store";
import { buildTestSource } from "@/lib/test-output";
import { functionVerdict, programVerdict, type ProgramRun, type TestVerdict } from "@/lib/test-verdict";
import type { SessionStep } from "@/lib/types";
import { useTabLayout, workspaceShortcut } from "@/lib/workspace";
import { exerciseZip } from "@/lib/zip";
import { AsmPanel } from "./AsmView";
import { CaseList, OutcomeView, type CaseView } from "./OutcomeView";
import { QuestionPanel } from "./QuestionPanel";
import type { RenderedStep } from "./rendered";
import { ResultsPanel } from "./ResultsPanel";
import { Split } from "./Split";

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
type Tab = "output" | "assembly";
type View = "question" | "code";
type Props = { step: Extract<SessionStep, { kind: "exercise" }>; courseId: string; done: boolean; onComplete: () => void; harness: string; rendered: RenderedStep; moved: boolean };

const NO_LINE_LIMIT = Number.MAX_SAFE_INTEGER;
const VIEWS: { id: View; label: string }[] = [
  { id: "question", label: "Question" },
  { id: "code", label: "Code" },
];

export function CodeStep({ step, courseId, done, onComplete, harness, rendered, moved }: Props) {
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
  const [confirmReset, setConfirmReset] = useState(false);
  const [lastAction, setLastAction] = useState<Action>("test");
  const [asm, setAsm] = useState<Asm | null>(null);
  const [asmWanted, setAsmWanted] = useState(false);
  const [tab, setTab] = useState<Tab>("output");
  // Which side shows in the tab layout. It only changes an attribute, so the editor is never unmounted and keeps its cursor and undo.
  const [view, setView] = useState<View>("question");
  const [hoverC, setHoverC] = useState<number | null>(null);
  const [hoverAsm, setHoverAsm] = useState<number | null>(null);

  const tabbed = useTabLayout();

  const codeRef = useRef(code);
  const viewTabs = useRef<Record<View, HTMLButtonElement | null>>({ question: null, code: null });
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

  // Reloading or closing the tab does not unmount anything, so it needs its own save.
  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
      if (coolTimer.current) clearTimeout(coolTimer.current);
    };
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
    // A retry worked, so its failure message no longer applies.
    setResultState((r) => (r?.kind === "error" ? null : r));
  };

  // The level shown on the toggle is the level of the assembly on screen, so a
  // failed fetch leaves both on the old level.
  const shownOptimize = asm?.optimize ?? false;

  const locked = busy || cooling || wait > 0;

  const act = async (action: Action, opt = shownOptimize) => {
    if (locked) return;
    setLastAction(action);
    setBusy(true);
    setConfirmReset(false);
    if (action !== "asm") {
      setTab("output");
      setView("code");
      // Hiding the question would drop focus to the page.
      if (tabbed && document.getElementById("workspace-question")?.contains(document.activeElement)) viewTabs.current.code?.focus();
    }
    try {
      await tidy();
      await (action === "run" ? doRun() : action === "test" ? doTest() : doAsm(opt));
    } catch (error) {
      const e = error instanceof GodboltError ? error : new GodboltError("unreachable");
      setResult({ kind: "error", error: e });
      setTab("output");
      setAsmWanted(false);
      if (e.kind === "rate-limited") setWait(e.retryAfter || 30);
    } finally {
      setBusy(false);
      setCooling(true);
      coolTimer.current = setTimeout(() => setCooling(false), COOLDOWN_MS);
    }
  };

  // The Assembly tab can open during a run or the cooldown, when act would do nothing, so the compile waits for them to end.
  useEffect(() => {
    if (!asmWanted || locked) return;
    setAsmWanted(false);
    if (!asm || asm.code !== code) act("asm");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asmWanted, locked]);

  // Capture phase, so this runs before CodeMirror's own Mod-Enter, which would add a blank line.
  // The listener is re-attached each render so it always calls the current act.
  useEffect(() => {
    if (confirmReset) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const shortcut = workspaceShortcut(e);
      if (!shortcut) return;
      e.preventDefault();
      e.stopPropagation();
      // Holding the keys down must not send the code again after each cooldown.
      if (e.repeat || e.isComposing) return;
      act(shortcut === "run" ? "run" : "test");
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  });

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

  const pickTab = (next: Tab) => {
    setTab(next);
    setAsmWanted(next === "assembly");
  };

  // Retrying assembly goes back to where the assembly will appear.
  const retry = () => {
    if (lastAction === "asm") setTab("assembly");
    act(lastAction);
  };

  const pickView = (next: View) => {
    setView(next);
    viewTabs.current[next]?.focus();
  };

  const moveView = (e: KeyboardEvent, from: View) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    pickView(from === "question" ? "code" : "question");
  };

  const pickOptimize = (opt: boolean) => act("asm", opt);

  const linked = useMemo(() => (tab !== "assembly" || hoverAsm === null ? [] : [hoverAsm]), [tab, hoverAsm]);
  const error = result?.kind === "error" ? result.error : null;
  // In the wide layout both panes show and the tabs are hidden, so the panes are not tab panels there.
  const paneRole = (id: View) => (tabbed ? { role: "tabpanel", "aria-labelledby": `workspace-tab-${id}` } : {});

  return (
    <div className="session-step code-step" data-view={view}>
      <div className="workspace-views" role="tablist" aria-label="Exercise">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            ref={(el) => { viewTabs.current[v.id] = el; }}
            type="button"
            role="tab"
            id={`workspace-tab-${v.id}`}
            className="results-tab"
            aria-selected={view === v.id}
            aria-controls={`workspace-${v.id}`}
            tabIndex={view === v.id ? 0 : -1}
            onClick={() => setView(v.id)}
            onKeyDown={(e) => moveView(e, v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <Split
        courseId={courseId}
        name="question"
        orientation="vertical"
        start={0.4}
        minFirst={320}
        minSecond={320}
        label="Resize the question and code panels"
        first={
          <div id="workspace-question" className="workspace-fill" {...paneRole("question")}>
            <QuestionPanel
              title={ex.title}
              content={rendered.content}
              examples={rendered.examples ?? []}
              hints={rendered.hints ?? []}
              renderSolution={() => <Editor value={ex.solution} onChange={() => {}} diagnostics={[]} readOnly />}
              focusTitle={moved}
            />
          </div>
        }
        second={
          <div id="workspace-code" className="workspace-code" {...paneRole("code")}>
            <Split
              courseId={courseId}
              name="results"
              orientation="horizontal"
              start={0.65}
              minFirst={160}
              minSecond={120}
              label="Resize the editor and results panels"
              first={<Editor value={code} onChange={edit} diagnostics={diagnostics} onHoverLine={setHoverC} onFormat={tidy} highlightLines={linked} />}
              second={
                <ResultsPanel
                  tab={tab}
                  onTab={pickTab}
                  output={
                    <div key={runId} className="code-run">
                      {result === null && <p className="results-empty">Run shows what your code prints. Submit checks it against the tests. Both send your code to godbolt.org, a website that compiles C.</p>}
                      {error && (
                        <div className="code-result" data-state="bad">
                          <p className="code-headline">{error.message}</p>
                          <div className="code-actions">
                            <button type="button" onClick={retry} disabled={locked}>{wait > 0 ? `Retry in ${wait}s` : "Retry"}</button>
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
                  }
                  assembly={
                    asm ? (
                      <AsmPanel
                        lines={asm.lines}
                        activeSourceLine={hoverC ?? hoverAsm}
                        onHoverAsm={setHoverAsm}
                        optimize={shownOptimize}
                        onOptimize={pickOptimize}
                        onUpdate={() => act("asm")}
                        locked={locked}
                        stale={asm.code !== code}
                        diagnostics={asm.failed}
                      />
                    ) : (
                      <p className="results-empty">Compiling…</p>
                    )
                  }
                />
              }
            />
            <div className="code-actions workspace-actions">
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
                  <button type="button" className="code-reset btn-quiet" ref={resetRef} onClick={() => setConfirmReset(true)}>Reset</button>
                  <button type="button" onClick={() => act("run")} disabled={locked} title="Run (Ctrl+Enter or Cmd+Enter)" aria-keyshortcuts="Control+Enter Meta+Enter">{busy && lastAction === "run" ? "Running…" : "Run"}</button>
                  {/* Once the step is solved, Next in the top bar is the one primary action. */}
                  <button type="button" className={done ? undefined : "btn-primary"} onClick={() => act("test")} disabled={locked} title="Submit (Ctrl+Shift+Enter or Cmd+Shift+Enter)" aria-keyshortcuts="Control+Shift+Enter Meta+Shift+Enter">{busy && lastAction === "test" ? "Submitting…" : "Submit"}</button>
                </>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
}
