import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyPhase1OnboardingTurn, resetPhase1OnboardingForTests } from "./phase1Onboarding";
import {
  patchPhase2DiscoveryState,
  resetPhase2DiscoveryForTests,
} from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import {
  getCurrentRelationshipPhase,
  RELATIONSHIP_PHASES,
} from "./companionRelationshipPhases";

describe("companionRelationshipPhases", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
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

  it("registers all ten relationship phases", () => {
    expect(RELATIONSHIP_PHASES).toHaveLength(10);
    expect(RELATIONSHIP_PHASES[4]?.name).toBe("Companion Intelligence Ecosystem");
    expect(RELATIONSHIP_PHASES[4]?.status).toBe("active");
  });

  it("starts at phase 1 before onboarding completes", () => {
    expect(getCurrentRelationshipPhase().number).toBe(1);
  });

  it("advances to phase 5 when ecosystem criteria are met", () => {
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

    expect(getCurrentRelationshipPhase().number).toBe(5);
  });
});
