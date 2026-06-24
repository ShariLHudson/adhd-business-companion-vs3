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
import { isPhase7BusinessIntelligenceEcosystemActive } from "./businessIntelligenceEcosystem";
import {
  buildWisdomIntelligenceSummary,
  isPhase9WisdomIntelligenceActive,
  maybeWisdomReflection,
  observeWisdomIntelligenceTurn,
  phase9WisdomIntelligenceHintForChat,
  resetWisdomIntelligenceForTests,
} from "./wisdomIntelligence";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("WisdomIntelligenceValidation", () => {
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
    resetWisdomIntelligenceForTests();
    vi.restoreAllMocks();
  });

  function seedPhase7Base(sessionCount = 25, firstSessionAt = "2025-01-01T10:00:00.000Z") {
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

    patchPhase2DiscoveryState({
      sessionCount,
      firstSessionAt,
      lastSessionAt: firstSessionAt,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop", recordedAt: firstSessionAt }],
      learningStyle: { primary: "visual", confidence: 0.7, signals: { visual: 6 } },
      adhdPatterns: [
        { id: "visibility_resistance", count: 3, lastSeen: firstSessionAt },
        { id: "follow_through_challenges", count: 3, lastSeen: firstSessionAt },
      ],
      challenges: [
        { label: "Overwhelm", count: 3, lastSeen: firstSessionAt },
        { label: "Low energy", count: 2, lastSeen: firstSessionAt },
      ],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 75,
          ignoredCount: 0,
        },
      ],
      energy: {
        completionsByWindow: { morning: 4, afternoon: 1, evening: 1 },
        overwhelmByWindow: { morning: 0, afternoon: 2, evening: 1 },
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
        createdAt: firstSessionAt,
        updatedAt: firstSessionAt,
      },
    ]);
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([
      {
        id: "sw1",
        title: "Workshop Content Draft",
        artifactType: "Blog",
        body: "Teaching content",
        status: "saved",
        savedLocation: "My Work",
        typeFolder: "Content",
        preview: "",
        tags: [],
        sourceWorkspace: "create",
        createdAt: firstSessionAt,
        updatedAt: firstSessionAt,
      },
    ]);
    vi.spyOn(userStrategies, "getUserStrategies").mockReturnValue([]);
    vi.spyOn(companionStore, "getTemplates").mockReturnValue([]);
    vi.spyOn(companionStore, "getSnippets").mockReturnValue([]);
    vi.spyOn(companionStore, "getBrainDumps").mockReturnValue([]);
    vi.spyOn(companionStore, "getBusinessProfile").mockReturnValue({
      role: "Coach",
      sells: "Workshop program",
      goals: ["Launch"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: firstSessionAt,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);
  }

  it("does not activate without sufficient evidence", () => {
    seedPhase7Base(5, "2026-05-01T10:00:00.000Z");
    expect(isPhase9WisdomIntelligenceActive(new Date("2026-05-15T10:00:00.000Z"))).toBe(false);
  });

  it("activates with repeated patterns and lessons", () => {
    seedPhase7Base(25, "2025-01-01T10:00:00.000Z");
    const now = new Date("2025-03-20T10:00:00.000Z");

    observePhase5EcosystemTurn({
      userText: "I learned that smaller steps work better when I'm overwhelmed",
      now,
    });
    observePhase5EcosystemTurn({
      userText: "Another lesson — talking it out beats overthinking",
      now,
    });
    observeWisdomIntelligenceTurn({
      userText: "I realized I should not push when tired",
      now,
    });

    expect(isPhase9WisdomIntelligenceActive(now)).toBe(true);
    const summary = buildWisdomIntelligenceSummary(now);
    expect(summary.items.length).toBeGreaterThanOrEqual(3);
  });

  it("offers practical wisdom reflections without jargon", () => {
    seedPhase7Base(25, "2025-01-01T10:00:00.000Z");
    const now = new Date("2025-03-20T10:00:00.000Z");
    observePhase5EcosystemTurn({
      userText: "I learned that smaller steps work when overwhelmed",
      now,
    });
    observePhase5EcosystemTurn({
      userText: "Lesson learned — clarity comes after talking",
      now,
    });
    observeWisdomIntelligenceTurn({ userText: "I learned to rest when tired", now });

    const reflection = maybeWisdomReflection({
      userText: "I need to work harder and hustle more",
      now,
    });
    expect(reflection).toBeTruthy();
    expect(reflection).not.toMatch(/Phase 9|Wisdom Intelligence|intelligence layer/i);
    expect(reflection).toMatch(/energy|push/i);
  });

  it("includes wisdom intelligence in chat hints", () => {
    seedPhase7Base(25, "2025-01-01T10:00:00.000Z");
    const now = new Date("2025-03-20T10:00:00.000Z");
    observePhase5EcosystemTurn({ userText: "I learned that small steps help", now });
    observePhase5EcosystemTurn({ userText: "Lesson — talk it out first", now });
    observeWisdomIntelligenceTurn({ userText: "I learned to pace myself", now });

    const hint = phase9WisdomIntelligenceHintForChat({ now });
    expect(hint).toMatch(/PHASE 9 WISDOM INTELLIGENCE/i);
    expect(hint).toMatch(/NEVER.*always\/never/i);
  });

  it("reflects shiny-object / finishing pattern when phase 7 is active", () => {
    seedPhase7Base(20, "2025-01-01T10:00:00.000Z");
    const now = new Date("2025-02-15T10:00:00.000Z");
    const reflection = maybeWisdomReflection({
      userText: "Why do I keep building new things instead of finishing what I started?",
      now,
    });
    expect(reflection).toMatch(/new ideas|finishing|smaller scope/i);
  });

  it("provides wisdom hint when phase 7 is active", () => {
    seedPhase7Base(20, "2025-01-01T10:00:00.000Z");
    const now = new Date("2025-01-25T10:00:00.000Z");
    expect(isPhase7BusinessIntelligenceEcosystemActive(now)).toBe(true);
    const hint = phase9WisdomIntelligenceHintForChat({ now });
    expect(hint).toBeTruthy();
    expect(hint).toMatch(/WISDOM/i);
  });
});
