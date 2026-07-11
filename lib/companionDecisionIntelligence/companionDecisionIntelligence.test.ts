import { describe, expect, it } from "vitest";
import { arbitrateConversationRouting } from "@/lib/conversationStabilization";
import {
  applyCompanionDecisionGuidance,
  evaluateCompanionDecision,
} from "./index";

describe("Companion Decision Intelligence", () => {
  it("research → one step, no feature dump", () => {
    const guidance = evaluateCompanionDecision({
      userText: "Research pricing for my music library",
      goal: "research",
      winningCapability: "research",
    });
    expect(guidance.needType).toBe("research");
    expect(guidance.maxChoices).toBe(1);
    expect(guidance.suppressFeatureDump).toBe(true);
    expect(guidance.allowDiscoveryInvite).toBe(false);
    expect(guidance.responseHint).toMatch(/one step only/i);
    expect(guidance.responseHint).not.toMatch(/you could use Research/i);
  });

  it("fatigue → encouragement with optional estate invite", () => {
    const guidance = evaluateCompanionDecision({
      userText: "I've been working for hours",
      goal: "general_conversation",
    });
    expect(guidance.needType).toBe("encouragement");
    expect(guidance.allowEstateInvite).toBe(true);
    expect(guidance.smallestNextStep).toMatch(/acknowledge/i);
  });

  it("locked session blocks discovery invites", () => {
    const arbitration = arbitrateConversationRouting({
      userText: "call the dentist",
      activeWorkflow: "brain-dump",
      workspace: "brain-dump",
    });
    const guidance = evaluateCompanionDecision({
      userText: "call the dentist",
      goal: arbitration.goal,
      arbitration,
      winningCapability: "capture",
    });
    expect(guidance.allowDiscoveryInvite).toBe(false);
    expect(guidance.progressiveGuidanceOnly).toBe(true);
  });

  it("applyGuidance merges hints without exposing software", () => {
    const result = applyCompanionDecisionGuidance(
      {
        category: "direct_action",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint: "RESEARCH: open workspace",
        localReply: "Let's dig into pricing.",
        pendingAction: null,
        toolSuggestion: null,
        workspaceOffer: null,
        intentRouting: null,
      },
      {
        userText: "Research pricing",
        goal: "research",
        winningCapability: "research",
      },
    );
    expect(result.responseHint).toMatch(/COMPANION DECISION/i);
    expect(result.responseHint).toMatch(/FINAL VOICE CHECK/i);
    expect(result.localReply).toBe("Let's dig into pricing.");
  });
});
