import { describe, expect, it } from "vitest";
import {
  isActivationProblem,
  isFocusProblem,
  isMotivationProblem,
  isOverwhelmProblem,
  isStrategyProblem,
  shouldSuppressVisualRecommendation,
} from "./visualThinkingGuards";
import {
  recommendVisualStructures,
  shouldOfferVisualRecommendation,
} from "./visualRecommendationEngine";
import { isKnowledgeQuestion } from "./knowledgeIntelligence";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";

describe("visualThinkingGuards (P0.20.3)", () => {
  describe("ADHD boundary — no visual recommendation", () => {
    const adhdCases = [
      "I keep putting off my sales calls",
      "I keep procrastinating",
      "I'm overwhelmed",
      "I can't get started",
      "I need motivation",
      "I avoid follow-up",
      "I know what to do but won't do it",
    ];

    it.each(adhdCases)('"%s" suppresses visual recommendation', (input) => {
      expect(shouldSuppressVisualRecommendation(input)).toBe(true);
      expect(shouldOfferVisualRecommendation(input)).toBe(false);
      expect(recommendVisualStructures(input).recommendations).toEqual([]);
      const decision = resolveFrictionlessAction({ userText: input, currentTurn: 1 });
      expect(decision.pendingAction?.type).not.toBe("visual_recommendation");
      expect(decision.immediateVisualOpen).toBeUndefined();
    });
  });

  describe("guard classification", () => {
    it("strategy problems", () => {
      expect(isStrategyProblem("I keep procrastinating")).toBe(true);
      expect(isStrategyProblem("I keep putting off my sales calls")).toBe(true);
    });

    it("activation problems", () => {
      expect(isActivationProblem("I can't get started")).toBe(true);
    });

    it("overwhelm problems", () => {
      expect(isOverwhelmProblem("I'm overwhelmed")).toBe(true);
    });

    it("motivation problems", () => {
      expect(isMotivationProblem("I need motivation")).toBe(true);
    });

    it("focus problems", () => {
      expect(isFocusProblem("I need to focus")).toBe(true);
    });
  });

  describe("Learn — no visual recommendation", () => {
    const learnCases = [
      "How is a flowchart used?",
      "How are mind maps used?",
      "Why is a decision tree useful?",
      "When should I use a flowchart?",
    ];

    it.each(learnCases)('"%s" is learn, not visual', (input) => {
      expect(isKnowledgeQuestion(input)).toBe(true);
      expect(shouldSuppressVisualRecommendation(input)).toBe(true);
      expect(shouldOfferVisualRecommendation(input)).toBe(false);
    });
  });

  describe("positive visual recommendation cases", () => {
    it.each([
      "I want to launch a course",
      "I want to write a book",
      "Help me organize my ideas",
    ])('"%s" still recommends visuals', (input) => {
      expect(shouldSuppressVisualRecommendation(input)).toBe(false);
      expect(shouldOfferVisualRecommendation(input)).toBe(true);
    });
  });
});
