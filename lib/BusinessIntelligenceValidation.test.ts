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
import {
  buildBusinessIntelligenceSnapshot,
  businessStageAwareRecommendation,
  identifyContentReuse,
  identifyOfferConfusion,
  identifyRevenueOpportunity,
  identifySalesAvoidanceSupport,
  identifyVisibilityBottleneck,
  isPhase7BusinessIntelligenceEcosystemActive,
  phase7BusinessIntelligenceHintForChat,
  resetPhase7BusinessIntelligenceForTests,
} from "./businessIntelligenceEcosystem";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("BusinessIntelligenceValidation", () => {
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

  function seedPhase7Base() {
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
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Grow revenue", recordedAt: started }],
      learningStyle: {
        primary: "visual",
        confidence: 0.7,
        signals: { visual: 6 },
      },
      adhdPatterns: [{ id: "visibility_resistance", count: 3, lastSeen: started }],
      challenges: [
        { label: "Offer confusion", count: 3, lastSeen: started },
        { label: "Visibility", count: 3, lastSeen: started },
      ],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 75,
          ignoredCount: 0,
        },
      ],
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop Launch",
        goal: "Launch workshop offer",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Outline",
        color: "#1e4f4f",
        createdAt: started,
        updatedAt: started,
      },
      {
        id: "p2",
        name: "Coaching Package",
        goal: "Refine coaching offer",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Pricing",
        color: "#9a6fb0",
        createdAt: started,
        updatedAt: started,
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([
      {
        id: "sw1",
        title: "Workshop Content Draft",
        artifactType: "Blog post",
        body: "Teaching content for workshop",
        status: "saved",
        savedLocation: "My Work > Content",
        typeFolder: "Content",
        preview: "",
        tags: ["workshop"],
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
      sells: "Workshop + Coaching",
      goals: ["Grow revenue"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);
  }

  it("Offer Clarity — identifies offer confusion", () => {
    seedPhase7Base();
    const insight = identifyOfferConfusion(new Date("2026-05-01T10:00:00.000Z"));
    expect(insight).toMatch(/several offers|simplifying/i);
  });

  it("Revenue Opportunity — surfaces revenue opportunity", () => {
    seedPhase7Base();
    const snapshot = buildBusinessIntelligenceSnapshot(new Date("2026-05-01T10:00:00.000Z"));
    expect(snapshot.revenue.drivers.length).toBeGreaterThan(0);
    const insight = identifyRevenueOpportunity(new Date("2026-05-01T10:00:00.000Z"));
    expect(insight === null || /revenue|opportunity/i.test(insight)).toBe(true);
  });

  it("Content Reuse — discovers reusable content", () => {
    seedPhase7Base();
    const insight = identifyContentReuse(
      new Date("2026-05-01T10:00:00.000Z"),
      "I need to write content for my workshop",
    );
    expect(insight).toMatch(/Workshop Content Draft|reuse|repurpos/i);
  });

  it("Visibility Bottleneck — identifies visibility as constraint", () => {
    seedPhase7Base();
    const insight = identifyVisibilityBottleneck();
    expect(insight).toMatch(/visibility|friction|stalled/i);
  });

  it("Sales Avoidance — recognizes avoidance and recommends action", () => {
    seedPhase7Base();
    const insight = identifySalesAvoidanceSupport(
      "I keep putting off the sales call and never followed up",
      [{ role: "user", content: "I keep putting off the sales call" }],
    );
    expect(insight).toMatch(/call|follow|pressure/i);
  });

  it("Business Stage Awareness — adjusts recommendations by maturity", () => {
    seedPhase7Base();
    const rec = businessStageAwareRecommendation(new Date("2026-05-01T10:00:00.000Z"));
    expect(rec).toMatch(/stage|Focus now/i);
  });

  it("activates phase 7 when business context and graph exist", () => {
    seedPhase7Base();
    expect(isPhase7BusinessIntelligenceEcosystemActive(new Date("2026-05-01T10:00:00.000Z"))).toBe(
      true,
    );
  });

  it("includes business intelligence guidance in chat hints", () => {
    seedPhase7Base();
    const hint = phase7BusinessIntelligenceHintForChat({
      userText: "What should I focus on in my business?",
    });
    expect(hint).toMatch(/PHASE 7 BUSINESS INTELLIGENCE ECOSYSTEM/i);
    expect(hint).toMatch(/understands my business/i);
    expect(hint).toMatch(/What should I work on next/i);
  });
});
