/**
 * Packages 200–207 — Talk It Out complete architecture scenarios.
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  CONVERSATION_DESIGN_PATTERNS,
  selectConversationDesignPattern,
} from "@/lib/conversationDesignPatterns";
import {
  TALK_IT_OUT_OPENING,
  appendTalkItOutMessages,
  applyExplicitPreferenceStatement,
  buildTalkItOutReentry,
  buildTalkItOutTurn,
  certifyFirstResponse,
  classifyTalkItOutIntent,
  clearTalkItOutPreferences,
  createTalkItOutSession,
  deleteTalkItOutSession,
  detectCompletionSignal,
  filterQuestionCandidates,
  isBannedQuestionText,
  isCanonicalOpening,
  loadTalkItOutPreferences,
  pauseTalkItOutSession,
  renameTalkItOutSession,
  resetTalkItOutPreferencesForTests,
  resetTalkItOutSessionsForTests,
  resumeOrCreateTalkItOutSession,
  selectStrategyMove,
  startFreshTalkItOutSession,
  validateTalkItOutQuestion,
} from "@/lib/talkItOut";

describe("200 — experience standard", () => {
  it("uses canonical opening", () => {
    expect(isCanonicalOpening(TALK_IT_OUT_OPENING)).toBe(true);
    const session = createTalkItOutSession();
    expect(session.messages[0]?.content).toBe(TALK_IT_OUT_OPENING);
  });

  it("first hire response stays grounded", () => {
    resetTalkItOutSessionsForTests();
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "If I should hire a marketing assistant or not.",
    );
    const cert = certifyFirstResponse({
      text: turn.assistantText,
      userText: "If I should hire a marketing assistant or not.",
    });
    expect(cert.passed).toBe(true);
    expect(turn.assistantText.toLowerCase()).toMatch(/hir|market|consider/);
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /quieter question underneath|something around does/,
    );
  });
});

describe("201 — strategy library", () => {
  it("opens with why-now on early turns", () => {
    expect(
      selectStrategyMove({
        turnCount: 1,
        usedMoves: [],
        hireLike: true,
      }),
    ).toBe("clarify_why_now");
  });
});

describe("202 — mode boundaries", () => {
  it("keeps reflective hire talk in Talk It Out", () => {
    const r = classifyTalkItOutIntent(
      "I need to think through whether to hire.",
    );
    expect(r.stayInTalkItOut).toBe(true);
    expect(r.intent).toBe("reflective");
  });

  it("offers creation transition without auto-launch", () => {
    resetTalkItOutSessionsForTests();
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "Write a job description for a marketing assistant.",
    );
    expect(turn.designPatternId).toBe("CDP-TRANSITION-PERMISSION");
    expect(turn.assistantText.toLowerCase()).toMatch(/draft|when you want|ready/);
    expect(turn.assistantText).not.toMatch(/Opening the|Launch/);
  });
});

describe("203 — question intelligence", () => {
  it("blocks banned abstract probes", () => {
    expect(isBannedQuestionText("What matters most to you here?")).toBe(true);
    expect(isBannedQuestionText("What feels unfinished?")).toBe(true);
    const filtered = filterQuestionCandidates(
      [
        { text: "What matters most to you here?" },
        { text: "What is making you consider hiring someone now?" },
      ],
      { concreteContext: true },
    );
    expect(filtered).toHaveLength(1);
  });

  it("flags stacked questions", () => {
    const v = validateTalkItOutQuestion({
      responseText: "Why now? What would they do? How much can you spend?",
      userText: "Should I hire?",
      concreteContext: true,
    });
    expect(v.failures).toContain("STACKED_QUESTIONS");
  });
});

describe("204 — completion", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("summarizes when user is clear", () => {
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
    expect(detectCompletionSignal("that is exactly it")).toBe("exact_match");
    const done = buildTalkItOutTurn(session, "that is exactly it");
    expect(done.designPatternId).toBe("CDP-NATURAL-COMPLETION");
    expect(done.usefulSummary).toBeTruthy();
    expect(done.assistantText.toLowerCase()).not.toMatch(
      /is there anything else|great job working/,
    );
  });
});

describe("205 — personalization & continuity", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
    resetTalkItOutPreferencesForTests();
  });

  it("persists explicit direct-question preference", () => {
    applyExplicitPreferenceStatement("Ask me direct questions.");
    expect(loadTalkItOutPreferences().questionStyle).toBe("direct");
    clearTalkItOutPreferences();
  });

  it("renames, deletes, and starts fresh", () => {
    const session = createTalkItOutSession();
    const renamed = renameTalkItOutSession(session, "Hiring help");
    expect(renamed.title).toBe("Hiring help");
    deleteTalkItOutSession(renamed.id);
    const fresh = startFreshTalkItOutSession();
    expect(fresh.id).not.toBe(renamed.id);
    expect(fresh.messages[0]?.content).toBe(TALK_IT_OUT_OPENING);
  });

  it("re-entry is grounded after pause", () => {
    let session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "Should I hire marketing help?",
    );
    session = appendTalkItOutMessages(
      session,
      [
        {
          id: "u1",
          role: "user",
          content: "Should I hire marketing help?",
          createdAt: new Date().toISOString(),
        },
        {
          id: "a1",
          role: "assistant",
          content: turn.assistantText,
          createdAt: new Date().toISOString(),
        },
      ],
      {
        thinkingMap: turn.thinkingMap,
        cieState: turn.cieState,
        topic: turn.thinkingMap?.topicAnchor?.primaryTopic ?? "hiring help",
      },
    );
    session = pauseTalkItOutSession(session);
    expect(session.needsReentry).toBe(true);
    const text = buildTalkItOutReentry({
      topicAnchor: session.topic,
      currentFocus: "cost",
    });
    expect(text.toLowerCase()).toMatch(/talking about/);
    expect(text.toLowerCase()).not.toMatch(/welcome back|continue your journey/);
    const resumed = resumeOrCreateTalkItOutSession();
    expect(resumed.id).toBe(session.id);
  });
});

describe("206 — required multi-turn scenarios", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
    resetTalkItOutPreferencesForTests();
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
    const clarify = buildTalkItOutTurn(session, "What does that mean?");
    expect(clarify.assistantText.toLowerCase()).not.toMatch(
      /something around does/,
    );
  });

  it("nothing underneath returns to topic", () => {
    let session = createTalkItOutSession();
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content: "Should I hire?",
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
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /quieter question underneath/,
    );
  });

  it("one-word cost answer keeps topic", () => {
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
    const cost = buildTalkItOutTurn(session, "Cost.");
    expect(cost.assistantText.toLowerCase()).toMatch(
      /hir|market|cost|invest|spend|worth/,
    );
    expect(cost.thinkingMap?.topicAnchor?.primaryTopic?.toLowerCase()).toMatch(
      /hir|market/,
    );
  });
});

describe("207 — shared conversation design patterns", () => {
  it("registers certified core patterns", () => {
    expect(CONVERSATION_DESIGN_PATTERNS.length).toBeGreaterThanOrEqual(11);
    expect(
      CONVERSATION_DESIGN_PATTERNS.every((p) => p.certificationStatus === "certified"),
    ).toBe(true);
    expect(
      selectConversationDesignPattern({
        experienceId: "talk-it-out",
        priorityEvent: "direct_correction",
      }),
    ).toBe("CDP-ACCEPT-CORRECTION");
  });
});
