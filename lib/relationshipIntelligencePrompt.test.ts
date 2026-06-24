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
  assessRelationshipMemoryConfidence,
  buildRelationshipIntelligencePriorityBlock,
  buildRelationshipPatternSummary,
} from "./relationshipIntelligencePrompt";
import { RELATIONSHIP_QA_PROBE_MESSAGE } from "./relationshipIntelligenceTurnDebug";
import { getCurrentRelationshipPhase } from "./companionRelationshipPhases";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("relationshipIntelligencePrompt", () => {
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

  function seedRelationshipHistory() {
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

    const started = "2025-01-01T10:00:00.000Z";
    patchPhase2DiscoveryState({
      sessionCount: 20,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop", recordedAt: started }],
      learningStyle: { primary: "visual", confidence: 0.7, signals: { visual: 6 } },
      adhdPatterns: [
        { id: "shiny_object_syndrome", count: 3, lastSeen: started },
        { id: "follow_through_challenges", count: 3, lastSeen: started },
        { id: "decision_overload_after_ideas", count: 2, lastSeen: started },
      ],
      challenges: [{ label: "Finishing projects", count: 4, lastSeen: started }],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 80,
          ignoredCount: 0,
        },
      ],
    });

    vi.spyOn(companionStore, "getProjects").mockReturnValue([
      {
        id: "p1",
        name: "Workshop",
        goal: "Launch",
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
      sells: "Workshop",
      goals: ["Launch"],
      idealClient: "Entrepreneurs",
      traits: [],
      tone: "Warm",
      updatedAt: started,
    });
    vi.spyOn(companionStore, "getPrimaryAvatar").mockReturnValue(undefined);
  }

  it("builds priority block with pattern-first instructions for finishing question", () => {
    seedRelationshipHistory();
    const block = buildRelationshipIntelligencePriorityBlock(
      "Why do I keep building new things instead of finishing what I already started?",
    );
    expect(block).toBeTruthy();
    expect(block).toMatch(/HIGHEST PRIORITY/i);
    expect(block).toMatch(/FORBIDDEN FIRST-SENTENCE OPENERS/i);
    expect(block).toMatch(/Observed behaviors/i);
    expect(block).toMatch(/new ideas.*energy/i);
    expect(block).toMatch(/Evidence & pattern history/i);
    expect(block).toMatch(/STARTING NEW VS FINISHING/i);
  });

  it("includes decision-pattern guidance for meta decision questions", () => {
    seedRelationshipHistory();
    const block = buildRelationshipIntelligencePriorityBlock(
      "What patterns have you noticed about how I make decisions?",
    );
    expect(block).toMatch(/DECISION PATTERNS/i);
    expect(block).toMatch(/PASS example opener/i);
    expect(block).toMatch(/FAIL: "You have decision overload/i);
  });

  it("reports sufficient memory confidence when history exists", () => {
    seedRelationshipHistory();
    expect(assessRelationshipMemoryConfidence()).toBe("sufficient");
    expect(buildRelationshipPatternSummary()).toMatch(/shiny object/i);
  });

  it("returns forming (not none) for phase 4+ even with sparse signals", () => {
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

    expect(getCurrentRelationshipPhase().number).toBeGreaterThanOrEqual(4);
    expect(assessRelationshipMemoryConfidence()).not.toBe("none");
    expect(
      buildRelationshipIntelligencePriorityBlock(RELATIONSHIP_QA_PROBE_MESSAGE),
    ).toBeTruthy();
  });
});
