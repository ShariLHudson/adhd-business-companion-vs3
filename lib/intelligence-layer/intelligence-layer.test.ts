import { describe, expect, it, beforeEach, vi } from "vitest";
import { PROFILE_LEARNING_FLAG_KEYS } from "./featureFlags";
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
import { countSignalsByCategory } from "./signalStore";
import { initCompanionSession, resetCompanionSessionForTests } from "./companionSession";
import { resetTrustDiagnosticsForTests } from "./trustDiagnostics";

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
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    resetCompanionSessionForTests();
    resetTrustDiagnosticsForTests();
    initCompanionSession();
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

  it("tracks business patterns without financial data", () => {
    recordCreationSignal("blog-post");
    const profile = getIntelligenceProfile();
    expect(profile.business.visibility.consistent_creator).toBeDefined();
  });

  it("evolves trust traits via recordTrustSignal when pipeline attribution resolves", () => {
    recordTrustSignal(true, "suggestion:plan-my-day");
    recordTrustSignal(false, "suggestion:generic-tip");
    const profile = getIntelligenceProfile();
    expect(profile.relationship.trust.responds_to_suggestions).toBeDefined();
    expect(profile.relationship.trust.ignores_generic_suggestions).toBeDefined();
    expect(countSignalsByCategory().get("trust:suggestion_accepted")).toBe(1);
    expect(countSignalsByCategory().get("trust:suggestion_ignored")).toBe(1);
  });
});

describe("profile learning gate", () => {
  beforeEach(() => {
    mockStorage();
    vi.stubGlobal("structuredClone", (v: unknown) => JSON.parse(JSON.stringify(v)));
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
  });

  it("records signals but does not evolve traits when profile learning is OFF", () => {
    recordIntelligenceSignal({
      domain: "emotional",
      category: "overwhelm",
      source: "chat",
      valence: "negative",
    });
    const profile = getIntelligenceProfile();
    expect(profile.signalCount).toBe(1);
    expect(profile.human.emotional.often_overwhelmed).toBeUndefined();
    expect(countSignalsByCategory().get("emotional:overwhelm")).toBe(1);
  });

  it("blocks chat ingest evolution when profile learning is OFF", () => {
    ingestClassifiedUserSignals(
      {
        struggles: ["overwhelm"],
        questions: ["help_me_prioritize"],
        emotions: ["hopeful"],
      },
      { source: "chat" },
    );
    const profile = hydrateIntelligenceProfile();
    expect(profile.signalCount).toBe(3);
    expect(profile.human.emotional.often_overwhelmed).toBeUndefined();
    expect(profile.relationship.supportStyle.strategic_planning).toBeUndefined();
  });
});
