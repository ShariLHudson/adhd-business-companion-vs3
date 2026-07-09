import { describe, expect, it } from "vitest";

import {
  buildSparkEstateOverwhelmResponse,
  buildSparkEstateStuckResponse,
  detectSparkEstateConversationState,
  formatSparkEstateConversationReply,
  resolveSparkEstateConversationTurn,
  sanitizeSparkEstateShariCopy,
  shouldAskBeforeCreate,
  SPARK_ESTATE_CONVERSATION_FLOW,
  SPARK_ESTATE_CONVERSATION_SUCCESS_TEST,
  SPARK_ESTATE_SHARI_TRAITS,
  sparkEstateConversationHint,
  verifySparkEstateConversationEngine,
} from "./sparkEstateConversationEngine";

describe("sparkEstateConversationEngine", () => {
  it("defines Shari traits and universal conversation flow", () => {
    const verification = verifySparkEstateConversationEngine();
    expect(SPARK_ESTATE_SHARI_TRAITS).toEqual([
      "warm",
      "encouraging",
      "practical",
      "patient",
      "helpful",
      "step-by-step",
    ]);
    expect(SPARK_ESTATE_CONVERSATION_FLOW).toEqual([
      "connect",
      "clarify",
      "guide",
      "create",
      "review",
      "continue",
    ]);
    expect(SPARK_ESTATE_CONVERSATION_SUCCESS_TEST).toContain("understood");
    expect(verification.voiceConsistent).toBe(true);
    expect(verification.patternsReady).toBe(true);
  });

  it("detects overwhelm, stuck, and ready-to-create states", () => {
    expect(detectSparkEstateConversationState("I am overwhelmed")).toBe(
      "overwhelmed",
    );
    expect(detectSparkEstateConversationState("I'm stuck on this")).toBe("stuck");
    expect(detectSparkEstateConversationState("Help me write an email")).toBe(
      "ready-to-create",
    );
  });

  it("uses overwhelm and stuck response patterns", () => {
    expect(buildSparkEstateOverwhelmResponse()).toContain("one thing");
    expect(buildSparkEstateStuckResponse()).toContain("difficult");
    const reply = formatSparkEstateConversationReply(
      resolveSparkEstateConversationTurn({ text: "I have too much happening" }),
    );
    expect(reply).toContain("progress");
  });

  it("asks before create when context is unclear and creates when ready", () => {
    expect(
      shouldAskBeforeCreate({ text: "I need help but I'm not sure what" }),
    ).toBe(true);
    expect(
      shouldAskBeforeCreate({
        text: "Help me write an email",
        hasKnownGoal: true,
        hasAudience: true,
      }),
    ).toBe(false);
  });

  it("sanitizes banned assistant phrasing", () => {
    const cleaned = sanitizeSparkEstateShariCopy("Let's break it down for you.");
    expect(cleaned.toLowerCase()).not.toContain("break it down");
  });

  it("builds estate conversation hints with room consistency", () => {
    const hint = sparkEstateConversationHint({
      text: "I'm stuck",
      section: "chamber-of-momentum",
    });
    expect(hint).toContain("Same Shari voice");
    expect(hint).toContain("Stuck pattern");
  });
});
