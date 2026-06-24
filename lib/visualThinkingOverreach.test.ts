import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { isKnowledgeQuestion } from "./knowledgeIntelligence";
import { recommendStrategyFromUserText } from "./strategyIntelligence";
import {
  isVisualThinkingAllowListRequest,
  shouldBlockVisualThinking,
  shouldOfferVisualThinkingRecommendation,
} from "./visualThinkingOverreach";

function frictionless(userText: string) {
  return resolveFrictionlessAction({ userText, currentTurn: 1 });
}

describe("visualThinkingOverreach (P0.20.2)", () => {
  describe("block list — never Visual Thinking", () => {
    const blocked = [
      "I keep putting off my sales calls",
      "I avoid follow-up",
      "I can't get started",
      "I'm overwhelmed",
      "I have too many ideas",
      "I don't know where to begin",
      "I need motivation",
      "I keep procrastinating",
      "Why do I avoid sales calls?",
      "I know what to do but I won't do it",
      "I keep putting this off",
      "I'm anxious about outreach",
    ];

    it.each(blocked)('"%s"', (input) => {
      expect(shouldBlockVisualThinking(input)).toBe(true);
      expect(shouldOfferVisualThinkingRecommendation(input)).toBe(false);
      const decision = frictionless(input);
      expect(decision.immediateVisualOpen).toBeUndefined();
      expect(decision.pendingAction?.type).not.toBe("visual_recommendation");
      expect(decision.pendingAction?.type).not.toBe("visual_thinking_menu");
      expect(decision.workspaceOffer?.section).not.toBe("visual-focus");
      if (typeof decision.localReply === "string") {
        expect(decision.localReply).not.toMatch(/Visual Thinking can help/i);
      }
    });
  });

  describe("strategy priority for sales avoidance", () => {
    it("sales calls → strategy intelligence, not visual menu", () => {
      const input = "I keep putting off my sales calls";
      expect(recommendStrategyFromUserText(input)?.strategyId).toBeTruthy();
      expect(frictionless(input).pendingAction?.type).not.toBe(
        "visual_recommendation",
      );
    });
  });

  describe("allow list — available visual requests open", () => {
    const allowed = [
      "Create a mind map",
      "Visualize this",
      "Build a decision tree",
      "Show this visually",
      "Map this out for my launch",
      "Open a mind map",
    ];

    it.each(allowed)('"%s"', (input) => {
      expect(isVisualThinkingAllowListRequest(input)).toBe(true);
      const decision = frictionless(input);
      expect(
        decision.immediateVisualOpen ?? decision.pendingAction?.type,
      ).toBeTruthy();
    });
  });

  describe("allow list — planned types blocked from open", () => {
    const planned = [
      "Create a flowchart",
      "Make a diagram",
      "Turn this into a process flow",
      "Create a hierarchy",
    ];

    it.each(planned)('"%s"', (input) => {
      expect(isVisualThinkingAllowListRequest(input)).toBe(true);
      const decision = frictionless(input);
      expect(decision.immediateVisualOpen).toBeUndefined();
      if (typeof decision.localReply === "string") {
        expect(decision.localReply).toMatch(/aren't fully built/i);
      }
    });
  });

  describe("learn questions not visual recommendation", () => {
    it("how is a flowchart used", () => {
      const input = "How is a flowchart used?";
      expect(isKnowledgeQuestion(input)).toBe(true);
      expect(shouldOfferVisualThinkingRecommendation(input)).toBe(false);
      expect(frictionless(input).pendingAction?.type).not.toBe(
        "visual_recommendation",
      );
    });
  });

  describe("decision compass not visual recommendation", () => {
    it("should I launch course — no visual menu", () => {
      const input = "Should I launch the course or the membership?";
      expect(shouldOfferVisualThinkingRecommendation(input)).toBe(false);
      expect(frictionless(input).pendingAction?.type).not.toBe(
        "visual_recommendation",
      );
    });
  });

  describe("positive goal recommendations still work", () => {
    it("course launch still gets visual menu", () => {
      const input = "I want to launch a course";
      expect(shouldOfferVisualThinkingRecommendation(input)).toBe(true);
      expect(frictionless(input).pendingAction?.type).toBe("visual_recommendation");
    });
  });
});
