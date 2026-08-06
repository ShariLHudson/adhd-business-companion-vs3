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
  researchOfferFor,
  startJourney,
  thinkingHelpFor,
  type JourneyId,
  type JourneyState,
} from "./chatFirstReasoningJourney";

const ALL_JOURNEYS: JourneyId[] = ["sop", "workshop", "newsletter", "marketing"];

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
  it("uses the approved opening question and supporting line verbatim", () => {
    expect(OPENING_QUESTION).toBe(
      "What would you like to create, develop, or build?",
    );
    expect(OPENING_SUPPORT).toBe(
      "Tell me what you're trying to make happen. It doesn't have to be fully figured out yet. We'll work through it together.",
    );
  });

  it("detects each of the four example chips", () => {
    expect(JOURNEY_CHIP_EXAMPLES).toHaveLength(4);
    const detected = JOURNEY_CHIP_EXAMPLES.map((chip) => detectJourney(chip));
    expect(detected).toEqual(["sop", "workshop", "newsletter", "marketing"]);
  });

  it("returns null for unclear requests so the preview can gently clarify", () => {
    expect(startJourney("I have an idea but don't know what to do with it")).toBeNull();
    expect(startJourney("")).toBeNull();
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
    }
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
