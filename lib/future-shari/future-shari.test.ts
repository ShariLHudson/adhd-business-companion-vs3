import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptFutureShari,
  evaluateFutureShari,
  evaluateFutureShariOffer,
  shouldSurfaceFutureOffer,
} from "./futureEngine";
import { buildFounderFutureReport } from "./founderFutureReporting";
import { saveFutureShariStore } from "./futureStore";

describe("future shari intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveFutureShariStore({
      history: [],
      founderSamples: [],
      acceptedCount: 0,
      ignoredCount: 0,
      offerDismissedOn: null,
    });
  });

  it("detects capture idea opportunity", () => {
    const snapshot = evaluateFutureShari({
      text: "I have an idea I need to remember",
    });
    expect(snapshot?.opportunity).toBe("organization");
    expect(snapshot?.futureBenefit).toMatch(/head|remember/i);
  });

  it("surfaces offer with intro line", () => {
    const offer = evaluateFutureShariOffer({
      text: "I should email them back about this",
    });
    expect(shouldSurfaceFutureOffer(offer)).toBe(true);
    expect(offer?.introLine).toMatch(/Future/i);
  });

  it("accept returns gentle message without should", () => {
    const offer = evaluateFutureShariOffer({
      text: "leave this for tomorrow morning",
    });
    expect(offer).not.toBeNull();
    const { message } = acceptFutureShari(offer!);
    expect(message.length).toBeGreaterThan(10);
  });

  it("founder report tracks friction", () => {
    evaluateFutureShariOffer({
      text: "too many ideas on my mind",
      cognitiveLoadLevel: "heavy",
    });
    const report = buildFounderFutureReport();
    expect(report.sampleSize).toBeGreaterThan(0);
  });
});
