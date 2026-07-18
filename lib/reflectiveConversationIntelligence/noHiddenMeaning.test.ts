import { beforeEach, describe, expect, it } from "vitest";
import {
  applyUserCorrectionToMap,
  buildDirectCorrectionRepair,
  containsUnsupportedHiddenMeaning,
  countInterpretationEvidence,
  detectsDirectCorrection,
  emptyThinkingMap,
  interpretationAllowedFromEvidence,
  runReflectiveTurn,
  updateThinkingMap,
} from "./index";
import {
  appendTalkItOutMessages,
  buildTalkItOutTurn,
  createTalkItOutSession,
  resetTalkItOutSessionsForTests,
} from "@/lib/talkItOut";

describe("Package 192 — no hidden meaning", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
  });

  it("blocks quieter-underneath language", () => {
    expect(
      containsUnsupportedHiddenMeaning(
        "Tell me if I am reading this wrong — there may be a quieter question underneath.",
      ),
    ).toBe(true);
  });

  it("detects direct corrections", () => {
    expect(detectsDirectCorrection("Nothing underneath.")).toBe(true);
    expect(detectsDirectCorrection("That is not what I mean.")).toBe(true);
    expect(detectsDirectCorrection("You are reading it wrong.")).toBe(true);
    expect(detectsDirectCorrection("I should hire someone.")).toBe(false);
  });

  it("opening hire turn stays concrete — no hidden meaning", () => {
    const session = createTalkItOutSession();
    const turn = buildTalkItOutTurn(
      session,
      "If I should hire a marketing/sales person.",
    );
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /quieter|underneath|really about|something deeper/,
    );
    expect(turn.assistantText.toLowerCase()).toMatch(
      /hir|market|sales|cost|timing|plate|consider/,
    );
    expect(turn.assistantText).toMatch(/\?/);
    expect(turn.thinkingMap?.archetype).toBe("business-decision");
    expect(turn.thinkingMap?.interpretationAllowed).toBe(false);
  });

  it("user correction accepts, returns to hiring, blocks Take your time", () => {
    let session = createTalkItOutSession();
    const first = buildTalkItOutTurn(
      session,
      "If I should hire a marketing/sales person.",
    );
    session = appendTalkItOutMessages(
      session,
      [
        {
          id: "u1",
          role: "user",
          content: "If I should hire a marketing/sales person.",
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

    const repair = buildTalkItOutTurn(session, "Nothing underneath.");
    expect(repair.responseKind).toBe("repair");
    expect(repair.assistantText.toLowerCase()).toMatch(
      /you(?:'re| are) right|read more into/,
    );
    expect(repair.assistantText.toLowerCase()).toMatch(/hir|market|sales/);
    expect(repair.assistantText).toMatch(/\?/);
    expect(repair.assistantText.toLowerCase()).not.toMatch(
      /^take your time\.?$|i am with you|what else wants to be said/,
    );
    expect(repair.thinkingMap?.userCorrections.length).toBeGreaterThan(0);
    expect(repair.thinkingMap?.rejectedInterpretations.length).toBeGreaterThan(
      0,
    );
  });

  it("does not reuse rejected hidden-meaning interpretation", () => {
    const map = applyUserCorrectionToMap(
      {
        ...emptyThinkingMap(),
        literalTopic: "hiring marketing or sales help",
      },
      "Nothing underneath.",
      "Tell me if I am reading this wrong — there may be a quieter question underneath.",
    );
    const r = runReflectiveTurn({
      experienceId: "talk-it-out",
      messages: [
        {
          role: "user",
          content: "If I should hire a marketing/sales person.",
        },
        {
          role: "assistant",
          content:
            "Tell me if I am reading this wrong — there may be a quieter question underneath.",
        },
        { role: "user", content: "Nothing underneath." },
      ],
      userText: "The cost is what worries me most.",
      previousMap: map,
      candidateQuestions: [
        {
          id: "q1",
          text: "What feels most unfinished?",
          area: "meaning",
        },
        {
          id: "wh-hire-why",
          text: "What is making you consider hiring someone now?",
          area: "what-happened",
        },
      ],
    });
    expect(r.assistantText.toLowerCase()).not.toMatch(
      /quieter question underneath|something underneath/,
    );
  });

  it("evidence threshold blocks early interpretation", () => {
    const map = updateThinkingMap(
      emptyThinkingMap(),
      "If I should hire a marketing/sales person.",
      [
        {
          role: "user",
          content: "If I should hire a marketing/sales person.",
        },
      ],
    );
    expect(map.interpretationEvidenceCount).toBeLessThan(2);
    expect(interpretationAllowedFromEvidence(map.interpretationEvidenceCount)).toBe(
      false,
    );

    const richer = updateThinkingMap(
      map,
      "I keep avoiding the cost decision and I am afraid of picking wrong.",
      [
        {
          role: "user",
          content: "If I should hire a marketing/sales person.",
        },
        {
          role: "user",
          content:
            "I keep avoiding the cost decision and I am afraid of picking wrong.",
        },
      ],
    );
    expect(
      countInterpretationEvidence(
        richer,
        "I keep avoiding the cost decision and I am afraid of picking wrong.",
        [
          {
            role: "user",
            content: "If I should hire a marketing/sales person.",
          },
          {
            role: "user",
            content:
              "I keep avoiding the cost decision and I am afraid of picking wrong.",
          },
        ],
      ),
    ).toBeGreaterThanOrEqual(2);
  });

  it("buildDirectCorrectionRepair returns to topic", () => {
    const built = buildDirectCorrectionRepair({
      map: {
        ...emptyThinkingMap(),
        literalTopic: "hiring marketing or sales help",
      },
      messages: [
        {
          role: "assistant",
          content:
            "Tell me if I am reading this wrong — there may be a quieter question underneath.",
        },
      ],
    });
    expect(built.text).toMatch(/hiring marketing or sales help/i);
    expect(built.text).toMatch(/\?/);
    expect(built.rejectedInterpretation).toBeTruthy();
  });

  it("That is not what I mean triggers immediate acceptance", () => {
    let session = createTalkItOutSession();
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content: "If I should hire a marketing/sales person.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "a1",
        role: "assistant",
        content: "There may be a quieter question underneath.",
        createdAt: new Date().toISOString(),
      },
    ]);
    const turn = buildTalkItOutTurn(session, "That is not what I mean.");
    expect(turn.assistantText.toLowerCase()).toMatch(
      /you(?:'re| are) right|read more into|stay with/,
    );
    expect(turn.assistantText.toLowerCase()).not.toMatch(
      /^take your time|tell me more\.?$/,
    );
  });
});
