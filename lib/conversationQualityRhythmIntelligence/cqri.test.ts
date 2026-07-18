import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildSafeFallback,
  detectConversationPhase,
  isBannedFallbackPhrase,
  lastAssistantAskedQuestion,
  preferObservationOverQuestion,
  resetCqriTelemetryForTests,
  runConversationQualityAndRhythm,
  runQualityGate,
  selectLengthCategory,
  selectResponseShape,
  shouldSuppressQuestion,
} from "./index";
import {
  appendTalkItOutMessages,
  buildTalkItOutTurn,
  createTalkItOutSession,
  resetTalkItOutSessionsForTests,
} from "@/lib/talkItOut";

describe("CQRI — conversation phases", () => {
  it("maps Opening → Exploration → Discovery → Completion", () => {
    expect(
      detectConversationPhase({
        messages: [{ role: "assistant", content: "What is on your mind?" }],
        userText: "I need to hire someone.",
      }),
    ).toBe("opening");

    expect(
      detectConversationPhase({
        messages: [
          { role: "assistant", content: "What is on your mind?" },
          { role: "user", content: "I need to hire someone." },
          { role: "assistant", content: "What feels hardest about that?" },
        ],
        userText: "Mostly the cost.",
      }),
    ).toBe("exploration");

    expect(
      detectConversationPhase({
        messages: [
          { role: "user", content: "a" },
          { role: "assistant", content: "q1?" },
          { role: "user", content: "b" },
          { role: "assistant", content: "q2?" },
          { role: "user", content: "c" },
        ],
        userText: "I keep coming back to trust more than cost.",
        thinkingMap: {
          situation: "hiring",
          goal: null,
          facts: [],
          optionsNamed: ["hire", "do it myself"],
          assumptions: [],
          constraints: [],
          unknowns: [],
          concerns: ["cost"],
          values: [],
          tradeOffs: [],
          resources: [],
          patterns: [],
          questionsAnswered: ["cost", "trust"],
          questionsWorthExploring: [],
          emergingInsights: ["trust matters more"],
          archetype: "business-decision",
          turnCount: 4,
          lastUserText: null,
          rejectedInterpretations: [],
          userCorrections: [],
          literalTopic: "hiring",
          interpretationEvidenceCount: 2,
          interpretationAllowed: true,
        },
      }),
    ).toBe("discovery");

    expect(
      detectConversationPhase({
        messages: Array.from({ length: 5 }, (_, i) =>
          i % 2 === 0
            ? { role: "user" as const, content: `turn ${i}` }
            : { role: "assistant" as const, content: `q ${i}?` },
        ),
        userText: "That makes it clearer — I think I know what bothers me.",
        thinkingMap: {
          situation: "hiring",
          goal: null,
          facts: [],
          optionsNamed: ["hire"],
          assumptions: [],
          constraints: [],
          unknowns: [],
          concerns: [],
          values: [],
          tradeOffs: [],
          resources: [],
          patterns: [],
          questionsAnswered: ["a", "b"],
          questionsWorthExploring: [],
          emergingInsights: ["clearer"],
          archetype: "business-decision",
          turnCount: 6,
          lastUserText: null,
          rejectedInterpretations: [],
          userCorrections: [],
          literalTopic: "hiring",
          interpretationEvidenceCount: 2,
          interpretationAllowed: true,
        },
      }),
    ).toBe("completion");
  });

  it("completion phase prefers invitation or brevity over a fresh interview question", () => {
    const shape = selectResponseShape(
      {
        experienceId: "talk-it-out",
        userText: "I think I understand this better now.",
        messages: [
          { role: "user", content: "one" },
          { role: "assistant", content: "What feels hardest?" },
          { role: "user", content: "two" },
          { role: "assistant", content: "What about cost?" },
          { role: "user", content: "three" },
          { role: "assistant", content: "And trust?" },
          { role: "user", content: "four" },
          { role: "assistant", content: "Anything else?" },
        ],
        draftText: "What other angles have you not considered yet?",
        responseKind: "clarifying-question",
        conversationPhase: "completion",
      },
      "completion",
    );
    expect([
      "intentional-brevity",
      "invitation-to-continue",
      "one-observation",
      "short-summary",
      "brief-acknowledgement",
    ]).toContain(shape);
  });
});

