import { strToU8, zipSync } from "fflate";
import type { Block, Exercise } from "./types";

const FLAGS = "-std=c17 -Wall -Wextra -O0 -g";

const plain = (text: string): string => {
  // Code spans are kept exactly as written, so identifiers like read_line_from survive.
  const spans: string[] = [];
  const kept = text.replace(/`([^`]*)`/g, (_m, inner: string) => {
    spans.push(inner);
    return `\u0000${spans.length - 1}\u0000`;
  });
  const stripped = kept
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\$\$?([^$]+)\$\$?/g, "$1")
    .replace(/(\*\*)(.+?)\1/g, "$2")
    .replace(/(?<![A-Za-z0-9_])__(?=\S)(.+?)(?<=\S)__(?![A-Za-z0-9_])/g, "$1")
    .replace(/\*(?=\S)(.+?)(?<=\S)\*/g, "$1")
    .replace(/(?<![A-Za-z0-9_])_(?=\S)(.+?)(?<=\S)_(?![A-Za-z0-9_])/g, "$1");
  return stripped.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => spans[Number(i)]);
};

const endWithNewline = (text: string): string => (text === "" || text.endsWith("\n") ? text : `${text}\n`);

const shellQuote = (arg: string): string => `'${arg.replace(/'/g, "'\\''")}'`;

function blockText(block: Block): string {
  switch (block.type) {
    case "paragraph":
    case "quote":
    case "heading":
    case "math":
      return plain(block.text);
    case "code":
      return block.text.replace(/\n$/, "").split("\n").map((l) => `    ${l}`).join("\n");
    case "table":
      return [block.header, ...block.rows].map((row) => row.map(plain).join(" | ")).join("\n");
    case "list":
      return block.items
        .map((item, i) => {
          const rest = item.children.map(blockText).filter(Boolean).join("\n");
          return `${block.ordered ? `${i + 1}.` : "-"} ${plain(item.text)}${rest ? `\n${rest}` : ""}`;
        })
        .join("\n");
    case "directive":
      return block.children.map(blockText).filter(Boolean).join("\n\n");
  }
}

const readme = (ex: Exercise): string =>
  `${ex.title}\n${"=".repeat(ex.title.length)}\n\n${ex.statement.map(blockText).filter(Boolean).join("\n\n")}\n\nRun \`make test\` in this folder.\n`;

const functionMakefile = `CFLAGS = ${FLAGS}

.PHONY: test
test:
\tcat main.c harness.h test.c > all.c
\tgcc $(CFLAGS) all.c -o tests
\t./tests
`;

function programMakefile(count: number): string {
  const runs = Array.from({ length: count }, (_, i) => i + 1).map(
    (n) =>
      `\teval "./program $$(cat cases/${n}.args)" < cases/${n}.in > cases/${n}.actual; \\\n` +
      `\tif diff cases/${n}.actual cases/${n}.out > /dev/null; then echo "PASS case ${n}"; else echo "FAIL case ${n}"; diff cases/${n}.actual cases/${n}.out; failed=1; fi; \\`,
  );
  return `CFLAGS = ${FLAGS}

.PHONY: test
test:
\tgcc $(CFLAGS) main.c -o program
\t@failed=0; \\
${runs.join("\n")}
\texit $$failed
`;
}

export function exerciseZip(ex: Exercise, studentCode: string, harness: string): Uint8Array {
  const files: Record<string, Uint8Array> = {
    "main.c": strToU8(endWithNewline(studentCode)),
    "README.txt": strToU8(readme(ex)),
  };
  if (ex.mode === "function") {
    files["harness.h"] = strToU8(endWithNewline(harness));
    files["test.c"] = strToU8(endWithNewline(ex.test ?? ""));
    files["Makefile"] = strToU8(functionMakefile);
  } else {
    ex.cases.forEach((c, i) => {
      const n = i + 1;
      files[`cases/${n}.args`] = strToU8(c.args.map(shellQuote).join(" "));
      files[`cases/${n}.in`] = strToU8(c.stdin);
      files[`cases/${n}.out`] = strToU8(c.expected);
    });
    files["Makefile"] = strToU8(programMakefile(ex.cases.length));
  }
  return zipSync(files);
}
