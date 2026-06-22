import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runTrustValidationScenarios } from "./trustValidationScenarios";

function mockStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("structuredClone", (v: unknown) => JSON.parse(JSON.stringify(v)));
}

describe("runTrustValidationScenarios", () => {
  beforeEach(() => {
    mockStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("runs 8 scenarios through the real trust pipeline", () => {
    const results = runTrustValidationScenarios();
    expect(results).toHaveLength(8);
    expect(results.map((r) => r.name)).toEqual([
      "offer rendered",
      "suggestion accepted (learning OFF)",
      "suggestion accepted (learning ON)",
      "suggestion dismissed (learning ON)",
      "unknown bucket",
      "system suppression",
      "system block",
      "tool suggestion hook",
    ]);
    for (const result of results) {
      expect(result.pass, `scenario failed: ${result.name} — ${result.notes?.join("; ")}`).toBe(
        true,
      );
    }
  });

  it("records signals for each scenario", () => {
    const results = runTrustValidationScenarios();
    for (const result of results) {
      expect(result.signalRecorded).toBe(true);
    }
  });

  it("returns SSR fallback when window is unavailable", () => {
    vi.unstubAllGlobals();
    const originalWindow = globalThis.window;
    // @ts-expect-error — simulate SSR
    delete globalThis.window;
    const results = runTrustValidationScenarios();
    expect(results).toHaveLength(1);
    expect(results[0]?.pass).toBe(false);
    globalThis.window = originalWindow;
  });
});
