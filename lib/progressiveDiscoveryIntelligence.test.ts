import { describe, expect, it } from "vitest";
import type { ChatTurn } from "./companionIntelligence";
import { buildCompanionDecisionIntelligence, companionDecisionIntelligenceHintForChat } from "./companionDecisionIntelligence/companionDecisionIntelligence";
import { companionEntryLayerHintForChat } from "./companionEntry";
import {
  detectLikelyFramework,
  FRAMEWORK_OFFER_CONFIDENCE_THRESHOLD,
  maxDiscoveryQuestions,
  progressiveDiscoveryHintForChat,
  resolveProgressiveDiscoveryStep,
  shouldOfferFrameworkNow,
} from "./progressiveDiscoveryIntelligence";

describe("progressiveDiscoveryIntelligence", () => {
  it("detects Decision Compass for product line question", () => {
    expect(
      detectLikelyFramework("Should I add a new product line?"),
    ).toBe("decision_compass");
  });

  it("limits questions by complexity", () => {
    expect(maxDiscoveryQuestions("low")).toBe(1);
    expect(maxDiscoveryQuestions("medium")).toBe(2);
    expect(maxDiscoveryQuestions("high")).toBe(3);
  });

  it("asks one product-expansion question on first turn", () => {
    const step = resolveProgressiveDiscoveryStep({
      userText: "Should I add a new product line?",
      messages: [],
      complexityLevel: "medium",
    });
    expect(step.readyToOffer).toBe(false);
    expect(step.nextQuestion).toMatch(/replacing|alongside|different/i);
    expect(step.maxQuestions).toBe(2);
  });

  it("offers framework after minimum context", () => {
    const messages: ChatTurn[] = [
      { role: "user", content: "Should I add a new product line?" },
      {
        role: "assistant",
        content: "Is this replacing your current offer or adding alongside it?",
      },
      {
        role: "user",
        content: "Adding alongside — same entrepreneurs, group program at half the price.",
      },
    ];
    const step = resolveProgressiveDiscoveryStep({
      userText: messages.at(-1)!.content,
      messages,
      complexityLevel: "high",
      contextSignals: 3,
    });
    expect(
      shouldOfferFrameworkNow(step.confidence) || step.questionsAsked >= 1,
    ).toBe(true);
    expect(step.framework.id).toBe("decision_compass");
  });

  it("hint forbids multi-question dumps", () => {
    const hint = progressiveDiscoveryHintForChat({
      userText: "Should I add a new product line?",
      messages: [],
      complexityLevel: "medium",
    });
    expect(hint).toMatch(/ONE question/i);
    expect(hint).toMatch(/FORBIDDEN/i);
    expect(hint).not.toMatch(/Ask 2–4/i);
  });

  it("entry layer uses progressive discovery for product line", () => {
    const hint = companionEntryLayerHintForChat(
      "Should I add a new product line?",
    );
    expect(hint).toMatch(/PROGRESSIVE DISCOVERY/i);
    expect(hint).toMatch(/ask ONLY/i);
    expect(hint).not.toMatch(/Ask 2–4/i);
  });

  it("decision intelligence hint includes progressive discovery on defer", () => {
    const userText = "Should I add a new product line?";
    const intel = buildCompanionDecisionIntelligence({
      messages: [{ role: "user", content: userText }],
      userText,
      lastAssistantText: "",
    });
    const hint = companionDecisionIntelligenceHintForChat(intel, {
      userText,
      messages: [{ role: "user", content: userText }],
    });
    expect(intel.shouldDeferSolutions).toBe(true);
    expect(hint).toMatch(/PROGRESSIVE DISCOVERY/i);
    expect(hint).toMatch(/ONE question/i);
  });

  it("uses 70% framework confidence threshold", () => {
    expect(FRAMEWORK_OFFER_CONFIDENCE_THRESHOLD).toBe(0.7);
    expect(shouldOfferFrameworkNow(0.69)).toBe(false);
    expect(shouldOfferFrameworkNow(0.7)).toBe(true);
  });
});
