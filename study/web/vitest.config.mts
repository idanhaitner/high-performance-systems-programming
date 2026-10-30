import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  // tsconfig keeps JSX for Next to compile, so tests that import a component compile it here.
  oxc: { jsx: { runtime: "automatic" } },
  test: { include: ["lib/**/*.test.ts"] },
});
