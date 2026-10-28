import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GodboltError,
  REQUEST_TIMEOUT_MS,
  asmFlagsFor,
  compileAsm,
  flagsFor,
  runProgram,
} from "./godbolt";

const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/godbolt/${name}`, import.meta.url), "utf8");

function jsonResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("flagsFor", () => {
  it("uses -O0 with sanitizers when not optimizing", () => {
    expect(flagsFor(false)).toBe("-std=c17 -Wall -Wextra -O0 -g -fsanitize=address,undefined");
  });
  it("uses -O2 without sanitizers when optimizing", () => {
    expect(flagsFor(true)).toBe("-std=c17 -Wall -Wextra -O2 -g");
  });
});

describe("runProgram", () => {
  it("resolves ok and sends the expected request body", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(fixture("run-ok.json")));
    const outcome = await runProgram("int main(void){return 0;}", {
      args: ["3", "4"],
      stdin: "hello",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(outcome.kind).toBe("ok");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://godbolt.org/api/compiler/cg162/compile");
    const body = JSON.parse(init.body as string);
    expect(body.options.userArguments).toBe(flagsFor(false));
    expect(body.options.executeParameters.args).toEqual(["3", "4"]);
    expect(body.options.executeParameters.stdin).toBe("hello");
    expect(body.options.filters.execute).toBe(true);
  });

  it("defaults args and stdin", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(fixture("run-ok.json")));
    await runProgram("x", { fetchImpl: fetchImpl as unknown as typeof fetch });
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    const body = JSON.parse(init.body as string);
    expect(body.options.executeParameters).toEqual({ args: [], stdin: "" });
  });

  it("rejects unreachable when fetch fails", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const err = await runProgram("x", { fetchImpl: fetchImpl as unknown as typeof fetch }).catch((e) => e);
    expect(err).toBeInstanceOf(GodboltError);
    expect(err.kind).toBe("unreachable");
    expect(err.message).toBe("The online compiler can't be reached right now.");
  });

  it("aborts after the timeout", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_res, rej) => {
          init.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")));
        }),
    );
    const p = runProgram("x", { fetchImpl: fetchImpl as unknown as typeof fetch }).catch((e) => e);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    const err = await p;
    expect(err).toBeInstanceOf(GodboltError);
    expect(err.kind).toBe("unreachable");
  });

  it("rejects rate-limited on 429 with Retry-After", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse("", 429, { "Retry-After": "12" }));
    const err = await runProgram("x", { fetchImpl: fetchImpl as unknown as typeof fetch }).catch((e) => e);
    expect(err).toBeInstanceOf(GodboltError);
    expect(err.kind).toBe("rate-limited");
    expect(err.retryAfter).toBe(12);
    expect(err.message).toBe("Too many runs in a short time — try again in 12 seconds.");
  });

  it("uses 30 seconds in the message when Retry-After is missing", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse("", 429));
    const err = await runProgram("x", { fetchImpl: fetchImpl as unknown as typeof fetch }).catch((e) => e);
    expect(err.retryAfter).toBe(0);
    expect(err.message).toBe("Too many runs in a short time — try again in 30 seconds.");
  });

  it("treats a non-numeric Retry-After as unknown", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse("", 429, { "Retry-After": "soon" }));
    const err = await runProgram("x", { fetchImpl: fetchImpl as unknown as typeof fetch }).catch((e) => e);
    expect(err.retryAfter).toBe(0);
  });

  it("rejects unreachable on 500", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse("oops", 500));
    const err = await runProgram("x", { fetchImpl: fetchImpl as unknown as typeof fetch }).catch((e) => e);
    expect(err).toBeInstanceOf(GodboltError);
    expect(err.kind).toBe("unreachable");
  });

  it("rejects unreachable when a 200 body is not JSON", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse("<html>"));
    const err = await runProgram("x", { fetchImpl: fetchImpl as unknown as typeof fetch }).catch((e) => e);
    expect(err.kind).toBe("unreachable");
  });
});

describe("compileAsm", () => {
  it("sends -O2 with execute off and parses the assembly", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(fixture("asm.json")));
    const result = await compileAsm("int f(void){return 1;}", {
      optimize: true,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.lines.length).toBeGreaterThan(0);
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    const body = JSON.parse(init.body as string);
    expect(body.options.userArguments).toContain("-O2");
    expect(body.options.filters.execute).toBe(false);
    expect(body.options.filters.intel).toBe(true);
  });

  it("never sends sanitizer flags", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(fixture("asm.json")));
    await compileAsm("int f(void){return 1;}", { optimize: false, fetchImpl: fetchImpl as unknown as typeof fetch });
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    const body = JSON.parse(init.body as string);
    expect(body.options.userArguments).toBe("-std=c17 -Wall -Wextra -O0 -g");
    expect(body.options.userArguments).not.toContain("-fsanitize");
  });
});

describe("asmFlagsFor", () => {
  it("builds plain -O0 and -O2 flags", () => {
    expect(asmFlagsFor(false)).toBe("-std=c17 -Wall -Wextra -O0 -g");
    expect(asmFlagsFor(true)).toBe("-std=c17 -Wall -Wextra -O2 -g");
  });
});
