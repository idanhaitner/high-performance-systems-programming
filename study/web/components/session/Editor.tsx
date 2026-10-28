"use client";

import { cpp } from "@codemirror/lang-cpp";
import { setDiagnostics, type Diagnostic as CmDiagnostic } from "@codemirror/lint";
import { EditorState, StateEffect, StateField, type Extension } from "@codemirror/state";
import { Decoration, EditorView, drawSelection, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { HighlightStyle, bracketMatching, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { useEffect, useRef } from "react";
import type { Diagnostic } from "@/lib/run-result";

type Props = {
  value: string;
  onChange(v: string): void;
  diagnostics: Diagnostic[];
  onHoverLine?(line: number | null): void;
  highlightLines?: number[];
  readOnly?: boolean;
};

const setHighlight = StateEffect.define<number[]>();

const highlightField = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (!e.is(setHighlight)) continue;
      const total = tr.state.doc.lines;
      const marks = [...new Set(e.value)]
        .filter((n) => n >= 1 && n <= total)
        .sort((a, b) => a - b)
        .map((n) => Decoration.line({ class: "cm-linked-line" }).range(tr.state.doc.line(n).from));
      deco = Decoration.set(marks);
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const theme = EditorView.theme({
  "&": { color: "var(--ink)", backgroundColor: "var(--card-solid)", fontSize: "0.9rem" },
  ".cm-content": { fontFamily: "var(--mono)", caretColor: "var(--accent)", padding: "0.5rem 0" },
  ".cm-scroller": { fontFamily: "var(--mono)", lineHeight: "1.55", minHeight: "10rem", maxHeight: "28rem" },
  "&.cm-focused": { outline: "2px solid var(--accent)", outlineOffset: "-2px" },
  ".cm-gutters": { backgroundColor: "var(--card-solid)", color: "var(--muted)", border: "none", borderInlineEnd: "1px solid var(--line)" },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklch, var(--accent) 7%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--ink)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "color-mix(in oklch, var(--accent) 25%, transparent)" },
  ".cm-cursor": { borderLeftColor: "var(--accent)" },
  ".cm-linked-line": { backgroundColor: "color-mix(in oklch, var(--accent) 16%, transparent)" },
  ".cm-tooltip": { backgroundColor: "var(--card-solid)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: "0.4rem" },
  ".cm-diagnostic": { fontFamily: "var(--font-sans), system-ui, sans-serif", fontSize: "0.85rem" },
});

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.modifier], color: "var(--accent-ink)", fontWeight: "600" },
  { tag: [t.typeName, t.standard(t.typeName)], color: "var(--accent-2)" },
  { tag: [t.string, t.character], color: "var(--ok)" },
  { tag: [t.number, t.bool, t.null], color: "var(--accent)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--muted)", fontStyle: "italic" },
  { tag: [t.meta, t.processingInstruction], color: "var(--muted)" },
]);

function toCm(doc: EditorState["doc"], list: Diagnostic[]): CmDiagnostic[] {
  return list.map((d) => {
    const line = doc.line(Math.min(Math.max(d.line, 1), doc.lines));
    const from = Math.min(line.from + Math.max(d.column - 1, 0), line.to);
    // Underline the token that starts at the column, or the whole rest of the line.
    const rest = doc.sliceString(from, line.to);
    const word = /^[A-Za-z0-9_]+/.exec(rest);
    const to = Math.max(word ? from + word[0].length : line.to, Math.min(from + 1, line.to));
    return { from, to: to === from ? line.to : to, severity: d.severity === "note" ? "info" : d.severity, message: d.text };
  });
}

export function Editor({ value, onChange, diagnostics, onHoverLine, highlightLines, readOnly = false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cb = useRef({ onChange, onHoverLine });
  cb.current = { onChange, onHoverLine };

  useEffect(() => {
    if (!host.current) return;
    const extensions: Extension[] = [
      lineNumbers(),
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      highlightActiveLine(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      cpp(),
      syntaxHighlighting(highlight),
      theme,
      highlightField,
      EditorState.readOnly.of(readOnly),
      EditorView.editable.of(!readOnly),
      EditorView.contentAttributes.of({ "aria-label": "C code editor", spellcheck: "false" }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) cb.current.onChange(u.state.doc.toString());
      }),
      EditorView.domEventHandlers({
        mousemove(event, v) {
          const pos = v.posAtCoords({ x: event.clientX, y: event.clientY });
          cb.current.onHoverLine?.(pos === null ? null : v.state.doc.lineAt(pos).number);
        },
        mouseleave() {
          cb.current.onHoverLine?.(null);
        },
      }),
    ];
    const v = new EditorView({ parent: host.current, state: EditorState.create({ doc: value, extensions }) });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // The editor is created once; later prop changes are pushed in by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);

  useEffect(() => {
    const v = view.current;
    if (v) v.dispatch(setDiagnostics(v.state, toCm(v.state.doc, diagnostics)));
  }, [diagnostics]);

  useEffect(() => {
    view.current?.dispatch({ effects: setHighlight.of(highlightLines ?? []) });
  }, [highlightLines]);

  return <div ref={host} className="code-editor" />;
}
