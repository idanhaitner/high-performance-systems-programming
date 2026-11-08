import { codeToHtml, type ShikiTransformer, type ThemedToken, type ThemeRegistration } from "shiki";

const SUPPORTED = new Set(["cpp", "c", "java", "sql", "text"]);

// Same colours as the in-browser editor (components/session/Editor.tsx), read from the site's --code-* tokens.
const siteTheme: ThemeRegistration = {
  name: "study-site",
  type: "dark",
  fg: "var(--code-ink)",
  bg: "var(--code)",
  settings: [
    { settings: { foreground: "var(--code-ink)", background: "var(--code)" } },
    { scope: ["variable", "variable.other", "variable.parameter", "variable.other.member", "entity.name.variable"], settings: { foreground: "var(--code-var)" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call entity.name.function"], settings: { foreground: "var(--code-fn)" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "var(--code-comment)", fontStyle: "italic" } },
    {
      scope: ["keyword", "storage.modifier", "keyword.control", "keyword.operator.sizeof", "keyword.operator.new", "keyword.operator.delete"],
      settings: { foreground: "var(--code-key)", fontStyle: "bold" },
    },
    { scope: ["keyword.operator", "punctuation"], settings: { foreground: "var(--code-ink)", fontStyle: "" } },
    { scope: ["storage.type", "support.type", "entity.name.type", "entity.name.class", "entity.name.struct"], settings: { foreground: "var(--code-type)" } },
    {
      scope: ["meta.preprocessor", "keyword.control.directive", "punctuation.definition.directive"],
      settings: { foreground: "var(--code-macro)", fontStyle: "" },
    },
    { scope: ["string", "string.quoted.other.lt-gt.include", "constant.character"], settings: { foreground: "var(--code-str)" } },
    { scope: ["constant.numeric", "constant.language", "keyword.other.unit"], settings: { foreground: "var(--code-num)" } },
  ],
};

// The C grammar leaves plain names (x, product, B) untagged, so colour any name still in the default ink as a variable.
const IDENT = /[A-Za-z_][A-Za-z0-9_]*/g;
const colourNames: ShikiTransformer = {
  tokens(lines) {
    return lines.map((line) =>
      line.flatMap((token) => {
        if (token.color !== "var(--code-ink)" || this.options.lang === "text") return [token];
        const parts: ThemedToken[] = [];
        let at = 0;
        for (const m of token.content.matchAll(IDENT)) {
          if (m.index > at) parts.push({ ...token, content: token.content.slice(at, m.index), offset: token.offset + at });
          parts.push({ ...token, content: m[0], offset: token.offset + m.index, color: "var(--code-var)" });
          at = m.index + m[0].length;
        }
        if (at < token.content.length) parts.push({ ...token, content: token.content.slice(at), offset: token.offset + at });
        return parts;
      }),
    );
  },
};

export async function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const label = lang || "text";
  const grammar = SUPPORTED.has(label) ? label : "text";
  const html = await codeToHtml(text.replace(/\n$/, ""), {
    lang: grammar,
    theme: siteTheme,
    transformers: [colourNames],
  });
  return (
    <div className="code-panel" data-lang={grammar}>
      <span className="lang">{label}</span>
      <div className="code-scroll" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
