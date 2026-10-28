import { codeToHtml, type ThemeRegistration } from "shiki";

const SUPPORTED = new Set(["cpp", "c", "java", "sql", "text"]);

// Same colours as the in-browser editor (components/session/Editor.tsx), read from the site's --code-* tokens.
const siteTheme: ThemeRegistration = {
  name: "study-site",
  type: "dark",
  fg: "var(--code-ink)",
  bg: "var(--code)",
  settings: [
    { settings: { foreground: "var(--code-ink)", background: "var(--code)" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "var(--code-muted)", fontStyle: "italic" } },
    {
      scope: ["keyword", "storage.modifier", "keyword.control", "keyword.operator.sizeof", "keyword.operator.new", "keyword.operator.delete"],
      settings: { foreground: "var(--code-key)", fontStyle: "bold" },
    },
    { scope: ["keyword.operator", "punctuation"], settings: { foreground: "var(--code-ink)", fontStyle: "" } },
    { scope: ["storage.type", "support.type", "entity.name.type", "entity.name.class", "entity.name.struct"], settings: { foreground: "var(--code-type)" } },
    {
      scope: ["meta.preprocessor", "keyword.control.directive", "punctuation.definition.directive"],
      settings: { foreground: "var(--code-type)", fontStyle: "" },
    },
    { scope: ["string", "string.quoted.other.lt-gt.include", "constant.character"], settings: { foreground: "var(--code-str)" } },
    { scope: ["constant.numeric", "constant.language", "keyword.other.unit"], settings: { foreground: "var(--code-num)" } },
  ],
};

export async function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const label = lang || "text";
  const grammar = SUPPORTED.has(label) ? label : "text";
  const html = await codeToHtml(text.replace(/\n$/, ""), {
    lang: grammar,
    theme: siteTheme,
  });
  return (
    <div className="code-panel" data-lang={grammar}>
      <span className="lang">{label}</span>
      <div className="code-scroll" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
