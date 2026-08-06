/**
 * Chat-First Reasoning Experience Preview — journey logic.
 *
 * Proves the one universal conversation pattern (acknowledge → understand →
 * reflect → suggest) carries all four authored Build Journeys, honors the
 * founder-specified SOP script verbatim, and never surfaces builder
 * machinery (templates, categories, checklists, numbered stages).
 */

import { describe, expect, it } from "vitest";
import {
  answerCurrentQuestion,
  completionMessages,
  currentQuestion,
  detectJourney,
  isJourneyComplete,
  JOURNEY_CHIP_EXAMPLES,
  journeyAcknowledgment,
  journeyFor,
  OPENING_QUESTION,
  OPENING_SUPPORT,
  RESEARCH_DECLINE_LINE,
  RESEARCH_KEPT_NOTE,
  RESEARCH_RETURN_LINE,
  researchAcceptMessages,
  researchDeclineMessages,
  researchOfferFor,
  startJourney,
  thinkingHelpFor,
  UNCLEAR_REPLY,
  type JourneyId,
  type JourneyState,
} from "./chatFirstReasoningJourney";

const ALL_JOURNEYS: JourneyId[] = [
  "sop",
  "workshop",
  "event",
  "newsletter",
  "marketing",
];

function runFullJourney(text: string, answers: [string, string, string]) {
  const started = startJourney(text);
  expect(started).not.toBeNull();
  let state = started!.state;
  const sparkLines = [...started!.messages];
  for (const answer of answers) {
    const advanced = answerCurrentQuestion(state, answer);
    state = advanced.state;
    sparkLines.push(...advanced.messages);
  }
  return { state, sparkLines };
}

describe("opening", () => {
  it("uses the approved opening question — planning included — and supporting line verbatim", () => {
    expect(OPENING_QUESTION).toBe(
      "What would you like to create, plan, develop, or build?",
    );
    expect(OPENING_SUPPORT).toBe(
      "Tell me what you're trying to make happen. It doesn't have to be fully figured out yet. We'll work through it together.",
    );
  });

  it("detects each of the five example chips", () => {
    expect(JOURNEY_CHIP_EXAMPLES).toHaveLength(5);
    const detected = JOURNEY_CHIP_EXAMPLES.map((chip) => detectJourney(chip));
    expect(detected).toEqual([
      "sop",
      "workshop",
      "event",
      "newsletter",
      "marketing",
    ]);
  });

  it("recognizes planning goals — experiences and events, not just artifacts", () => {
    expect(detectJourney("I want to plan a retreat for my clients.")).toBe("event");
    expect(detectJourney("help me plan a client appreciation event")).toBe("event");
    expect(detectJourney("I'm thinking about running a webinar")).toBe("event");
    // Workshops keep their own, more specific journey.
    expect(detectJourney("I want to plan a workshop.")).toBe("workshop");
  });

  it("returns null for unclear requests so the preview can gently clarify", () => {
    expect(startJourney("I have an idea but don't know what to do with it")).toBeNull();
    expect(startJourney("")).toBeNull();
  });

  it("never asks the member to repeat themselves when intent is unclear — it moves forward", () => {
    expect(UNCLEAR_REPLY).not.toMatch(/tell me (a little )?more about what/i);
    expect(UNCLEAR_REPLY).toMatch(/\?$/);
  });
});

describe("SOP journey — the founder-specified script", () => {
  it("acknowledges the member's own subject before any writing", () => {
    expect(
      journeyAcknowledgment("sop", "I need an SOP for onboarding clients."),
    ).toBe(
      "I hear that you're looking to create an SOP for onboarding clients. Before we start writing steps, let's understand what this process needs to accomplish.",
    );
  });

  it("falls back to a plain acknowledgment when no subject is offered", () => {
    expect(journeyAcknowledgment("sop", "help me write an SOP")).toBe(
      "I hear that you're looking to create an SOP. Before we start writing steps, let's understand what this process needs to accomplish.",
    );
  });

  it("asks the three reasoning-first questions in order", () => {
    const journey = journeyFor("sop");
    expect(journey.questions.map((q) => q.prompt)).toEqual([
      "What should someone be able to accomplish after following this SOP?",
      "Who will use this process once it is created?",
      "Do you already have a process, notes, documents, or examples we can build from?",
    ]);
  });

  it("offers the founder-specified research concept line", () => {
    const started = startJourney("I need an SOP for onboarding clients.");
    expect(researchOfferFor(started!.state)).toBe(
      "Would it help if I researched current client onboarding best practices before we design this section?",
    );
  });

  it("acknowledges what was learned after every answer, then reflects and suggests", () => {
    const { state, sparkLines } = runFullJourney(
      "I need an SOP for onboarding clients.",
      [
        "A new VA can onboard a client without me",
        "My virtual assistant",
        "Some notes in a doc",
      ],
    );
    expect(isJourneyComplete(state)).toBe(true);

    // Every answer earned an acknowledgment before the next question.
    const journey = journeyFor("sop");
    for (const q of journey.questions) {
      expect(sparkLines).toContain(q.learnedAcknowledgment);
    }

    // The closing reflection carries the member's own words forward.
    const recap = sparkLines.find((line) =>
      line.startsWith("Here's what I'm carrying forward"),
    );
    expect(recap).toBeDefined();
    expect(recap).toContain("A new VA can onboard a client without me");
    expect(recap).toContain("My virtual assistant");
    expect(recap).toContain("Some notes in a doc");

    // Direction is suggested; creation stays consent-gated, even in concept.
    expect(
      sparkLines.some((line) =>
        line.includes("nothing gets created until you say go"),
      ),
    ).toBe(true);
  });
});

