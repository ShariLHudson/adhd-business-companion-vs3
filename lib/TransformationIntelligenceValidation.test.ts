import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPhase1OnboardingTurn,
  resetPhase1OnboardingForTests,
} from "./phase1Onboarding";
import { patchPhase2DiscoveryState, resetPhase2DiscoveryForTests } from "./phase2ProgressiveDiscovery";
import { resetPhase3RelationshipForTests } from "./phase3AdaptiveRelationship";
import { resetPhase4PartnerForTests } from "./phase4BusinessOperatingPartner";
import {
  observePhase5EcosystemTurn,
  resetPhase5EcosystemForTests,
} from "./phase5CompanionIntelligenceEcosystem";
import { resetPhase6NetworkForTests } from "./phase6CompanionIntelligenceNetwork";
import { resetPhase7BusinessIntelligenceForTests } from "./businessIntelligenceEcosystem";
import { resetEcosystemIntelligenceForTests } from "./ecosystemIntelligence";
import {
  buildTransformationIntelligenceSnapshot,
  isPhase10TransformationIntelligenceActive,
  maybeTransformationReflection,
  phase10TransformationIntelligenceHintForChat,
  resetTransformationIntelligenceForTests,
  validateBusinessMaturity,
  validateConfidenceEvolution,
  validateLegacyAccuracy,
  validatePatternImprovement,
  validateStrengthEmergence,
  validateVisibilityGrowth,
} from "./transformationIntelligence";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("TransformationIntelligenceValidation", () => {
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
    resetTransformationIntelligenceForTests();
    vi.restoreAllMocks();
  });

  function seedTransformationBase() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Visibility and confidence" },
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
        confidence: 0.75,
        signals: { visual: 8 },
      },
      adhdPatterns: [
        { id: "visibility_resistance", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 3, lastSeen: started },
      ],
      challenges: [
        { label: "Visibility", count: 4, lastSeen: started },
        { label: "Overwhelm", count: 3, lastSeen: started },
        { label: "Confidence", count: 3, lastSeen: started },
      ],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 80,
          ignoredCount: 0,
        },
      ],
    });

    const growthTurns = [
      "I'm confident and proud — finished and completed the workshop project",
      "posted visibility marketing and published content",
      "decided faster today with more clarity",
      "visible and posted again",
      "finished follow through and shipped it",
    ];
    for (const text of growthTurns) {
      observePhase5EcosystemTurn({ userText: text, now: new Date("2026-06-01T10:00:00.000Z") });
    }

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
      {
        id: "p2",
        name: "Coaching Program",
        goal: "Grow program",
        goals: [],
        horizon: "now",
        status: "completed",
        nextAction: "Done",
        color: "#9a6fb0",
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

  it("Visibility Growth™ — system recognizes long-term growth", () => {
    seedTransformationBase();
    expect(validateVisibilityGrowth(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
  });

  it("Confidence Evolution™ — system identifies confidence changes", () => {
    seedTransformationBase();
    expect(validateConfidenceEvolution(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
  });

  it("Business Maturity™ — system recognizes business progression", () => {
    seedTransformationBase();
    expect(validateBusinessMaturity(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
  });

  it("Pattern Improvement™ — system identifies reduced friction patterns", () => {
    seedTransformationBase();
    expect(validatePatternImprovement(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
  });

  it("Strength Emergence™ — system discovers strengths accurately", () => {
    seedTransformationBase();
    expect(validateStrengthEmergence(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
  });

  it("Legacy Accuracy™ — transformation claims require evidence", () => {
    seedTransformationBase();
    expect(validateLegacyAccuracy(new Date("2026-06-01T10:00:00.000Z"))).toBe(true);
  });

  it("activates phase 10 when transformation evidence is sufficient", () => {
    seedTransformationBase();
    expect(isPhase10TransformationIntelligenceActive(new Date("2026-06-01T10:00:00.000Z"))).toBe(
      true,
    );
  });

  it("includes transformation intelligence in chat hints", () => {
    seedTransformationBase();
    const hint = phase10TransformationIntelligenceHintForChat({
      userText: "I'm proud of my progress and how far I've come",
    });
    expect(hint).toMatch(/PHASE 10 LEGACY & TRANSFORMATION/i);
    expect(hint).toMatch(/then\/now|who they were|transformation/i);
    const reflection = maybeTransformationReflection({
      userText: "I'm proud of how far I've come with visibility",
      now: new Date("2026-06-01T10:00:00.000Z"),
    });
    expect(reflection).toMatch(/visibility|come a long way|progress/i);
  });

  it("builds a transformation snapshot with origin and timeline", () => {
    seedTransformationBase();
    const snap = buildTransformationIntelligenceSnapshot(new Date("2026-06-01T10:00:00.000Z"));
    expect(snap.origin.primaryChallenge).toMatch(/visibility|confidence/i);
    expect(snap.thenNow.length).toBeGreaterThanOrEqual(2);
    expect(snap.timeline.length).toBeGreaterThan(0);
  });
});
