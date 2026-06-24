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
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";
import { buildRelationshipObservations } from "./relationshipObservationEngine";
import {
  detectTurnIntent,
  getRecentlyUsedObservationIds,
  inferRelevanceTags,
  rankObservationsByRelevance,
  recordUsedObservations,
  resetObservationUsageForTests,
  selectLeadObservation,
} from "./relationshipObservationRelevance";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("relationshipObservationRelevance", () => {
  const now = new Date("2025-06-01T10:00:00.000Z");

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
    resetObservationUsageForTests();
    vi.restoreAllMocks();
    seedHistory();
  });

  function seedHistory() {
    applyPhase1OnboardingTurn({
      messages: [
        { role: "user", content: "Help me build my business and life" },
        { role: "assistant", content: "Tell me about your business?" },
        { role: "user", content: "Coach for entrepreneurs" },
        { role: "assistant", content: "What's in your way?" },
        { role: "user", content: "Overwhelm and finishing projects" },
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
      sessionCount: 25,
      firstSessionAt: started,
      lastSessionAt: started,
      business: { type: "Coach", primaryOffer: "Workshop program" },
      goals: [{ text: "Launch workshop", recordedAt: started }],
      learningStyle: {
        primary: "conversational",
        confidence: 0.75,
        signals: { conversational: 7 },
      },
      strengths: ["connecting ideas across domains"],
      adhdPatterns: [
        { id: "shiny_object_syndrome", count: 4, lastSeen: started },
        { id: "follow_through_challenges", count: 4, lastSeen: started },
      ],
      challenges: [{ label: "Finishing projects", count: 5, lastSeen: started }],
      resources: [
        {
          id: "decision_compass",
          label: "Decision Compass",
          helpfulScore: 85,
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
    vi.spyOn(savedWorkStore, "getSavedWork").mockReturnValue([]);
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

  function topObservationFor(userText: string, workspace?: string | null) {
    const candidates = buildRelationshipObservations(now, {
      userText,
      workspace,
      limit: 7,
    });
    return selectLeadObservation(candidates, { userText, workspace, now });
  }

  it("detects marketing intent for marketing plan questions", () => {
    const intent = detectTurnIntent("Help me develop a marketing plan.");
    expect(intent).toEqual(
      expect.arrayContaining(["marketing", "business_building", "content_creation"]),
    );
  });

  it("uses marketing-related lead observation for marketing plan questions", () => {
    const lead = topObservationFor("Help me create a marketing plan.");
    expect(lead).toBeTruthy();
    const tags = inferRelevanceTags(lead!);
    expect(tags).toEqual(
      expect.arrayContaining(["marketing", "content_creation"]),
    );
    expect(lead!.text).toMatch(/ideas|audience|marketing|focus on one/i);
    expect(lead!.text).not.toMatch(/talking things through/i);
  });

  it("uses systems-related lead observation for SOP questions", () => {
    const lead = topObservationFor("Help me create an SOP for client onboarding.");
    expect(lead).toBeTruthy();
    const tags = inferRelevanceTags(lead!);
    expect(tags).toEqual(expect.arrayContaining(["systems", "operations"]));
    expect(lead!.text).toMatch(/process|visible steps|repeat/i);
    expect(lead!.text).not.toMatch(/talking things through/i);
  });

  it("uses decision-related observations for decision-pattern questions", () => {
    const lead = topObservationFor(
      "What patterns have you noticed about how I make decisions?",
    );
    expect(lead).toBeTruthy();
    const tags = inferRelevanceTags(lead!);
    expect(tags).toContain("decision_making");
    expect(lead!.text).toMatch(/options|path|choose|clarity/i);
  });

  it("uses strength-related observations for strength questions", () => {
    const lead = topObservationFor("What is my biggest strength?");
    expect(lead).toBeTruthy();
    const tags = inferRelevanceTags(lead!);
    expect(tags).toContain("identity");
    expect(lead!.text).toMatch(/stands out|connect|asset|strength/i);
    expect(lead!.text).not.toMatch(/talking things through/i);
  });

  it("uses transformation-related observations for change-over-time questions", () => {
    const lead = topObservationFor("How have I changed over time?");
    expect(lead).toBeTruthy();
    const tags = inferRelevanceTags(lead!);
    expect(tags).toEqual(expect.arrayContaining(["transformation", "wisdom"]));
    expect(lead!.text).toMatch(/grow|shift|stuck|season/i);
  });

  it("applies repeated observation penalty across turns", () => {
    const candidates = buildRelationshipObservations(now, { limit: 7 });
    const first = selectLeadObservation(candidates, {
      userText: "Help me create a marketing plan.",
      now,
    });
    expect(first).toBeTruthy();
    recordUsedObservations([first!.id], now);

    const marketingAgain = topObservationFor("Help me write social posts for my offer.");
    expect(marketingAgain?.id).not.toBe(first?.id);
    expect(getRecentlyUsedObservationIds()).toContain(first!.id);
  });

  it("does not let one observation dominate unrelated questions", () => {
    const marketing = topObservationFor("Help me create a marketing plan.");
    const sop = topObservationFor("Help me create an SOP.");
    const strength = topObservationFor("What is my biggest strength?");

    expect(marketing?.id).not.toBe(sop?.id);
    expect(strength?.id).not.toBe(marketing?.id);
    expect(new Set([marketing?.id, sop?.id, strength?.id]).size).toBe(3);
  });

  it("prioritizes workspace-relevant observations in Plan My Day workspace", () => {
    const candidates = buildRelationshipObservations(now, { limit: 7 });
    const ranked = rankObservationsByRelevance(candidates, {
      userText: "What should I focus on today?",
      workspace: "plan-my-day",
      now,
    });
    const top = ranked[0];
    expect(top).toBeTruthy();
    expect(
      top!.relevanceTags.some((tag) =>
        ["energy", "focus", "time_management", "planning", "follow_through"].includes(tag),
      ),
    ).toBe(true);
  });

  it("builds lead paragraphs with intent-relevant first sentence", () => {
    const marketingLead = buildRelationshipLeadParagraph(
      "Help me create a marketing plan.",
      now,
    );
    const sopLead = buildRelationshipLeadParagraph(
      "Help me create an SOP.",
      now,
    );

    expect(marketingLead).toMatch(/ideas|audience|marketing|focus on one/i);
    expect(sopLead).toMatch(/process|visible steps|repeat/i);
    expect(marketingLead).not.toMatch(/talking things through/i);
    expect(sopLead).not.toMatch(/talking things through/i);
  });
});
