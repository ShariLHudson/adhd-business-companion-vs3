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
import { buildRelationshipIntelligencePriorityBlock } from "./relationshipIntelligencePrompt";
import {
  buildRelationshipLeadParagraph,
  buildRelationshipResponseContractBlock,
  detectBannedRelationshipOpener,
  detectRelationshipContractViolation,
  enforceRelationshipResponse,
  extractFirstParagraph,
  isRelationshipResponseContractActive,
  replaceFirstResponseParagraph,
} from "./relationshipResponseContract";
import * as companionStore from "./companionStore";
import * as savedWorkStore from "./savedWorkStore";
import * as userStrategies from "./userStrategies";

describe("relationshipResponseContract", () => {
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

  function seedHistory() {
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

    const started = "2024-06-01T10:00:00.000Z";
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

  it("activates contract when confidence is forming or sufficient", () => {
    seedHistory();
    expect(isRelationshipResponseContractActive("sufficient")).toBe(true);
    expect(isRelationshipResponseContractActive("forming")).toBe(true);
    expect(isRelationshipResponseContractActive("none")).toBe(false);
  });

  it("builds lead paragraph from top observations with required opener", () => {
    seedHistory();
    const lead = buildRelationshipLeadParagraph(
      "Why do I keep building new things instead of finishing?",
      new Date("2025-06-01T10:00:00.000Z"),
    );
    expect(lead).toBeTruthy();
    expect(lead).toMatch(/^I've noticed/i);
    expect(lead).toMatch(/new ideas|finishing|unfinished/i);
    expect(lead).not.toMatch(/shiny object syndrome/i);
  });

  it("injects mandatory contract block into priority prompt", () => {
    seedHistory();
    const block = buildRelationshipIntelligencePriorityBlock(
      "Why do I keep building new things instead of finishing?",
      new Date("2025-06-01T10:00:00.000Z"),
    );
    expect(block).toMatch(/RELATIONSHIP RESPONSE CONTRACT — MANDATORY/);
    expect(block).toMatch(/REQUIRED OPENING PARAGRAPH/);
    expect(block).toMatch(/Paragraph 1 — Observed behavior/);
    expect(block).toMatch(/Paragraph 2 — Reflection/);
    expect(block).toMatch(/Paragraph 3 — Guidance/);
    expect(block).toMatch(/I've noticed/i);
  });

  it("detects contract violation for banned generic opener", () => {
    seedHistory();
    const violation = detectRelationshipContractViolation(
      "This is common for entrepreneurs with ADHD. You might try focusing on one project.\n\nReflection here.\n\nTry a smaller step.",
      "sufficient",
    );
    expect(violation).toBeTruthy();
    expect(violation!.reason).toMatch(/Banned opener/i);
    expect(extractFirstParagraph(violation!.firstParagraph)).toBeTruthy();
  });

  it("detects contract violation when structure has fewer than 3 paragraphs", () => {
    seedHistory();
    const violation = detectRelationshipContractViolation(
      "I've noticed new ideas energize you more than finishing what's in motion.",
      "sufficient",
    );
    expect(violation).toBeTruthy();
    expect(violation!.reason).toMatch(/3\+ paragraphs/i);
  });

  it("passes valid 3-paragraph contract response", () => {
    seedHistory();
    const violation = detectRelationshipContractViolation(
      [
        "I've noticed new ideas tend to create energy quickly for you, while finishing requires deciding something is ready.",
        "That doesn't look like a lack of commitment — it looks more like a tension between possibility and completion.",
        "Shrinking the scope of what's already started may create more momentum than opening a new project.",
      ].join("\n\n"),
      "sufficient",
    );
    expect(violation).toBeNull();
  });

  it("contract block includes forbidden and required opener lists", () => {
    seedHistory();
    const contract = buildRelationshipResponseContractBlock(
      "What patterns have you noticed about how I make decisions?",
      new Date("2025-06-01T10:00:00.000Z"),
    );
    expect(contract).toMatch(/It seems like/);
    expect(contract).toMatch(/I've noticed/);
    expect(contract).toMatch(/From our conversations/);
  });

  describe("server-side enforcement (P0.1 / P0.2)", () => {
    const lead =
      "I've noticed finishing often competes with starting something new — not because you lack commitment, but because open loops pull attention.";

    const failedUiResponse =
      "It sounds like you're reflecting on your tendency to start new projects instead of completing the ones you've begun. This is a common pattern.\n\nThat tension between novelty and completion is real.\n\nTry shrinking scope on what's already in motion.";

    it("detects 'It sounds like you're reflecting...' as violation", () => {
      expect(detectBannedRelationshipOpener(failedUiResponse)).toBeTruthy();
      const violation = detectRelationshipContractViolation(failedUiResponse, "sufficient");
      expect(violation?.reason).toMatch(/Banned opener/i);
    });

    it("detects 'It sounds like...' as violation", () => {
      expect(detectBannedRelationshipOpener("It sounds like this is hard.")).toBeTruthy();
    });

    it("detects 'This can often happen...' as violation", () => {
      expect(
        detectBannedRelationshipOpener(
          "This can often happen when you have too many ideas.\n\nReflection.\n\nGuidance.",
        ),
      ).toBeTruthy();
    });

    it("rewrites paragraph 1 when sufficient confidence and contract violated", () => {
      const bad =
        "It sounds like you're juggling a lot.\n\nThat tension is real.\n\nTry shrinking scope on one project.";
      const result = enforceRelationshipResponse({
        response: bad,
        relationshipLeadParagraph: lead,
        memoryConfidence: "sufficient",
      });
      expect(result.rewritten).toBe(true);
      expect(result.enforcementRan).toBe(true);
      expect(result.message).toMatch(/^I've noticed finishing often/);
      expect(result.message).toMatch(/That tension is real/);
      expect(result.message).toMatch(/Try shrinking scope/);
      expect(extractFirstParagraph(result.message)).toBe(lead);
      expect(result.message).not.toMatch(/^It sounds like/i);
    });

    it("rewrites when memoryConfidence is forming (P0.2)", () => {
      const result = enforceRelationshipResponse({
        response: failedUiResponse,
        relationshipLeadParagraph: lead,
        memoryConfidence: "forming",
      });
      expect(result.rewritten).toBe(true);
      expect(result.message).toMatch(/^I've noticed finishing often/);
      expect(result.message).not.toBe(failedUiResponse);
    });

    it("rewrites exact failed UI response when sufficient", () => {
      const result = enforceRelationshipResponse({
        response: failedUiResponse,
        relationshipLeadParagraph: lead,
        memoryConfidence: "sufficient",
      });
      expect(result.rewritten).toBe(true);
      expect(result.message.startsWith(lead)).toBe(true);
      expect(result.message).toContain("That tension between novelty and completion is real.");
    });

    it("does not rewrite when confidence is none", () => {
      const result = enforceRelationshipResponse({
        response: failedUiResponse,
        relationshipLeadParagraph: lead,
        memoryConfidence: "none",
      });
      expect(result.rewritten).toBe(false);
      expect(result.enforcementRan).toBe(false);
      expect(result.message).toBe(failedUiResponse);
    });

    it("does not rewrite when response already complies", () => {
      const good = [
        lead,
        "That doesn't look like a lack of commitment.",
        "Shrink scope on what's in motion.",
      ].join("\n\n");
      const result = enforceRelationshipResponse({
        response: good,
        relationshipLeadParagraph: lead,
        memoryConfidence: "sufficient",
      });
      expect(result.rewritten).toBe(false);
      expect(result.message).toBe(good);
    });

    it("returns rewritten text as message (API body), not just logs", () => {
      const bad = "It sounds like you're reflecting on your tendency.";
      const result = enforceRelationshipResponse({
        response: bad,
        relationshipLeadParagraph: lead,
        memoryConfidence: "forming",
      });
      expect(result.message).toBe(lead);
      expect(result.message).not.toContain("It sounds like");
    });

    it("replaceFirstResponseParagraph keeps remainder paragraphs", () => {
      const replaced = replaceFirstResponseParagraph(
        "It sounds like X.\n\nReflection para.\n\nGuidance para.",
        lead,
      );
      expect(replaced).toBe(`${lead}\n\nReflection para.\n\nGuidance para.`);
    });
  });
});
