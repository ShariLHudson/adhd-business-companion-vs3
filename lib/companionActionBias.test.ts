import { describe, expect, it } from "vitest";
import {
  actionBiasHintForChat,
  analyzeActionBias,
  countAssistantQuestions,
  discoveryOverrideForActionBias,
  shouldDeferRoutingForActionBias,
  shouldSuppressDiscoveryQuestions,
} from "./companionActionBias";
import { analyzeAdhdNativeTurn } from "./adhdNativeIntelligence";
import { analyzeMultiTurnPatterns } from "./adhdMultiTurnPatterns";

describe("companionActionBias", () => {
  it("counts assistant questions in thread", () => {
    const count = countAssistantQuestions([
      { role: "user", content: "help" },
      { role: "assistant", content: "What's going on?" },
      { role: "user", content: "stuck" },
      { role: "assistant", content: "What feels hardest?" },
    ]);
    expect(count).toBe(2);
  });

  it("detects momentum and hyperfocus protection", () => {
    const a = analyzeActionBias({
      messages: [{ role: "user", content: "I'm on a roll writing the draft" }],
      userText: "I'm on a roll writing the draft",
      emotionalState: "focused",
    });
    expect(a.momentumActive).toBe(true);
    expect(a.hyperfocusActive).toBe(true);
    expect(actionBiasHintForChat(a)).toMatch(/HYPERFOCUS PROTECTION/i);
  });

  it("triggers over-investigation after many questions", () => {
    const messages = [];
    for (let i = 0; i < 6; i++) {
      messages.push({ role: "user", content: `answer ${i}` } as const);
      messages.push({
        role: "assistant",
        content: `Clarifying question ${i}?`,
      } as const);
    }
    const a = analyzeActionBias({
      messages,
      userText: "I still don't know",
      emotionalState: "unclear",
    });
    expect(a.maxQuestionsReached).toBe(true);
    expect(a.investigationPhase).toBe("over_investigating");
    expect(shouldSuppressDiscoveryQuestions(a)).toBe(true);
    expect(actionBiasHintForChat(a)).toMatch(/Do NOT ask another/i);
  });

  it("accelerates decisions when enough context exists", () => {
    const messages = [
      { role: "user", content: "I can't decide between Offer A and Offer B" },
      { role: "assistant", content: "What matters most to you right now?" },
      {
        role: "user",
        content:
          "Offer A is faster revenue but Offer B fits my values better and I have more proof for it",
      },
      { role: "assistant", content: "What would success look like in 90 days?" },
    ];
    const a = analyzeActionBias({
      messages,
      userText: "I still can't decide",
      emotionalState: "unclear",
    });
    expect(a.decisionAcceleration).toBe(true);
    expect(actionBiasHintForChat(a)).toMatch(/DECISION ACCELERATION/i);
  });

  it("defers routing during momentum", () => {
    const a = analyzeActionBias({
      messages: [],
      userText: "just finished the first section",
      emotionalState: "building",
      adhdNative: analyzeAdhdNativeTurn({
        text: "just finished the first section",
        emotionalState: "building",
        obstacle: null,
      }),
    });
    expect(shouldDeferRoutingForActionBias(a)).toBe(true);
  });

  it("overrides discovery when planning addiction loops", () => {
    const messages = [
      { role: "user", content: "I need to plan this better" },
      { role: "assistant", content: "What's the goal?" },
      { role: "user", content: "launch workshop" },
      { role: "assistant", content: "What would the outline include?" },
      { role: "user", content: "Let me make a checklist before I start writing" },
      { role: "assistant", content: "What system do you want?" },
    ];
    const multiTurn = analyzeMultiTurnPatterns({ messages });
    const a = analyzeActionBias({
      messages,
      userText: "maybe I need another checklist",
      emotionalState: "stuck",
      multiTurn,
    });
    expect(a.overanalysisRisk).toBe(true);
    expect(discoveryOverrideForActionBias(a)).toMatch(/DISCOVERY OVERRIDE/i);
  });
});
