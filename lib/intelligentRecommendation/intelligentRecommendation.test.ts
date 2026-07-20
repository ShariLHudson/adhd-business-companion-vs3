import { describe, expect, it } from "vitest";
import { createEmptyEventSections } from "@/lib/eventsIntelligence/eventSections";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import {
  MAX_SECONDARY_RECOMMENDATIONS,
  recommendForEventWorkspace,
  rankAndLimitRecommendations,
  type IntelligentRecommendation,
} from "./index";

function foundationWorkshop(): EventRecord {
  const sections = createEmptyEventSections();
  for (const [id, content] of [
    ["purpose", "Introduce the ADHD Business Platform"],
    ["audience", "Business owners with ADHD"],
    ["outcomes", "Leave with a clear next step"],
  ] as const) {
    const s = sections.find((x) => x.id === id);
    if (s) {
      s.content = content;
      s.status = "confirmed";
    }
  }
  return {
    id: "evt-rec-1",
    title: "ADHD Business Platform Workshop",
    eventType: "workshop",
    eventTypeLabel: "Workshop",
    purpose: "Introduce the ADHD Business Platform",
    audience: "Business owners with ADHD",
    outcomes: "Leave with a clear next step",
    format: "in_person",
    dates: "One day",
    venue: "",
    budget: "",
    lifecyclePhase: "discovery",
    runtimeState: "DISCOVERY",
    sections,
    tasks: [],
    milestones: [],
    decisions: [],
    dependencies: [],
    owners: [],
    nextAction: "Sketch a simple agenda",
    activeQuestionId: null,
    conversationContext: "I want to plan a workshop",
    projectHomeId: null,
    companionProjectId: null,
    canonicalWorkId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("060 — Intelligent Recommendation Engine", () => {
  it("always provides one primary and at most three secondary", () => {
    const pack = recommendForEventWorkspace(foundationWorkshop());
    expect(pack.primary).toBeTruthy();
    expect(pack.primary.title).toMatch(/agenda/i);
    expect(pack.primary.confidence).toMatch(/high|very_high/);
    expect(pack.secondary.length).toBeLessThanOrEqual(
      MAX_SECONDARY_RECOMMENDATIONS,
    );
    expect(pack.secondary.length).toBeLessThanOrEqual(3);
  });

  it("respects dependency unlocking — agenda before arbitrary assets", () => {
    const pack = recommendForEventWorkspace(foundationWorkshop());
    expect(pack.primary.unlocks.length).toBeGreaterThan(0);
    expect(pack.primary.reason.toLowerCase()).toMatch(/depend|backbone|foundation/);
    expect(pack.primary.conversationLine).not.toMatch(/step\s*\d/i);
    expect(pack.primary.conversationLine).not.toMatch(
      /what would you like to (do|create) next/i,
    );
  });

  it("suppresses low-confidence recommendations from display", () => {
    const many: IntelligentRecommendation[] = [
      {
        id: "a",
        title: "Primary build",
        category: "build_something",
        confidence: "very_high",
        reason: "Unlocks work",
        estimatedEffort: null,
        impact: "high",
        unlocks: ["B"],
        actionLabel: "Continue",
        conversationLine: "Let's build this.",
        source: "dependency_engine",
        score: 100,
      },
      {
        id: "b",
        title: "Maybe later",
        category: "build_something",
        confidence: "low",
        reason: "Optional",
        estimatedEffort: null,
        impact: "low",
        unlocks: [],
        actionLabel: "Continue",
        conversationLine: "Maybe later.",
        source: "capability_registry",
        score: 50,
      },
      {
        id: "c",
        title: "Hidden",
        category: "build_something",
        confidence: "very_low",
        reason: "Noise",
        estimatedEffort: null,
        impact: "low",
        unlocks: [],
        actionLabel: "Continue",
        conversationLine: "Skip.",
        source: "capability_registry",
        score: 5,
      },
    ];
    const pack = rankAndLimitRecommendations(many);
    expect(pack.primary.title).toBe("Primary build");
    expect(pack.secondary.every((s) => s.confidence !== "low")).toBe(true);
    expect(pack.suppressed.some((s) => s.id === "b" || s.id === "c")).toBe(
      true,
    );
  });

  it("enforces ADHD limits even when many candidates arrive", () => {
    const flood: IntelligentRecommendation[] = Array.from(
      { length: 20 },
      (_, i) => ({
        id: `r-${i}`,
        title: `Option ${i}`,
        category: "build_something" as const,
        confidence: "high" as const,
        reason: "Candidate",
        estimatedEffort: null,
        impact: "medium" as const,
        unlocks: [],
        actionLabel: "Continue",
        conversationLine: `Option ${i}`,
        source: "capability_registry" as const,
        score: 80 - i,
      }),
    );
    const pack = rankAndLimitRecommendations(flood);
    expect(pack.secondary).toHaveLength(MAX_SECONDARY_RECOMMENDATIONS);
    expect(1 + pack.secondary.length).toBeLessThanOrEqual(4);
  });
});
