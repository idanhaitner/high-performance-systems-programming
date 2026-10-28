import { classifyRun, parseAsm, type RunOutcome } from "./run-result";

export const GODBOLT_COMPILER = "cg162";
export const GODBOLT_BASE = "https://godbolt.org/api";
export const SANITIZE = true;

export const REQUEST_TIMEOUT_MS = 30_000; // godbolt itself takes about 21 s to report an infinite loop
export const COOLDOWN_MS = 3_000;

export class GodboltError extends Error {
  kind: "unreachable" | "rate-limited";
  retryAfter: number;

  constructor(kind: "unreachable" | "rate-limited", retryAfter = 0) {
    super(
      kind === "rate-limited"
        ? `Too many runs in a short time — try again in ${retryAfter || 30} seconds.`
        : "The online compiler can't be reached right now.",
    );
    this.name = "GodboltError";
    this.kind = kind;
    this.retryAfter = retryAfter;
  }
}

export function flagsFor(optimize: boolean): string {
  if (optimize) return "-std=c17 -Wall -Wextra -O2 -g";
  const base = "-std=c17 -Wall -Wextra -O0 -g";
  return SANITIZE ? `${base} -fsanitize=address,undefined` : base;
}

async function post(body: unknown, fetchImpl: typeof fetch): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(`${GODBOLT_BASE}/compiler/${GODBOLT_COMPILER}/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (response.status === 429) {
      const seconds = Number(response.headers.get("Retry-After"));
      throw new GodboltError("rate-limited", Number.isFinite(seconds) && seconds > 0 ? seconds : 0);
    }
    if (!response.ok) throw new GodboltError("unreachable");
    return await response.json();
  } catch (error) {
    if (error instanceof GodboltError) throw error;
    throw new GodboltError("unreachable");
  } finally {
    clearTimeout(timer);
  }
}

export async function runProgram(
  source: string,
  opts: { args?: string[]; stdin?: string; fetchImpl?: typeof fetch } = {},
): Promise<RunOutcome> {
  const json = await post(
    {
      source,
      options: {
        userArguments: flagsFor(false),
        executeParameters: { args: opts.args ?? [], stdin: opts.stdin ?? "" },
        compilerOptions: { executorRequest: true },
        filters: { execute: true },
        tools: [],
        libraries: [],
      },
    },
    opts.fetchImpl ?? fetch,
  );
  return classifyRun(json);
}

export async function compileAsm(
  source: string,
  opts: { optimize: boolean; fetchImpl?: typeof fetch },
): Promise<ReturnType<typeof parseAsm>> {
  const json = await post(
    {
      source,
      options: {
        userArguments: flagsFor(opts.optimize),
        filters: {
          intel: true,
          labels: true,
          directives: true,
          commentOnly: true,
          demangle: true,
          execute: false,
        },
        tools: [],
        libraries: [],
      },
    },
    opts.fetchImpl ?? fetch,
  );
  return parseAsm(json);
}
