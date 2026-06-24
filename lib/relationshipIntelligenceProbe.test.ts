import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildCompanionSystemPrompt } from "./companionPrompt";
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
import { getCurrentRelationshipPhase } from "./companionRelationshipPhases";
import {
  assessRelationshipMemoryConfidence,
  buildRelationshipIntelligencePriorityBlock,
} from "./relationshipIntelligencePrompt";
import {
  RELATIONSHIP_QA_PROBE_MESSAGE,
  buildRelationshipTurnDebugApiPayload,
  detectGenericOpeningViolation,
} from "./relationshipIntelligenceTurnDebug";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("relationshipIntelligence QA probe", () => {
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
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop", recordedAt: started }],
      learningStyle: { primary: "visual", confidence: 0.7, signals: { visual: 6 } },
      adhdPatterns: [
        { id: "shiny_object_syndrome", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 4, lastSeen: started },
      ],
      challenges: [{ label: "Finishing projects", count: 5, lastSeen: started }],
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
      {
        id: "p2",
        name: "Course draft",
        goal: "Finish course",
        goals: [],
        horizon: "now",
        status: "in-progress",
        nextAction: "Outline",
        color: "#9a6fb0",
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

  it("logs exact probe values for the failing QA question", () => {
    seedRelationshipHistory();

    const priorityBlock = buildRelationshipIntelligencePriorityBlock(
      RELATIONSHIP_QA_PROBE_MESSAGE,
    );
    const systemPrompt = buildCompanionSystemPrompt("today", "text", {});
    const finalSystem = `${priorityBlock}\n\n${systemPrompt}`;
    const apiPayload = buildRelationshipTurnDebugApiPayload({
      relationshipIntelligencePriority: priorityBlock ?? undefined,
      finalSystem,
    });

    const probeReport = {
      memoryConfidence: assessRelationshipMemoryConfidence(),
      relationshipPhase: getCurrentRelationshipPhase().number,
      relationshipPhaseName: getCurrentRelationshipPhase().name,
      relationshipPriorityBlockLength: priorityBlock?.length ?? 0,
      relationshipPriorityBlock: priorityBlock,
      relationshipPriorityNonempty: Boolean(priorityBlock?.trim()),
      priorityPrepended: apiPayload.priorityPrepended,
      finalPromptFirst2000: apiPayload.finalPromptFirst2000,
      finalPromptLast2000: apiPayload.finalPromptLast2000,
      finalPromptTotalLength: apiPayload.finalPromptTotalLength,
    };

    // eslint-disable-next-line no-console
    console.warn("[relationship-intelligence-debug] PROBE REPORT", probeReport);

    expect(probeReport.memoryConfidence).not.toBe("none");
    expect(probeReport.relationshipPriorityBlockLength).toBeGreaterThan(500);
    expect(probeReport.priorityPrepended).toBe(true);
    expect(probeReport.finalPromptFirst2000).toMatch(/RELATIONSHIP INTELLIGENCE — HIGHEST PRIORITY/);
    expect(probeReport.finalPromptFirst2000).toMatch(/RELATIONSHIP RESPONSE CONTRACT — MANDATORY/);
    expect(probeReport.finalPromptFirst2000).toMatch(/REQUIRED OPENING PARAGRAPH/);
    expect(probeReport.relationshipPriorityBlock).toMatch(/FORBIDDEN FIRST-SENTENCE OPENERS/);
  });

  it("detects generic opening violations", () => {
    expect(
      detectGenericOpeningViolation(
        "This is a common experience for entrepreneurs with ADHD.",
      ),
    ).toBeTruthy();
    expect(
      detectGenericOpeningViolation(
        "I've noticed new ideas tend to energize you more than finishing what's in motion.",
      ),
    ).toBeNull();
  });
});