describe("research as a capability at every step", () => {
  it("accepted research shows the concept finding, keeps the learning, and returns to the exact question", () => {
    const started = startJourney("I want to plan a workshop.");
    let state = started!.state;
    state = answerCurrentQuestion(state, "Run discovery calls confidently").state;

    const q2 = currentQuestion(state)!;
    const messages = researchAcceptMessages(state);
    expect(messages[0]).toBe(journeyFor("workshop").researchPreviewFinding);
    expect(messages[1]).toBe(RESEARCH_KEPT_NOTE);
    expect(messages.at(-1)).toBe(`${RESEARCH_RETURN_LINE}\n\n${q2.prompt}`);
  });

  it("declined research adds no friction and still returns to the exact question", () => {
    const started = startJourney("I need a newsletter.");
    const q1 = currentQuestion(started!.state)!;
    const messages = researchDeclineMessages(started!.state);
    expect(messages[0]).toBe(RESEARCH_DECLINE_LINE);
    expect(messages.at(-1)).toBe(`${RESEARCH_RETURN_LINE}\n\n${q1.prompt}`);
  });
});

describe("the one universal pattern across journeys", () => {
  it("every journey has three authored questions with help and recap", () => {
    for (const id of ALL_JOURNEYS) {
      const journey = journeyFor(id);
      expect(journey.questions).toHaveLength(3);
      for (const q of journey.questions) {
        expect(q.prompt.trim()).not.toBe("");
        expect(q.learnedAcknowledgment.trim()).not.toBe("");
        expect(q.thinkingHelp.trim()).not.toBe("");
        expect(q.recapLabel.trim()).not.toBe("");
      }
      expect(journey.researchOffer).toMatch(/^Would it help if I/);
      expect(journey.researchPreviewFinding).toContain("Concept demonstration");
      expect(journey.openDecisionNote).toMatch(/^One thing we haven't settled yet/);
    }
  });

  it("names one unsettled decision at journey close, before suggesting direction", () => {
    const { sparkLines } = runFullJourney("I need a marketing strategy.", [
      "Steady inquiries",
      "Local creatives",
      "Posted sporadically",
    ]);
    const decisionIndex = sparkLines.indexOf(
      journeyFor("marketing").openDecisionNote,
    );
    const directionIndex = sparkLines.findIndex((line) =>
      line.includes("nothing gets created until you say go"),
    );
    expect(decisionIndex).toBeGreaterThan(-1);
    expect(directionIndex).toBeGreaterThan(decisionIndex);
  });

  it("thinking help follows the current question as it advances", () => {
    const started = startJourney("I want to plan a workshop.");
    let state = started!.state;
    expect(thinkingHelpFor(state)).toBe(
      journeyFor("workshop").questions[0].thinkingHelp,
    );
    state = answerCurrentQuestion(state, "Confidence to run discovery calls").state;
    expect(thinkingHelpFor(state)).toBe(
      journeyFor("workshop").questions[1].thinkingHelp,
    );
  });

  it("completes each journey with a recap, a suggested direction, and the preview boundary", () => {
    const inputs: Record<JourneyId, string> = {
      sop: "I need an SOP for invoicing",
      workshop: "I want to plan a workshop.",
      event: "I want to plan a retreat for my clients.",
      newsletter: "I need a newsletter.",
      marketing: "I need a marketing strategy.",
    };
    for (const id of ALL_JOURNEYS) {
      const { state, sparkLines } = runFullJourney(inputs[id], [
        "first answer",
        "second answer",
        "third answer",
      ]);
      expect(isJourneyComplete(state)).toBe(true);
      expect(currentQuestion(state)).toBeNull();
      expect(sparkLines.at(-1)).toContain("This preview pauses here");
      expect(
        sparkLines.some((line) =>
          line.includes(journeyFor(id).outcomeLabel),
        ),
      ).toBe(true);
    }
  });

  it("omits skipped-feeling empty answers from the recap instead of echoing blanks", () => {
    const state: JourneyState = {
      journeyId: "newsletter",
      originalText: "I need a newsletter.",
      answers: ["Feel understood", "", "My launch emails"],
    };
    const recap = completionMessages(state)[0];
    expect(recap).toContain("Feel understood");
    expect(recap).toContain("My launch emails");
    expect(recap).not.toMatch(/—\s*$/m);
  });
});

describe("what the preview must never show", () => {
  it("no scripted Spark line surfaces builder machinery", () => {
    const banned = /template|categor|checklist|\bstages?\b|\bform\b/i;
    for (const id of ALL_JOURNEYS) {
      const journey = journeyFor(id);
      const lines = [
        journeyAcknowledgment(id, journey.chipExample),
        journey.researchPreviewFinding,
        journey.openDecisionNote,
        RESEARCH_KEPT_NOTE,
        RESEARCH_DECLINE_LINE,
        ...journey.questions.flatMap((q) => [
          q.prompt,
          q.learnedAcknowledgment,
          q.thinkingHelp,
          q.recapLabel,
        ]),
        ...completionMessages({
          journeyId: id,
          originalText: journey.chipExample,
          answers: ["one", "two", "three"],
        }),
      ];
      for (const line of lines) {
        expect(line).not.toMatch(banned);
      }
    }
  });
});