describe("CQRI — rhythm", () => {
  beforeEach(() => {
    resetCqriTelemetryForTests();
  });

  it("suppresses a question when the previous assistant turn already asked one", () => {
    expect(
      shouldSuppressQuestion({
        messages: [
          { role: "assistant", content: "What feels hardest about that?" },
          { role: "user", content: "The cost of hiring someone." },
        ],
        userText: "The cost of hiring someone.",
      }),
    ).toBe(true);
  });

  it("selects brief acknowledgement for one-word answers", () => {
    const shape = selectResponseShape({
      experienceId: "talk-it-out",
      userText: "Maybe.",
      messages: [
        { role: "assistant", content: "What feels hardest?" },
        { role: "user", content: "Maybe." },
      ],
      draftText: "I wonder whether the cost or the trust is heavier. What do you think?",
      responseKind: "clarifying-question",
    });
    expect(["brief-acknowledgement", "intentional-brevity", "one-observation"]).toContain(
      shape,
    );
  });

  it("allows expanded length during repair", () => {
    expect(
      selectLengthCategory({
        userText: "What do you mean?",
        repairActive: true,
        responseKind: "repair",
      }),
    ).toBe("expanded");
  });

  it("strips a trailing question when observation is preferred", () => {
    const result = preferObservationOverQuestion({
      text: "You seem torn about cost. What matters most?",
      messages: [
        { role: "assistant", content: "Which option feels heavier?" },
        { role: "user", content: "Mostly the cost of getting it wrong." },
      ],
      userText: "Mostly the cost of getting it wrong.",
      responseKind: "gentle-observation",
    });
    expect(result.blockedQuestion).toBe(true);
    expect(result.text.includes("?")).toBe(false);
  });

  it("never leaves multiple reflective questions after CQRI", () => {
    const out = runConversationQualityAndRhythm({
      experienceId: "talk-it-out",
      userText: "I keep avoiding three projects.",
      messages: [],
      draftText:
        "Which one is heaviest? And what would make starting easier? Also, who could help?",
      responseKind: "clarifying-question",
    });
    expect((out.approvedText.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
  });
});

describe("CQRI — quality gate", () => {
  it("blocks advice in Talk It Out", () => {
    const q = runQualityGate("You should hire someone this week.", {
      experienceId: "talk-it-out",
      userText: "Should I hire?",
      messages: [],
      draftText: "You should hire someone this week.",
      responseKind: "gentle-observation",
    });
    expect(q.passed).toBe(false);
    expect(q.failures).toContain("purpose-advice");
  });

  it("blocks banned generic coaching phrases", () => {
    expect(isBannedFallbackPhrase("What else wants to be said?")).toBe(true);
    const q = runQualityGate("What else wants to be said?", {
      experienceId: "talk-it-out",
      userText: "I'm stuck.",
      messages: [],
      draftText: "What else wants to be said?",
      responseKind: "clarifying-question",
    });
    expect(q.failures).toContain("banned-fallback");
  });

  it("blocks already-answered option questions", () => {
    const q = runQualityGate("What possibilities have you considered?", {
      experienceId: "talk-it-out",
      userText:
        "I could hire a marketer or keep doing it myself — those are the only options.",
      messages: [],
      draftText: "What possibilities have you considered?",
      responseKind: "clarifying-question",
    });
    expect(q.failures).toContain("repetition-answered");
  });

  it("uses safe fallback after repeated failure", () => {
    const out = runConversationQualityAndRhythm({
      experienceId: "talk-it-out",
      userText: "I'm stuck between hiring and doing it myself.",
      messages: [],
      draftText:
        "As an AI, here's a breakdown. You should optimize your funnel. What else wants to be said?",
      responseKind: "clarifying-question",
    });
    expect(out.usedFallback || out.quality.passed).toBe(true);
    expect(isBannedFallbackPhrase(out.approvedText)).toBe(false);
    expect(out.approvedText.toLowerCase()).not.toMatch(/you should/);
  });

  it("safe fallback stays grounded", () => {
    const fb = buildSafeFallback(
      "Should I hire a marketer or do it myself given the cost?",
      3,
    );
    expect(fb.toLowerCase()).toMatch(/cost|hire|yourself|untangle|hardest/);
  });
});

describe("CQRI — Talk It Out integration", () => {
  beforeEach(() => {
    resetTalkItOutSessionsForTests();
    resetCqriTelemetryForTests();
  });

  it("does not ask a question on every consecutive turn", () => {
    let session = createTalkItOutSession();
    const first = buildTalkItOutTurn(
      session,
      "I need to decide whether to hire a sales person or keep doing outreach myself.",
    );
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content:
          "I need to decide whether to hire a sales person or keep doing outreach myself.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "a1",
        role: "assistant",
        content: first.assistantText,
        createdAt: new Date().toISOString(),
      },
    ]);
    const second = buildTalkItOutTurn(
      session,
      "Mostly I'm afraid of choosing the wrong person and wasting money.",
    );
    const firstHadQ = (first.assistantText.match(/\?/g) ?? []).length >= 1;
    const secondQs = (second.assistantText.match(/\?/g) ?? []).length;
    // Never stack questions; after package 193 a single topic-anchored follow-up is ok
    expect(secondQs).toBeLessThanOrEqual(1);
    if (firstHadQ && secondQs >= 1) {
      expect(second.assistantText.toLowerCase()).toMatch(
        /hir|sales|outreach|money|person|cost|afraid|wrong/,
      );
    }
    expect(
      lastAssistantAskedQuestion(
        session.messages.map((m) => ({ role: m.role, content: m.content })),
      ),
    ).toBe(firstHadQ);
  });

  it("explains before a new reflective question on confusion", () => {
    let session = createTalkItOutSession();
    session = appendTalkItOutMessages(session, [
      {
        id: "u1",
        role: "user",
        content: "Three projects keep competing.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "a1",
        role: "assistant",
        content:
          "I wonder if they all feel equally urgent. Which one would make you breathe easier?",
        createdAt: new Date().toISOString(),
      },
    ]);
    const turn = buildTalkItOutTurn(session, "What do you mean?");
    expect(turn.responseKind).toBe("repair");
    expect(turn.assistantText.toLowerCase()).toMatch(
      /meant|trying|explain|fair|clearly|land|fit/,
    );
  });
});

describe("CQRI — Talk It Out UI", () => {
  it("keeps composer minimal with integrated mic and progressive More menu", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/TalkItOutPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("talk-it-out-composer");
    expect(panel).toContain("talk-it-out-mic");
    expect(panel).toContain("talk-it-out-progressive-controls");
    expect(panel).toContain("conversationStarted");
    expect(panel).toContain("More…");
    expect(panel).not.toContain("talk-it-out-keep-talking");
    expect(panel).not.toContain("talk-it-out-how-do-i-btn");
    expect(panel).not.toMatch(/\bSpeak\b/);
  });
});
