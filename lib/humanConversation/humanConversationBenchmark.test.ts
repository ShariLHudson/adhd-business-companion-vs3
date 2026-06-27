import { describe, expect, it } from "vitest";
import {
  enforceHumanConversation,
  evaluateHumanConversationTwelveTests,
  HUMAN_CONVERSATION_BENCHMARKS,
  humanConversationHintForChat,
} from "./index";

describe("Human Conversation benchmarks", () => {
  for (const bench of HUMAN_CONVERSATION_BENCHMARKS) {
    it(`exemplar scores 12/12 for "${bench.userMessage}"`, () => {
      const evaluation = evaluateHumanConversationTwelveTests({
        response: bench.exemplarResponse,
        userText: bench.userMessage,
        memoryConfidence: bench.memoryConfidence,
      });
      if (!evaluation.passed) {
        const failed = evaluation.results
          .filter((r) => !r.passed)
          .map((r) => `${r.id}: ${r.reason}`)
          .join("; ");
        expect(failed, bench.id).toBe("");
      }
      expect(evaluation.score).toBe(12);
      expect(evaluation.passed).toBe(true);
    });

    it(`anti-pattern fails twelve tests for "${bench.userMessage}"`, () => {
      const evaluation = evaluateHumanConversationTwelveTests({
        response: bench.antiPatternResponse,
        userText: bench.userMessage,
        memoryConfidence: bench.memoryConfidence,
      });
      expect(evaluation.score).toBeLessThan(12);
      expect(evaluation.rewriteRecommended).toBe(true);
    });

    it(`enforcement improves anti-pattern for "${bench.userMessage}"`, () => {
      const before = evaluateHumanConversationTwelveTests({
        response: bench.antiPatternResponse,
        userText: bench.userMessage,
        memoryConfidence: bench.memoryConfidence,
      });
      const enforced = enforceHumanConversation({
        response: bench.antiPatternResponse,
        userText: bench.userMessage,
        memoryConfidence: bench.memoryConfidence,
      });
      expect(enforced.rewritten || enforced.bodyPhrasesRewritten).toBe(true);
      expect(enforced.message).not.toMatch(/^It sounds like/i);
      expect(enforced.twelveTests.score).toBeGreaterThanOrEqual(before.score);
    });
  }

  it("turn hints include twelve-test constitutional standard", () => {
    const hint = humanConversationHintForChat({
      userText: "I don't want to work today.",
      emotionalState: "stuck",
    });
    expect(hint).toContain("Twelve Tests");
    expect(hint).toContain("Care → Remember → Notice");
  });
});
