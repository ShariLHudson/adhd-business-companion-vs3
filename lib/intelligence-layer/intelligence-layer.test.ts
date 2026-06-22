import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  createEmptyIntelligenceProfile,
  evolveIntelligenceProfileFromSignals,
  formatCompanionIntelligenceForPrompt,
  getCompanionIntelligenceSlice,
  getIntelligenceProfile,
  hydrateIntelligenceProfile,
  ingestClassifiedUserSignals,
  recordCreationSignal,
  recordIntelligenceSignal,
  recordTrustSignal,
} from "./index";

function mockStorage() {
  const mem = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
}

describe("intelligence layer", () => {
  beforeEach(() => {
    mockStorage();
    vi.stubGlobal("structuredClone", (v: unknown) => JSON.parse(JSON.stringify(v)));
  });

  it("creates an empty master profile with five intelligence categories", () => {
    const profile = createEmptyIntelligenceProfile("user-1");
    expect(profile.version).toBe(1);
    expect(profile.userId).toBe("user-1");
    expect(profile.human).toBeDefined();
    expect(profile.relationship).toBeDefined();
    expect(profile.business).toBeDefined();
    expect(profile.adhd).toBeDefined();
  });

  it("stores signals separately from profile conclusions", () => {
    recordIntelligenceSignal({
      domain: "emotional",
      category: "overwhelm",
      source: "chat",
      valence: "negative",
    });
    const profile = getIntelligenceProfile();
    expect(profile.signalCount).toBe(1);
    expect(profile.human.emotional.often_overwhelmed).toBeDefined();
    expect(profile.human.emotional.often_overwhelmed!.observations).toBe(1);
  });

  it("evolves profile from classified user signals", () => {
    ingestClassifiedUserSignals(
      {
        struggles: ["overwhelm", "follow_through"],
        questions: ["help_me_prioritize"],
        emotions: ["hopeful"],
      },
      { source: "chat" },
    );
    const profile = hydrateIntelligenceProfile();
    expect(profile.signalCount).toBe(4);
    expect(profile.human.emotional.often_overwhelmed?.score).toBeGreaterThan(50);
    expect(profile.relationship.supportStyle.strategic_planning).toBeDefined();
  });

  it("companion intelligence consumes profile without collecting", () => {
    for (let i = 0; i < 8; i++) {
      recordIntelligenceSignal({
        domain: "conversation",
        category: "im_overwhelmed",
        source: "chat",
        valence: "negative",
      });
    }
    evolveIntelligenceProfileFromSignals();
    const slice = getCompanionIntelligenceSlice();
    expect(slice.personalization.tone).toBe("calm");
    expect(slice.personalization.coachingHints.length).toBeGreaterThan(0);
    const prompt = formatCompanionIntelligenceForPrompt();
    expect(prompt).toMatch(/one voice only/i);
    expect(prompt).toMatch(/Coaching:/);
  });

  it("tracks business and trust patterns without financial data", () => {
    recordCreationSignal("blog-post");
    recordTrustSignal(true, "suggestion:plan-my-day");
    recordTrustSignal(false, "suggestion:generic-tip");
    const profile = getIntelligenceProfile();
    expect(profile.business.visibility.consistent_creator).toBeDefined();
    expect(profile.relationship.trust.responds_to_suggestions).toBeDefined();
    expect(profile.relationship.trust.ignores_generic_suggestions).toBeDefined();
  });
});
