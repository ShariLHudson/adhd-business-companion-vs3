import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAdaptiveEstateStore,
  confidenceTier,
  getAdaptivePreference,
  recordAdaptiveSignal,
  recordSignalsFromCoachingChoice,
  recordSignalsFromDiscoveryAnswer,
  prefillDiscoveryFromAdaptiveMemory,
  adaptiveCoachingOpener,
  anticipateNextStep,
  memberFacingPreferenceLine,
  isWorthRemembering,
} from "./index";

describe("Estate Adaptive Intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
    clearAdaptiveEstateStore();
  });

  it("only registers preferences that change future behavior", () => {
    expect(isWorthRemembering("templates_first")).toBe(true);
    expect(isWorthRemembering("conversation_over_forms")).toBe(true);
  });

  it("builds confidence with repeated positive signals", () => {
    for (let i = 0; i < 5; i++) {
      recordAdaptiveSignal({
        kind: "discovery_answer",
        at: new Date().toISOString(),
        preferenceId: "templates_first",
        valence: "positive",
      });
    }
    const pref = getAdaptivePreference("templates_first");
    expect(pref?.observations).toBe(5);
    expect(confidenceTier(pref)).toBe("high");
  });

  it("prefills discovery when memory confidence is high", () => {
    for (let i = 0; i < 5; i++) {
      recordAdaptiveSignal({
        kind: "discovery_answer",
        at: new Date().toISOString(),
        preferenceId: "templates_first",
        valence: "positive",
        weight: 15,
      });
    }
    const pref = getAdaptivePreference("templates_first");
    expect(confidenceTier(pref)).toBe("high");

    const answers = prefillDiscoveryFromAdaptiveMemory("create_sop");
    expect(answers["sop-starting-point"]).toMatch(/already have/i);
  });

  it("records coaching choices as preference signals", () => {
    recordSignalsFromCoachingChoice({
      id: "focus-clear-mind",
      humanLabel: "Get everything out of your head first",
      spaceId: "clear-my-mind",
      openSection: "brain-dump",
    });
    expect(getAdaptivePreference("clear_mind_for_thoughts")?.observations).toBe(
      1,
    );
  });

  it("uses tentative language at medium confidence", () => {
    for (let i = 0; i < 3; i++) {
      recordAdaptiveSignal({
        kind: "discovery_answer",
        at: new Date().toISOString(),
        preferenceId: "visual_thinking",
        valence: "positive",
      });
    }
    const line = memberFacingPreferenceLine("visual_thinking");
    expect(line).toMatch(/may prefer visual thinking/i);
  });

  it("uses confident language at high confidence", () => {
    for (let i = 0; i < 5; i++) {
      recordAdaptiveSignal({
        kind: "coaching_choice",
        at: new Date().toISOString(),
        preferenceId: "learn_by_doing",
        valence: "positive",
        weight: 14,
      });
    }
    const line = memberFacingPreferenceLine("learn_by_doing");
    expect(line).toMatch(/I know you prefer learning by doing/i);
  });

  it("anticipates next steps only with enough evidence", () => {
    expect(anticipateNextStep("sop_completed")).toBeNull();
    for (let i = 0; i < 4; i++) {
      recordAdaptiveSignal({
        kind: "create_completion",
        at: new Date().toISOString(),
        preferenceId: "sop_to_checklist",
        valence: "positive",
      });
    }
    const next = anticipateNextStep("sop_completed");
    expect(next?.line).toMatch(/checklist/i);
  });

  it("adapts coaching opener for learn-by-doing at high confidence", () => {
    for (let i = 0; i < 5; i++) {
      recordAdaptiveSignal({
        kind: "coaching_choice",
        at: new Date().toISOString(),
        preferenceId: "learn_by_doing",
        valence: "positive",
        weight: 14,
      });
    }
    const opener = adaptiveCoachingOpener("focus");
    expect(opener).toMatch(/learning by doing/i);
  });

  it("records discovery answer patterns", () => {
    recordSignalsFromDiscoveryAnswer(
      "sop-starting-point",
      "I already have a process written down",
    );
    expect(getAdaptivePreference("templates_first")?.observations).toBe(1);
  });
});
