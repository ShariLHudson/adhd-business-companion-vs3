import { beforeEach, describe, expect, it, vi } from "vitest";
import { PROFILE_LEARNING_FLAG_KEYS } from "./intelligence-layer/featureFlags";
import {
  initCompanionSession,
  resetCompanionSessionForTests,
} from "./intelligence-layer/companionSession";
import { resolveOfferBucket } from "./intelligence-layer/interventionRegistry";
import { getIntelligenceProfile } from "./intelligence-layer/profileStore";
import { getIntelligenceSignalStore } from "./intelligence-layer/signalStore";
import { resetTrustDiagnosticsForTests } from "./intelligence-layer/trustDiagnostics";
import {
  getToolSuggestionAnalytics,
  toolKindToOfferKey,
  trackToolSuggestionAccepted,
  trackToolSuggestionDismissed,
  trackToolSuggestionOffered,
} from "./toolSuggestionAnalytics";

function mockStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { dispatchEvent: vi.fn(), localStorage: storage });
  vi.stubGlobal("structuredClone", (v: unknown) => JSON.parse(JSON.stringify(v)));
}

describe("toolKindToOfferKey", () => {
  it("maps approved kinds to registry-resolvable offer keys", () => {
    expect(resolveOfferBucket(toolKindToOfferKey("clear-mind"))).toBe("clear_mind");
    expect(resolveOfferBucket(toolKindToOfferKey("breathe"))).toBe("breathing");
    expect(resolveOfferBucket(toolKindToOfferKey("get-unstuck"))).toBe(
      "momentum_prompt",
    );
    expect(resolveOfferBucket(toolKindToOfferKey("focus-session"))).toBe(
      "generic_tip",
    );
    expect(resolveOfferBucket(toolKindToOfferKey("spin-wheel"))).toBe("generic_tip");
  });
});

describe("toolSuggestionAnalytics trust wiring", () => {
  beforeEach(() => {
    mockStorage();
    resetCompanionSessionForTests();
    resetTrustDiagnosticsForTests();
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
    localStorage.removeItem("companion-tool-suggestion-analytics-v1");
    localStorage.removeItem("companion-intelligence-signals-v1");
    localStorage.removeItem("companion-intelligence-profile-v1");
    initCompanionSession();
  });

  it("records trust.offer_rendered on offered", () => {
    trackToolSuggestionOffered("clear-mind");
    const signals = getIntelligenceSignalStore().signals;
    expect(signals).toHaveLength(1);
    expect(signals[0]?.domain).toBe("trust");
    expect(signals[0]?.category).toBe("offer_rendered");
    expect(signals[0]?.meta?.interventionBucket).toBe("clear_mind");
    expect(getToolSuggestionAnalytics().offered["clear-mind"]).toBe(1);
  });

  it("records trust.suggestion_accepted on accepted", () => {
    trackToolSuggestionAccepted("breathe");
    const signals = getIntelligenceSignalStore().signals;
    expect(signals).toHaveLength(1);
    expect(signals[0]?.category).toBe("suggestion_accepted");
    expect(signals[0]?.meta?.interventionBucket).toBe("breathing");
    expect(getToolSuggestionAnalytics().accepted.breathe).toBe(1);
  });

  it("records trust.suggestion_dismissed on dismissed", () => {
    trackToolSuggestionDismissed("get-unstuck");
    const signals = getIntelligenceSignalStore().signals;
    expect(signals).toHaveLength(1);
    expect(signals[0]?.category).toBe("suggestion_dismissed");
    expect(signals[0]?.meta?.interventionBucket).toBe("momentum_prompt");
    expect(getToolSuggestionAnalytics().dismissed["get-unstuck"]).toBe(1);
  });

  it("records signal but does not evolve traits when profile learning is OFF", () => {
    trackToolSuggestionAccepted("clear-mind");
    const profile = getIntelligenceProfile();
    expect(getIntelligenceSignalStore().signals).toHaveLength(1);
    expect(profile.relationship.trust.responds_to_suggestions).toBeUndefined();
    expect(getToolSuggestionAnalytics().accepted["clear-mind"]).toBe(1);
  });

  it("evolves trust traits when profile learning is ON", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    trackToolSuggestionAccepted("clear-mind");
    const profile = getIntelligenceProfile();
    expect(profile.relationship.trust.responds_to_suggestions?.observations).toBe(1);
    expect(getToolSuggestionAnalytics().accepted["clear-mind"]).toBe(1);
  });

  it("does not evolve traits for offer_rendered even when learning is ON", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    trackToolSuggestionOffered("breathe");
    const profile = getIntelligenceProfile();
    expect(getIntelligenceSignalStore().signals[0]?.category).toBe("offer_rendered");
    expect(profile.relationship.trust.responds_to_suggestions).toBeUndefined();
    expect(getToolSuggestionAnalytics().offered.breathe).toBe(1);
  });

  it("continues analytics when trust collection throws", async () => {
    const trustModule = await import("./intelligence-layer/trustSignals");
    const spy = vi
      .spyOn(trustModule, "recordTrustEvidence")
      .mockImplementation(() => {
        throw new Error("trust pipeline failure");
      });
    const result = trackToolSuggestionDismissed("spin-wheel");
    expect(result.dismissed["spin-wheel"]).toBe(1);
    expect(getIntelligenceSignalStore().signals).toHaveLength(0);
    spy.mockRestore();
  });
});
