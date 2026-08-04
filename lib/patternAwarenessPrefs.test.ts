import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPatternAwarenessLevel,
  isProactivePatternInsightsEnabled,
  shouldSuppressProactivePatternInsights,
} from "./patternAwarenessPrefs";
import { savePrefs } from "./companionStore";

describe("patternAwarenessPrefs", () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to light — proactive insights enabled", () => {
    expect(getPatternAwarenessLevel()).toBe("light");
    expect(isProactivePatternInsightsEnabled()).toBe(true);
    expect(shouldSuppressProactivePatternInsights()).toBe(false);
  });

  it("suppresses proactive insights when off", () => {
    savePrefs({ patternAwareness: "off" });
    expect(isProactivePatternInsightsEnabled()).toBe(false);
    expect(shouldSuppressProactivePatternInsights()).toBe(true);
  });

  it("allows proactive insights for guided and active", () => {
    savePrefs({ patternAwareness: "guided" });
    expect(isProactivePatternInsightsEnabled()).toBe(true);
    savePrefs({ patternAwareness: "active" });
    expect(isProactivePatternInsightsEnabled()).toBe(true);
  });
});
