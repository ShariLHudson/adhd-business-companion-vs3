/**
 * Conversation Intelligence Engine — packages 195–199.
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  buildConversationPlan,
  detectPriorityEvent,
  emptyConversationRuntimeState,
  isVerbatimGoldCopy,
  processConversationTurn,
  resetCieTelemetryForTests,
  selectPrimaryMode,
  updateRuntimeStateForUserTurn,
  validateConversationResponse,
} from "@/lib/conversationIntelligenceEngine";
import { getGoldStandardById } from "@/lib/goldStandardConversationLibrary";
import {
  createTalkItOutSession,
  buildTalkItOutTurn,
  appendTalkItOutMessages,
  resetTalkItOutSessionsForTests,
} from "@/lib/talkItOut";

describe("CIE — priority and mode", () => {
  it("ranks clarification above normal exploration", () => {
    expect(detectPriorityEvent("What do you mean?", [])).toBe(
      "clarification_request",
    );
    expect(
      selectPrimaryMode({
        experienceId: "talk-it-out",
        priority: "clarification_request",
        userText: "What do you mean?",
      }),
    ).toBe("clarification");
  });

  it("selects decision exploration for hire language", () => {
    expect(
      selectPrimaryMode({
        experienceId: "talk-it-out",
        priority: "normal",
        userText: "Should I hire a marketing person?",
      }),
    ).toBe("decision_exploration");
  });
});

describe("CIE — state and plan", () => {
  it("preserves topic across short focus replies", () => {
    let state = emptyConversationRuntimeState("c1", "talk-it-out");
    state = updateRuntimeStateForUserTurn({
      state,
      userText: "I need to decide whether to hire marketing help.",
      messages: [],
      turnId: "t1",
    });
    const topic = state.topicAnchor?.primaryTopic;
    expect(topic).toBeTruthy();
    expect(topic?.toLowerCase()).toMatch(/hir|market/);

    state = updateRuntimeStateForUserTurn({
      state,
      userText: "Cost.",
      messages: [
        {
          role: "user",
          content: "I need to decide whether to hire marketing help.",
        },
        {
          role: "assistant",
          content: "What is making you consider hiring marketing help now?",
        },
      ],
      turnId: "t2",
    });
    expect(state.topicAnchor?.primaryTopic).toBe(topic);
    expect(state.currentFocus?.label.toLowerCase()).toMatch(/cost/);
  });

  it("builds a plan with gold example ids and safe fallback", () => {
    const state = emptyConversationRuntimeState("c2", "talk-it-out");
    const withTopic = updateRuntimeStateForUserTurn({
      state,
      userText: "Should I hire someone for marketing?",
      messages: [],
      turnId: "t1",
    });
    const plan = buildConversationPlan({
      turn: {
        conversationId: "c2",
        experienceId: "talk-it-out",
        userText: "Should I hire someone for marketing?",
        messages: [],
      },
      state: withTopic,
    });
    expect(plan.primaryMode).toBe("decision_exploration");
    expect(plan.safeFallback.length).toBeGreaterThan(10);
    expect(Array.isArray(plan.goldExampleIds)).toBe(true);
  });
});

describe("CIE — validation and anti-copy", () => {
  it("blocks unsupported hidden meaning", () => {
    const state = emptyConversationRuntimeState("c3", "talk-it-out");
    const plan = buildConversationPlan({
      turn: {
        conversationId: "c3",
        experienceId: "talk-it-out",
        userText: "Should I hire?",
        messages: [],
      },
      state,
    });
    const result = validateConversationResponse({
      responseText:
        "There may be a quieter question underneath about whether you feel ready.",
      userText: "Should I hire?",
      plan,
      state,
      messages: [],
    });
    expect(result.failures).toContain("UNSUPPORTED_HIDDEN_MEANING");
  });

  it("detects verbatim gold copy", () => {
    const entry = getGoldStandardById("TIO-GSC-BIZ-HIRING-001");
    const assistant = entry?.turns.find((t) => t.role === "assistant");
    expect(assistant?.content).toBeTruthy();
    const state = emptyConversationRuntimeState("c4", "talk-it-out");
    const plan = buildConversationPlan({
      turn: {
        conversationId: "c4",
        experienceId: "talk-it-out",
        userText: "Should I hire marketing help?",
        messages: [],
      },
      state,
    });
    plan.goldExampleIds = ["TIO-GSC-BIZ-HIRING-001"];
    expect(isVerbatimGoldCopy(assistant!.content, plan)).toBe(true);
  });

  it("regenerates on blocking failure then delivers", () => {
    resetCieTelemetryForTests();
    const result = processConversationTurn({
      conversationId: "c5",
      experienceId: "talk-it-out",
      userText: "Should I hire marketing help?",
      messages: [],
      draftText:
        "There may be a quieter question underneath about your real fear.",
    });
    expect(result.assistantText.toLowerCase()).not.toMatch(
      /quieter question underneath/,
    );
    expect(result.regenerated || result.usedFallback).toBe(true);
  });
});

describe("CIE — Talk It Out resume / multi-turn", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
    resetCieTelemetryForTests();
  });

  it("opening hire turn stays grounded and stores cieState", () => {
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "I need to decide whether to hire a marketing assistant.",
    );
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /something around does|quieter question underneath|take your time with that/,
    );
    expect(turn.cieState).toBeTruthy();
    expect(turn.cieState?.primaryMode).toBeTruthy();
  });

  it("clarification does not invent stop-word topic", () => {
    let session = createTalkItOutSession();
    const first = buildTalkItOutTurn(
      session,
      "I need to decide whether to hire a marketing assistant.",
    );
    session = appendTalkItOutMessages(
      session,
      [
        {
          id: "u1",
          role: "user",
          content: "I need to decide whether to hire a marketing assistant.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "a1",
          role: "assistant",
          content: first.assistantText,
          createdAt: new Date().toISOString(),
        },
      ],
      { thinkingMap: first.thinkingMap, cieState: first.cieState },
    );
    const clarify = buildTalkItOutTurn(session, "What do you mean?");
    expect(clarify.assistantText.toLowerCase()).not.toMatch(
      /something around does/,
    );
    expect(clarify.responseKind).toBe("repair");
  });

  it("correction returns to topic without generic fallback", () => {
    let session = createTalkItOutSession();
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content: "Should I hire marketing help?",
        createdAt: new Date().toISOString(),
      },
      {
        id: "a1",
        role: "assistant",
        content:
          "There may be a quieter question underneath about whether you feel worthy of help.",
        createdAt: new Date().toISOString(),
      },
    ]);
    const turn = buildTalkItOutTurn(session, "That is not what I mean.");
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /^take your time|^i am with you|quieter question underneath/,
    );
    expect(turn.assistantText.toLowerCase()).toMatch(
      /hir|market|right|correct|stay/,
    );
  });
});
