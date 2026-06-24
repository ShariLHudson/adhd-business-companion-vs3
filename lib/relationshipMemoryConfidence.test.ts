import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import {
  patchPhase2DiscoveryState,
  resetPhase2DiscoveryForTests,
} from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import { resetPhase6NetworkForTests } from "./phase6CompanionIntelligenceNetwork";
import { resetPhase7BusinessIntelligenceForTests } from "./businessIntelligenceEcosystem";
import { getCurrentRelationshipPhase } from "./companionRelationshipPhases";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";
import {
  assessRelationshipMemoryConfidence,
  auditRelationshipConfidenceInputs,
  auditRelationshipObservations,
} from "./relationshipMemoryConfidence";

describe("relationshipMemoryConfidence", () => {
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
    resetPhase6NetworkForTests();
    resetPhase7BusinessIntelligenceForTests();
    vi.restoreAllMocks();
  });

  function seedPhase4SparseSignals() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach" },
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
    const started = "2024-06-01T10:00:00.000Z";
    patchPhase2DiscoveryState({
      sessionCount: 30,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Program" },
      goals: [{ text: "Grow", recordedAt: started }],
      learningStyle: { primary: "visual", confidence: 0.6, signals: { visual: 5 } },
    });
    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Client work",
        goal: "Grow",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Plan",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([
      {
        id: "sw1",
        title: "Notes",
        artifactType: "Document",
        body: "x",
        status: "saved",
        savedLocation: "My Work",
        typeFolder: "Documents",
        preview: "",
        tags: [],
        sourceWorkspace: "create",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue({
      role: "Coach",
      sells: "",
      goals: [],
      idealClient: "",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);
  }

  it("returns none when no observations and no meaningful history", () => {
    const audit = auditRelationshipConfidenceInputs();
    expect(audit.relationshipPhase).toBeLessThanOrEqual(2);
    if (audit.observationsCount === 0 && audit.signalCount === 0) {
      expect(assessRelationshipMemoryConfidence()).toBe("none");
      expect(audit.legacyResult).toBe("none");
    } else {
      expect(assessRelationshipMemoryConfidence()).not.toBe("none");
    }
  });

  it("never returns none for phase 4+ even with sparse signals", () => {
    seedPhase4SparseSignals();
    expect(getCurrentRelationshipPhase().number).toBeGreaterThanOrEqual(4);
    const audit = auditRelationshipConfidenceInputs();
    expect(audit.result).not.toBe("none");
    expect(audit.resultReason).toMatch(/phase >= 4 floor|observations exist|sessions=/i);
  });

  it("floors to forming when phase1 flag missing but phase2 history exists", () => {
    const started = "2024-01-01T10:00:00.000Z";
    patchPhase2DiscoveryState({
      sessionCount: 12,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Consultant", primaryOffer: "Advisory" },
      goals: [{ text: "Stabilize revenue", recordedAt: started }],
      adhdPatterns: [
        { id: "shiny_object_syndrome", count: 2, lastSeen: started },
      ],
      challenges: [{ label: "Finishing", count: 2, lastSeen: started }],
    });

    const audit = auditRelationshipConfidenceInputs();
    expect(audit.phase1Complete).toBe(false);
    expect(audit.legacyResult).toBe("none");
    expect(audit.result).not.toBe("none");
    expect(audit.wouldHaveBeenNone).toBe(true);
    expect(audit.noneReason).toMatch(/phase1.*incomplete/i);
  });

  it("reports sufficient when rich history and observations exist", () => {
    seedPhase4SparseSignals();
    const started = "2024-06-01T10:00:00.000Z";
    patchPhase2DiscoveryState({
      sessionCount: 30,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Program" },
      goals: [{ text: "Grow", recordedAt: started }],
      learningStyle: { primary: "visual", confidence: 0.7, signals: { visual: 6 } },
      adhdPatterns: [
        { id: "shiny_object_syndrome", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 3, lastSeen: started },
      ],
      challenges: [{ label: "Finishing", count: 4, lastSeen: started }],
      strengths: ["Clarity under pressure"],
    });

    const audit = auditRelationshipConfidenceInputs();
    expect(audit.observationsCount).toBeGreaterThan(0);
    expect(audit.result).toBe("sufficient");
    const obs = auditRelationshipObservations();
    expect(obs.mismatch).toBe(false);
    expect(obs.topObservations.length).toBeGreaterThan(0);
  });
});
