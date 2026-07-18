/**
 * Package 206 — permanent regression suite for past Talk It Out failures.
 * These phrases must never appear in delivered assistant text.
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  appendTalkItOutMessages,
  buildTalkItOutTurn,
  createTalkItOutSession,
  pauseTalkItOutSession,
  renameTalkItOutSession,
  resetTalkItOutSessionsForTests,
  resumeOrCreateTalkItOutSession,
  deleteTalkItOutSession,
  startFreshTalkItOutSession,
} from "@/lib/talkItOut";
import { processConversationTurn } from "@/lib/conversationIntelligenceEngine";
import { stripTrailingQuestion } from "@/lib/conversationQualityRhythmIntelligence/observationVsQuestion";

const FORBIDDEN = [
  "Take your time with that.",
  "There may be a quieter question underneath.",
  "You are working through something around does.",
] as const;

function assertNeverForbidden(text: string): void {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN) {
    expect(lower).not.toContain(phrase.toLowerCase());
  }
  expect(lower).not.toMatch(/\btake your time with that\b/);
  expect(lower).not.toMatch(/\bquieter question underneath\b/);
  expect(lower).not.toMatch(/\bsomething around does\b/);
}

function advance(
  session: ReturnType<typeof createTalkItOutSession>,
  userText: string,
) {
  const turn = buildTalkItOutTurn(session, userText);
  assertNeverForbidden(turn.assistantText);
  return appendTalkItOutMessages(
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
  );
}

describe("206 — permanent failure regressions", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("CQRI stripTrailingQuestion never emits Take your time with that", () => {
    expect(stripTrailingQuestion("What feels unfinished?")).not.toMatch(
      /take your time/i,
    );
  });

  it("CIE regenerates Take your time with that instead of shipping it", () => {
    const result = processConversationTurn({
      conversationId: "reg-1",
      experienceId: "talk-it-out",
      userText: "Should I hire a marketing assistant?",
      messages: [],
      draftText: "Take your time with that.",
    });
    expect(result.regenerated || result.usedFallback).toBe(true);
    assertNeverForbidden(result.assistantText);
  });

  it("CIE regenerates quieter question underneath", () => {
    const result = processConversationTurn({
      conversationId: "reg-2",
      experienceId: "talk-it-out",
      userText: "Should I hire help?",
      messages: [],
      draftText:
        "There may be a quieter question underneath about whether you feel ready.",
    });
    expect(result.regenerated || result.usedFallback).toBe(true);
    assertNeverForbidden(result.assistantText);
  });

  it("CIE regenerates something around does", () => {
    const result = processConversationTurn({
      conversationId: "reg-3",
      experienceId: "talk-it-out",
      userText: "What do you mean?",
      messages: [
        {
          role: "user",
          content: "I need to decide whether to hire a marketing assistant.",
        },
        {
          role: "assistant",
          content: "What is making you consider hiring one now?",
        },
      ],
      draftText: "You are working through something around does.",
      repairActive: true,
    });
    expect(result.regenerated || result.usedFallback).toBe(true);
    assertNeverForbidden(result.assistantText);
  });

  it("1 hiring → 2 clarification → 3 cost → never forbidden", () => {
    let session = createTalkItOutSession();
    session = advance(
      session,
      "I need to decide whether to hire a marketing assistant.",
    );
    session = advance(session, "What do you mean?");
    session = advance(session, "Cost.");
    expect(session.cieState?.topicAnchor?.primaryTopic?.toLowerCase()).toMatch(
      /hir|market/,
    );
  });

  it("4 nothing underneath correction path", () => {
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
          "There may be a quieter question underneath about whether you feel ready.",
        createdAt: new Date().toISOString(),
      },
    ]);
    const turn = buildTalkItOutTurn(session, "Nothing underneath.");
    assertNeverForbidden(turn.assistantText);
    expect(turn.assistantText.toLowerCase()).toMatch(
      /right|correct|stay|hir|market/,
    );
  });

  it("5 topic change asks before blending", () => {
    let session = createTalkItOutSession();
    session = advance(session, "Should I hire marketing help?");
    const turn = buildTalkItOutTurn(
      session,
      "Actually I want to talk about something else.",
    );
    assertNeverForbidden(turn.assistantText);
  });

  it("6 stop / summary never uses generic closings", () => {
    let session = createTalkItOutSession();
    session = advance(
      session,
      "I need to decide whether to hire a marketing assistant.",
    );
    const turn = buildTalkItOutTurn(session, "that is exactly it");
    assertNeverForbidden(turn.assistantText);
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /is there anything else|great job working/,
    );
  });

  it("7 pause, rename, resume, delete, start fresh", () => {
    let session = createTalkItOutSession();
    session = advance(session, "Should I hire marketing help?");
    session = renameTalkItOutSession(session, "Hiring help");
    expect(session.title).toBe("Hiring help");
    session = pauseTalkItOutSession(session);
    expect(session.needsReentry).toBe(true);
    const resumed = resumeOrCreateTalkItOutSession();
    expect(resumed.id).toBe(session.id);
    deleteTalkItOutSession(resumed.id);
    const fresh = startFreshTalkItOutSession();
    expect(fresh.id).not.toBe(resumed.id);
  });

  it("8 injected bad draft through full Talk It Out polish regenerates", () => {
    // Simulate CQRI/RCI producing a banned line — delivery path must replace it
    let session = createTalkItOutSession();
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content: "I need to decide whether to hire a marketing assistant.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "a1",
        role: "assistant",
        content: "What is making you consider hiring one now?",
        createdAt: new Date().toISOString(),
      },
    ]);
    // Short reply that previously collapsed to Take your time
    const turn = buildTalkItOutTurn(session, "Cost.");
    assertNeverForbidden(turn.assistantText);
    expect(turn.cieState).toBeTruthy();
  });
});
