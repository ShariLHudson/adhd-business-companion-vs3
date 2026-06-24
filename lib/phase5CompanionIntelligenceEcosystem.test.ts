import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import { patchPhase2DiscoveryState, resetPhase2DiscoveryForTests } from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import {
  buildPersonalOperatingManual,
  isPhase5CompanionIntelligenceEcosystemActive,
  formatWhatWeveBuiltTogetherForDisplay,
  maybePredictiveOpportunityOffer,
  observePhase5EcosystemTurn,
  phase5CompanionIntelligenceEcosystemHintForChat,
  resetPhase5EcosystemForTests,
} from "./phase5CompanionIntelligenceEcosystem";

describe("phase5CompanionIntelligenceEcosystem", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetPhase1OnboardingForTests();
    resetPhase2DiscoveryForTests();
    resetPhase3RelationshipForTests();
    resetPhase4PartnerForTests();
    resetPhase5EcosystemForTests();
  });

  function completePhase1() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More confidence" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });
  }

  function seedForPhase5() {
    const started = new Date("2025-01-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach" },
      goals: [{ text: "Grow visibility", recordedAt: started }],
      learningStyle: {
        primary: "visual",
        secondary: "conversational",
        confidence: 0.7,
        signals: { visual: 6, conversational: 4 },
      },
      adhdPatterns: [{ id: "visibility_resistance", count: 3, lastSeen: started }],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 75,
          ignoredCount: 0,
        },
      ],
      challenges: [{ label: "Visibility", count: 3, lastSeen: started }],
    });
  }

  it("activates after phase 4 depth and sufficient time together", () => {
    completePhase1();
    seedForPhase5();
    expect(
      isPhase5CompanionIntelligenceEcosystemActive(new Date("2026-04-15T10:00:00.000Z")),
    ).toBe(true);
  });

  it("builds a personal operating manual from relationship signals", () => {
    completePhase1();
    seedForPhase5();
    const manual = buildPersonalOperatingManual();
    expect(manual.howILearnBest).toMatch(/visual|conversational/i);
    expect(manual.howIMakeDecisions.length).toBeGreaterThan(0);
    expect(manual.whatCreatesFriction.length).toBeGreaterThan(0);
  });

  it("observes multi-year memory and growth from conversation", () => {
    completePhase1();
    seedForPhase5();
    observePhase5EcosystemTurn({
      userText: "I decided to launch my workshop and I feel more confident",
      now: new Date("2026-04-15T10:00:00.000Z"),
    });
    const manual = buildPersonalOperatingManual();
    expect(manual.howIBuildConfidence.length).toBeGreaterThan(0);
  });

  it("offers predictive opportunities with permission language", () => {
    completePhase1();
    seedForPhase5();
    for (let i = 0; i < 4; i++) {
      observePhase5EcosystemTurn({
        userText: "Thinking about my workshop again",
        now: new Date("2026-04-15T10:00:00.000Z"),
      });
    }
    const offer = maybePredictiveOpportunityOffer({
      now: new Date("2026-04-20T10:00:00.000Z"),
    });
    expect(offer).toMatch(/workshop/i);
    expect(offer).toMatch(/want|optional|pressure/i);
  });

  it("includes ecosystem guidance in chat hints", () => {
    completePhase1();
    seedForPhase5();
    const hint = phase5CompanionIntelligenceEcosystemHintForChat();
    expect(hint).toMatch(/PHASE 5 COMPANION INTELLIGENCE ECOSYSTEM/i);
    expect(hint).toMatch(/transformation/i);
    expect(hint).toMatch(/become the person/i);
  });

  it("formats what we've built together without diagnostic language", () => {
    completePhase1();
    seedForPhase5();
    const text = formatWhatWeveBuiltTogetherForDisplay();
    expect(text).toMatch(/What We've Built Together/i);
    expect(text).not.toMatch(/confidence score|AI|%/i);
  });
});
