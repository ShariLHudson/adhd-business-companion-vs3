/**
 * Package 208 — Natural conversation + topic discipline regressions.
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
  certifyNaturalConversation,
  containsGenericConversationTemplate,
  isBackgroundElaboration,
} from "@/lib/shariNaturalConversation";

const TEMPLATE_BANS = [
  "Let's stay with hiring help. What part of that feels most useful to understand first?",
  "Tell me more.",
  "What matters most?",
  "Take your time.",
  "There may be something underneath.",
] as const;

function advance(
  session: ReturnType<typeof createTalkItOutSession>,
  userText: string,
) {
  const turn = buildTalkItOutTurn(session, userText);
  return {
    session: appendTalkItOutMessages(
      session,
      [
        {
          id: `u-${Date.now()}-${Math.random()}`,
          role: "user",
          content: userText,
          createdAt: new Date().toISOString(),
        },
        {
          id: `a-${Date.now()}-${Math.random()}`,
          role: "assistant",
          content: turn.assistantText,
          createdAt: new Date().toISOString(),
        },
      ],
      {
        thinkingMap: turn.thinkingMap,
        cieState: turn.cieState,
        usefulSummary: turn.usefulSummary,
        usedStrategyMoves: turn.usedStrategyMoves,
        topic:
          turn.thinkingMap?.topicAnchor?.primaryTopic ??
          turn.cieState?.topicAnchor?.primaryTopic,
      },
    ),
    assistantText: turn.assistantText,
    topic:
      turn.cieState?.topicAnchor?.primaryTopic ??
      turn.thinkingMap?.topicAnchor?.primaryTopic ??
      null,
  };
}

describe("208 — Shari natural conversation & topic discipline", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("bans generic coaching shells", () => {
    for (const line of TEMPLATE_BANS) {
      expect(containsGenericConversationTemplate(line)).toBe(true);
      expect(certifyNaturalConversation({ responseText: line }).passed).toBe(
        false,
      );
    }
  });

  it("CIE regenerates Let's stay with shells", () => {
    const result = processConversationTurn({
      conversationId: "208-shell",
      experienceId: "talk-it-out",
      userText: "Should I hire a marketing assistant?",
      messages: [],
      draftText:
        "Let's stay with hiring a marketing assistant. What part of that feels most useful to understand first?",
    });
    expect(result.regenerated || result.usedFallback).toBe(true);
    expect(result.assistantText).not.toMatch(/let'?s stay with/i);
    expect(result.assistantText).not.toMatch(/what part feels most useful/i);
  });

  it("treats platform design as background when hire topic is active", () => {
    expect(
      isBackgroundElaboration(
        "I am designing a new ADHD business platform and need people to know about it.",
        "hiring a marketing assistant",
      ),
    ).toBe(true);

    let anchor = updateTopicAnchor({
      previous: null,
      userText: "If I should hire a marketing assistant.",
      turnId: "t1",
    });
    expect(anchor.primaryTopic.toLowerCase()).toMatch(/hir|market/);

    anchor = updateTopicAnchor({
      previous: anchor,
      userText:
        "I am designing a new ADHD business platform and need people to know about it.",
      turnId: "t2",
    });
    expect(anchor.primaryTopic.toLowerCase()).toMatch(/hir|market/);
    expect(anchor.primaryTopic.toLowerCase()).not.toMatch(/designing/);
  });

  it("required regression: hire → platform context → nothing to do with designing", () => {
    let session = createTalkItOutSession();
    let topic: string | null = null;

    ({ session, topic } = advance(
      session,
      "If I should hire a marketing assistant.",
    ));
    expect(topic?.toLowerCase() ?? "").toMatch(/hir|market/);

    ({ session, topic } = advance(
      session,
      "I am designing a new ADHD business platform and need people to know about it.",
    ));
    expect(topic?.toLowerCase() ?? "").toMatch(/hir|market/);
    expect(topic?.toLowerCase() ?? "").not.toMatch(/\bdesigning\b/);

    const third = advance(
      session,
      "It has nothing to do with designing but marketing the app.",
    );
    expect(third.topic?.toLowerCase() ?? "").toMatch(/hir|market/);
    expect(third.assistantText.toLowerCase()).not.toMatch(
      /let'?s stay with|take your time|quieter question underneath|what matters most/,
    );
    // Must continue marketing help — not return to platform design as the subject
    expect(third.assistantText.toLowerCase()).toMatch(
      /market|hir|help|discover|membership|know/,
    );
    expect(third.assistantText.toLowerCase()).not.toMatch(
      /let'?s stay with designing|designing your platform is the question/,
    );
  });
});
