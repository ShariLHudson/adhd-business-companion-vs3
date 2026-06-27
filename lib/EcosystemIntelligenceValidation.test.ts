import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import { patchPhase2DiscoveryState, resetPhase2DiscoveryForTests } from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import { resetPhase5EcosystemForTests } from "./phase5CompanionIntelligenceEcosystem";
import { resetPhase6NetworkForTests } from "./phase6CompanionIntelligenceNetwork";
import { resetPhase7BusinessIntelligenceForTests } from "./businessIntelligenceEcosystem";
import {
  adaptRecommendationToCapacity,
  buildEcosystemIntelligenceSnapshot,
  identifyPurposeReconnection,
  identifyRecoveryRecommendation,
  isPhase11EcosystemIntelligenceActive,
  maybeEcosystemInsight,
  phase11EcosystemIntelligenceHintForChat,
  resetEcosystemIntelligenceForTests,
  validateCapacityAwareness,
  validateCrossDomainInsight,
  validateEnergyInfluence,
  validatePurposeReconnection,
  validateRecoveryDetection,
  validateWholeSystemAccuracy,
} from "./ecosystemIntelligence";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("EcosystemIntelligenceValidation", () => {
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
    resetEcosystemIntelligenceForTests();
    vi.restoreAllMocks();
  });

  function seedEcosystemBase() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm and tired" },
        { role: "assistant", content: "What would progress look like?" },
        { role: "user", content: "More confidence and impact" },
        { role: "assistant", content: "Did I get that right?" },
        { role: "user", content: "Yes" },
      ],
      userText: "Yes",
      lastAssistantText: "Did I get that right?",
    });

    const started = new Date("2025-01-01T10:00:00.000Z").toISOString();
    patchPhase2DiscoveryState({
      sessionCount: 30,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop and teach more", recordedAt: started }],
      strengths: ["Teaching", "Creative thinking"],
      learningStyle: {
        primary: "visual",
        secondary: "conversational",
        confidence: 0.75,
        signals: { visual: 8, conversational: 5 },
      },
      adhdPatterns: [
        { id: "visibility_resistance", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 2, lastSeen: started },
      ],
      challenges: [
        { label: "Poor sleep", count: 3, lastSeen: started },
        { label: "Tired and exhausted", count: 3, lastSeen: started },
        { label: "Overwhelm", count: 4, lastSeen: started },
        { label: "Visibility", count: 3, lastSeen: started },
        { label: "Relationship stress", count: 2, lastSeen: started },
      ],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 80,
          ignoredCount: 0,
        },
      ],
      energy: {
        completionsByWindow: { morning: 5, afternoon: 2, evening: 1 },
        overwhelmByWindow: { morning: 1, afternoon: 3, evening: 2 },
        peakWindow: "morning",
        lowWindow: "afternoon",
      },
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop Launch",
        goal: "Launch workshop",
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
        title: "Workshop content",
        artifactType: "Blog",
        body: "Teaching content",
        status: "saved",
        savedLocation: "My Work",
        typeFolder: "Content",
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
      sells: "Workshop program",
      goals: ["Impact through teaching"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);
  }

  it("Capacity Awareness — recommendations adapt to capacity", () => {
    seedEcosystemBase();
    expect(validateCapacityAwareness(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
    const adapted = adaptRecommendationToCapacity(
      "post more content",
      new Date("2026-06-01T10:00:00.000Z"),
    );
    expect(adapted.length).toBeGreaterThan(10);
  });

  it("Energy Influence — energy affects business behavior narrative", () => {
    seedEcosystemBase();
    expect(validateEnergyInfluence(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
    const snapshot = buildEcosystemIntelligenceSnapshot(new Date("2026-06-01T10:00:00.000Z"));
    expect(snapshot.energy.narrative).toMatch(/energy|capacity|window/i);
  });

  it("Cross-Domain Insight — system recognizes connected patterns", () => {
    seedEcosystemBase();
    expect(validateCrossDomainInsight(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
    const snapshot = buildEcosystemIntelligenceSnapshot(new Date("2026-06-01T10:00:00.000Z"));
    expect(snapshot.interconnections.length).toBeGreaterThanOrEqual(2);
  });

  it("Recovery Detection — companion recommends recovery when appropriate", () => {
    seedEcosystemBase();
    const recovery = identifyRecoveryRecommendation(new Date("2026-06-01T10:00:00.000Z"));
    expect(validateRecoveryDetection(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
    expect(recovery === null || /recovery|capacity/i.test(recovery)).toBe(true);
  });

  it("Purpose Reconnection — reconnects users to meaningful goals", () => {
    seedEcosystemBase();
    expect(validatePurposeReconnection(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
    const insight = maybeEcosystemInsight({
      userText: "I lost my motivation and wonder why I'm doing this",
      now: new Date("2026-06-01T10:00:00.000Z"),
    });
    expect(insight).toMatch(/purpose|why|reconnect|resonates/i);
  });

  it("Whole-System Accuracy — insights require evidence levels", () => {
    seedEcosystemBase();
    expect(validateWholeSystemAccuracy(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
  });

  it("activates phase 11 when cross-domain intelligence is sufficient", () => {
    seedEcosystemBase();
    expect(isPhase11EcosystemIntelligenceActive(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
  });

  it("includes ecosystem intelligence in chat hints", () => {
    seedEcosystemBase();
    const hint = phase11EcosystemIntelligenceHintForChat({
      userText: "I'm exhausted and visibility feels impossible",
    });
    expect(hint).toMatch(/PHASE 11 ECOSYSTEM INTELLIGENCE/i);
    expect(hint).toMatch(/whole life|whole person|capacity/i);
    expect(hint).not.toMatch(/work harder/i);
  });
});
