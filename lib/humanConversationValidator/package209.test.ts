/**
 * Package 209 — Human Conversation Validator regressions.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { processConversationTurn } from "@/lib/conversationIntelligenceEngine";
import {
  appendTalkItOutMessages,
  buildTalkItOutTurn,
  createTalkItOutSession,
  resetTalkItOutSessionsForTests,
} from "@/lib/talkItOut";
import { updateTopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";
import {
  enforceHumanConversationGate,
  matchBlockedPhrases,
  resetHcvTelemetryForTests,
  validateHumanConversation,
} from "@/lib/humanConversationValidator";

describe("209 — Human Conversation Validator", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
    resetHcvTelemetryForTests();
  });

  it("detects generic template shells", () => {
    const bad =
      "Let's stay with designing new ADHD business platform need. What part of that feels most useful to understand first?";
    expect(matchBlockedPhrases(bad).length).toBeGreaterThan(0);
    const result = validateHumanConversation({
      draftText: bad,
      userText: "I am designing a new ADHD business platform and need people to know about it.",
      messages: [
        { role: "user", content: "If I should hire a marketing assistant." },
      ],
      topicAnchor: "hiring a marketing assistant",
    });
    expect(result.passed).toBe(false);
    expect(result.criticalFailure).toBe(true);
    expect(result.failureCodes).toEqual(
      expect.arrayContaining([
        "HCV_TEMPLATE_SHELL_DETECTED",
        "HCV_MALFORMED_TOPIC_PHRASE",
      ]),
    );
  });

  it("detects background replaced topic", () => {
    const result = validateHumanConversation({
      draftText:
        "What part of designing the platform is hardest to judge?",
      userText:
        "I am designing a new ADHD business platform and need people to know about it.",
      messages: [
        { role: "user", content: "Should I hire a marketing assistant?" },
      ],
      topicAnchor: "hiring a marketing assistant",
    });
    expect(result.passed).toBe(false);
    expect(result.failureCodes).toContain("HCV_BACKGROUND_REPLACED_TOPIC");
  });

  it("regenerates malformed coaching shell into natural hire-focused reply", () => {
    const gated = enforceHumanConversationGate({
      draftText:
        "Let's stay with designing new ADHD business platform need. What part of that feels most useful to understand first?",
      userText:
        "I am designing a new ADHD business platform and need to let people know about it so they will buy the membership.",
      messages: [
        { role: "user", content: "If I should hire a marketing assistant." },
        {
          role: "assistant",
          content:
            "You are trying to decide whether bringing in marketing help would be worth the investment right now. What is making you consider it at this point?",
        },
      ],
      topicAnchor: "hiring a marketing assistant",
      currentFocus: "getting the offering known",
    });
    expect(gated.regenerated || gated.usedFallback).toBe(true);
    expect(gated.text.toLowerCase()).not.toMatch(/let'?s stay with/);
    expect(gated.text.toLowerCase()).not.toMatch(/platform need/);
    expect(gated.text.toLowerCase()).toMatch(/market|hir|discover|member/);
  });

  it("CIE processTurn runs HCV and blocks malformed topic shell", () => {
    const result = processConversationTurn({
      conversationId: "209-cie",
      experienceId: "talk-it-out",
      userText:
        "I am designing a new ADHD business platform and need people to know about it.",
      messages: [
        { role: "user", content: "If I should hire a marketing assistant." },
        {
          role: "assistant",
          content: "What is making you consider hiring one now?",
        },
      ],
      draftText:
        "Let's stay with designing new ADHD business platform need. What part of that feels most useful to understand first?",
    });
    expect(result.assistantText.toLowerCase()).not.toMatch(/let'?s stay with/);
    expect(result.assistantText.toLowerCase()).not.toMatch(/platform need/);
  });

  it("required multi-turn: hire → platform background → correction stays on marketing", () => {
    let session = createTalkItOutSession();
    const open = buildTalkItOutTurn(
      session,
      "If I should hire a marketing assistant.",
    );
    session = appendTalkItOutMessages(
      session,
      [
        {
          id: "u1",
          role: "user",
          content: "If I should hire a marketing assistant.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "a1",
          role: "assistant",
          content: open.assistantText,
          createdAt: new Date().toISOString(),
        },
      ],
      {
        thinkingMap: open.thinkingMap,
        cieState: open.cieState,
        topic: open.cieState?.topicAnchor?.primaryTopic,
      },
    );

    const topicAfterOpen =
      session.cieState?.topicAnchor?.primaryTopic?.toLowerCase() ?? "";
    expect(topicAfterOpen).toMatch(/hir|market/);

    // Background must not replace topic at anchor layer
    const anchor = updateTopicAnchor({
      previous: session.cieState?.topicAnchor ?? open.thinkingMap?.topicAnchor,
      userText:
        "I am designing a new ADHD business platform and need to let people know about it so they will buy the membership.",
      turnId: "t2",
    });
    expect(anchor.primaryTopic.toLowerCase()).toMatch(/hir|market/);

    const mid = buildTalkItOutTurn(
      session,
      "I am designing a new ADHD business platform and need to let people know about it so they will buy the membership.",
    );
    expect(mid.assistantText.toLowerCase()).not.toMatch(
      /let'?s stay with designing|platform need|what part feels most useful/,
    );
    session = appendTalkItOutMessages(
      session,
      [
        {
          id: "u2",
          role: "user",
          content:
            "I am designing a new ADHD business platform and need to let people know about it so they will buy the membership.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "a2",
          role: "assistant",
          content: mid.assistantText,
          createdAt: new Date().toISOString(),
        },
      ],
      {
        thinkingMap: mid.thinkingMap,
        cieState: mid.cieState,
        topic: mid.cieState?.topicAnchor?.primaryTopic,
      },
    );

    // Inject the exact invalid draft path through CIE/HCV
    const invalid = processConversationTurn({
      conversationId: session.id,
      experienceId: "talk-it-out",
      userText: "It has nothing to do with designing but marketing the app.",
      messages: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      priorState: session.cieState,
      draftText:
        "What part of designing new ADHD business platform need still feels hardest to judge?",
      repairActive: true,
      thinkingMap: session.thinkingMap,
    });
    expect(invalid.assistantText.toLowerCase()).not.toMatch(/platform need/);
    expect(invalid.assistantText.toLowerCase()).not.toMatch(
      /what part of designing/,
    );
    expect(invalid.assistantText.toLowerCase()).toMatch(
      /market|hir|member|discover|cost|role|result/,
    );

    const correction = buildTalkItOutTurn(
      session,
      "It has nothing to do with designing but marketing the app.",
    );
    expect(correction.assistantText.toLowerCase()).not.toMatch(
      /let'?s stay with|platform need|quieter question underneath/,
    );
    expect(
      (
        correction.cieState?.topicAnchor?.primaryTopic ??
        correction.thinkingMap?.topicAnchor?.primaryTopic ??
        ""
      ).toLowerCase(),
    ).toMatch(/hir|market/);
  });

  it("hidden meaning after nothing underneath is critical", () => {
    const result = validateHumanConversation({
      draftText:
        "There may be a quieter question underneath about whether you feel ready.",
      userText: "Nothing underneath.",
      messages: [],
      topicAnchor: "hiring help",
      repairActive: true,
    });
    expect(result.criticalFailure).toBe(true);
    expect(result.failureCodes).toContain("HCV_HIDDEN_MEANING_INVENTED");
  });
});
