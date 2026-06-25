import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getReliefCompanionHints,
  getReliefProfile,
  recordReliefSignal,
} from "./reliefIntelligence";

describe("reliefIntelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
  });

  it("records share signals without surfacing UI", () => {
    recordReliefSignal({
      kind: "share",
      mode: "voice",
      wordCount: 12,
      itemCount: 1,
      sessionId: "s1",
    });
    const profile = getReliefProfile();
    expect(profile.voiceShares).toBe(1);
    expect(profile.lastSessionId).toBe("s1");
  });

  it("infers voice preference from history", () => {
    for (let i = 0; i < 4; i++) {
      recordReliefSignal({
        kind: "share",
        mode: "voice",
        wordCount: 8,
        itemCount: 1,
        sessionId: `s-${i}`,
      });
    }
    recordReliefSignal({
      kind: "share",
      mode: "typing",
      wordCount: 8,
      itemCount: 1,
      sessionId: "s-typing",
    });
    expect(getReliefCompanionHints().prefersVoice).toBe(true);
  });

  it("tracks continued capture", () => {
    recordReliefSignal({ kind: "continued-capture", sessionId: "s1" });
    expect(getReliefProfile().continuedCaptureCount).toBe(1);
  });
});
