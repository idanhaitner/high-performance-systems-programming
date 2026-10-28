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

const theme = EditorView.theme(
  {
    "&": { color: "var(--code-ink)", backgroundColor: "var(--code)", fontSize: "0.875rem" },
    ".cm-content": { fontFamily: "var(--mono)", fontVariantLigatures: "none", caretColor: "var(--code-num)", padding: "10px 0" },
    ".cm-scroller": { fontFamily: "var(--mono)", lineHeight: "1.6", minHeight: "12rem", maxHeight: "30rem" },
    "&.cm-focused": { outline: "none" },
    ".cm-gutters": { backgroundColor: "var(--code-head)", color: "var(--code-gutter)", border: "none" },
    ".cm-activeLine": { backgroundColor: "rgb(255 255 255 / 0.05)" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--code-ink)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "rgb(143 134 255 / 0.4) !important" },
    ".cm-cursor": { borderLeftColor: "var(--code-num)", borderLeftWidth: "2px" },
    ".cm-matchingBracket": { backgroundColor: "rgb(255 210 63 / 0.22)", outline: "none" },
    ".cm-linked-line": { backgroundColor: "rgb(143 134 255 / 0.3)" },
    ".cm-tooltip": { backgroundColor: "var(--card-solid)", color: "var(--ink)", border: "2px solid var(--edge)", borderRadius: "10px" },
    ".cm-diagnostic": { fontFamily: "var(--sans)", fontSize: "0.875rem", padding: "6px 10px" },
    ".cm-lintRange-error": { backgroundImage: "none", textDecoration: "wavy underline #ff8fa3", textUnderlineOffset: "3px" },
    ".cm-lintRange-warning": { backgroundImage: "none", textDecoration: "wavy underline #ffd23f", textUnderlineOffset: "3px" },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.modifier, t.operatorKeyword], color: "var(--code-key)", fontWeight: "600" },
  { tag: [t.typeName, t.standard(t.typeName)], color: "var(--code-type)" },
  { tag: [t.string, t.character], color: "var(--code-str)" },
  { tag: [t.number, t.bool, t.null], color: "var(--code-num)" },
  { tag: [t.variableName, t.propertyName], color: "var(--code-var)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: "var(--code-fn)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--code-comment)", fontStyle: "italic" },
  { tag: [t.meta, t.processingInstruction], color: "var(--code-macro)" },
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
      EditorView.lineWrapping,
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
