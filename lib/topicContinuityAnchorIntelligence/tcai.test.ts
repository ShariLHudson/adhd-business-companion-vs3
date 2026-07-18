import { beforeEach, describe, expect, it } from "vitest";
import {
  applyTopicContinuityValidation,
  extractPrimaryTopic,
  isClarificationRequest,
  isIllegalTopicLabel,
  updateTopicAnchor,
  emptyTopicAnchor,
  detectsExplicitTopicChange,
} from "./index";
import {
  appendTalkItOutMessages,
  buildTalkItOutTurn,
  createTalkItOutSession,
  resetTalkItOutSessionsForTests,
} from "@/lib/talkItOut";
import { buildGroundedFallback } from "@/lib/conversationalIntelligence";

describe("Package 193 — Topic Continuity & Conversation Anchor", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("opening hire turn creates marketing-assistant Topic Anchor", () => {
    const topic = extractPrimaryTopic(
      "If I should hire a marketing assistant or not.",
    );
    expect(topic).toBe("hiring a marketing assistant");

    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "If I should hire a marketing assistant or not.",
    );
    expect(turn.thinkingMap?.topicAnchor?.primaryTopic).toBe(
      "hiring a marketing assistant",
    );
    expect(turn.thinkingMap?.topicAnchor?.conversationGoal).toMatch(/hire/i);
    expect(turn.assistantText.toLowerCase()).toMatch(/hir|market|assistant|cost|timing|plate/);
    expect(turn.assistantText.toLowerCase()).not.toMatch(/around does/);
  });

  it("clarification does not overwrite topic with does", () => {
    expect(isClarificationRequest("What does that mean?")).toBe(true);
    expect(extractPrimaryTopic("What does that mean?")).toBeNull();
    expect(isIllegalTopicLabel("does")).toBe(true);

    let session = createTalkItOutSession();
    const first = buildTalkItOutTurn(
      session,
      "If I should hire a marketing assistant or not.",
    );
    session = appendTalkItOutMessages(
      session,
      [
        {
          id: "u1",
          role: "user",
          content: "If I should hire a marketing assistant or not.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "a1",
          role: "assistant",
          content: "Take your time with that.",
          createdAt: new Date().toISOString(),
        },
      ],
      { thinkingMap: first.thinkingMap },
    );

    const clarify = buildTalkItOutTurn(session, "What does that mean?");
    expect(clarify.thinkingMap?.topicAnchor?.primaryTopic).toBe(
      "hiring a marketing assistant",
    );
    expect(clarify.assistantText.toLowerCase()).toMatch(/hir|market|assistant/);
    expect(clarify.assistantText.toLowerCase()).not.toMatch(/around does/);
    expect(clarify.assistantText.toLowerCase()).not.toMatch(
      /working through something around does/,
    );
  });

  it("grounded fallback never invents something around does", () => {
    const text = buildGroundedFallback(
      "What does that mean?",
      1,
      "hiring a marketing assistant",
    );
    expect(text.toLowerCase()).toMatch(/marketing assistant|hir/);
    expect(text.toLowerCase()).not.toContain("around does");
  });

  it("one-word cost updates focus, not primary topic", () => {
    const prev = updateTopicAnchor({
      previous: {
        ...emptyTopicAnchor(),
        primaryTopic: "hiring a marketing assistant",
        topicType: "business-decision",
        conversationGoal: "think through whether to hire",
        topicConfidence: "high",
        topicHistory: ["hiring a marketing assistant"],
      },
      userText: "cost",
    });
    expect(prev.primaryTopic).toBe("hiring a marketing assistant");
    expect(prev.currentFocus).toMatch(/cost/i);
  });

  it("What? keeps Topic Anchor", () => {
    let session = createTalkItOutSession();
    const first = buildTalkItOutTurn(
      session,
      "If I should hire a marketing assistant or not.",
    );
    session = appendTalkItOutMessages(
      session,
      [
        {
          id: "u1",
          role: "user",
          content: "If I should hire a marketing assistant or not.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "a1",
          role: "assistant",
          content: first.assistantText,
          createdAt: new Date().toISOString(),
        },
      ],
      { thinkingMap: first.thinkingMap },
    );
    const turn = buildTalkItOutTurn(session, "What?");
    expect(turn.thinkingMap?.topicAnchor?.primaryTopic).toBe(
      "hiring a marketing assistant",
    );
    expect(turn.assistantText.toLowerCase()).not.toMatch(/around does|around what/);
  });

  it("explicit topic change to bookkeeper", () => {
    expect(
      detectsExplicitTopicChange(
        "I want to talk about hiring a bookkeeper instead.",
      ),
    ).toBe(true);
    const next = updateTopicAnchor({
      previous: {
        ...emptyTopicAnchor(),
        primaryTopic: "hiring a marketing assistant",
        topicType: "business-decision",
        conversationGoal: "think through whether to hire",
        topicConfidence: "high",
        topicHistory: ["hiring a marketing assistant"],
      },
      userText: "I want to talk about hiring a bookkeeper instead.",
    });
    expect(next.primaryTopic).toBe("hiring a bookkeeper");
    expect(next.topicChangeConfirmed).toBe(true);
  });

  it("rejects stop-word subject drafts", () => {
    const result = applyTopicContinuityValidation({
      draftText: "You are working through something around does.",
      userText: "What does that mean?",
      anchor: {
        ...emptyTopicAnchor(),
        primaryTopic: "hiring a marketing assistant",
        topicConfidence: "high",
        topicHistory: ["hiring a marketing assistant"],
      },
      wasClarification: true,
      previousAssistantText: "Take your time with that.",
    });
    expect(result.usedFallback).toBe(true);
    expect(result.text.toLowerCase()).toMatch(/marketing assistant|hir/);
    expect(result.text.toLowerCase()).not.toContain("around does");
  });

  it("correction preserves Topic Anchor", () => {
    let session = createTalkItOutSession();
    const first = buildTalkItOutTurn(
      session,
      "If I should hire a marketing assistant or not.",
    );
    session = appendTalkItOutMessages(
      session,
      [
        {
          id: "u1",
          role: "user",
          content: "If I should hire a marketing assistant or not.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "a1",
          role: "assistant",
          content:
            "Tell me if I am reading this wrong — there may be a quieter question underneath.",
          createdAt: new Date().toISOString(),
        },
      ],
      { thinkingMap: first.thinkingMap },
    );
    const turn = buildTalkItOutTurn(session, "No, that is not what I mean.");
    expect(turn.thinkingMap?.topicAnchor?.primaryTopic).toBe(
      "hiring a marketing assistant",
    );
    expect(turn.assistantText.toLowerCase()).toMatch(/hir|market|assistant/);
  });
});
