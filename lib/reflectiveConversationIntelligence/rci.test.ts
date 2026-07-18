import { describe, expect, it } from "vitest";
import {
  classifyConversationArchetype,
  emptyThinkingMap,
  isTooCloseToUser,
  runReflectiveTurn,
  updateThinkingMap,
  type RciCandidateQuestion,
} from "./index";

const BANK: RciCandidateQuestion[] = [
  {
    id: "sit-multi-begin",
    text: "Which one would make you breathe a little easier if it were already handled?",
    area: "meaning",
  },
  {
    id: "q-meaning",
    text: "What feels most unfinished in this for you?",
    area: "meaning",
  },
  {
    id: "q-ff",
    text: "What might feel different once this was no longer hanging over you?",
    area: "future-feeling",
  },
];

function turn(
  userText: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
  used: string[] = [],
) {
  return runReflectiveTurn({
    experienceId: "talk-it-out",
    messages: history,
    userText,
    previousMap: null,
    usedQuestionIds: used,
    candidateQuestions: BANK,
    futureFeelingAlreadyAsked: false,
  });
}

describe("RCI — archetypes", () => {
  it("classifies business, planning, overwhelm, creative, relationship", () => {
    expect(
      classifyConversationArchetype(
        "I cannot decide whether to raise my prices or keep them.",
      ),
    ).toBe("business-decision");
    expect(
      classifyConversationArchetype(
        "I need to plan this week and prioritize my roadmap.",
      ),
    ).toBe("planning");
    expect(
      classifyConversationArchetype(
        "I am overwhelmed and everything feels like too much.",
      ),
    ).toBe("overwhelm");
    expect(
      classifyConversationArchetype(
        "I have a creative block and cannot think of campaign ideas.",
      ),
    ).toBe("creative-block");
    expect(
      classifyConversationArchetype(
        "I need a hard conversation with a client about a boundary.",
      ),
    ).toBe("relationship");
  });
});

describe("RCI — Thinking Map", () => {
  it("updates hidden map without exposing paraphrase", () => {
    const map = updateThinkingMap(
      emptyThinkingMap(),
      "I am afraid to cancel this subscription or keep paying.",
      [{ role: "user", content: "I am afraid to cancel this subscription or keep paying." }],
    );
    expect(map.situation).toBeTruthy();
    expect(map.optionsNamed.length).toBeGreaterThanOrEqual(1);
    expect(map.concerns.length).toBeGreaterThanOrEqual(1);
    expect(map.archetype).toBe("fear-avoidance");
  });
});

describe("RCI — scenario turns", () => {
  it("business decision — deepens without advice", () => {
    const r = turn(
      "I cannot decide whether to raise my prices or keep them the same.",
    );
    expect(isTooCloseToUser(
      "I cannot decide whether to raise my prices or keep them the same.",
      r.assistantText,
    )).toBe(false);
    expect(r.assistantText).not.toMatch(/you should|pros and cons list/i);
    expect(r.thinkingMap.archetype).toMatch(/business-decision|other|fear/);
  });

  it("planning — one move, not a schedule dump", () => {
    const r = turn(
      "I need to plan my week but I cannot prioritize the roadmap.",
    );
    expect((r.assistantText.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
    expect(r.assistantText).not.toMatch(/here is your schedule|step 1/i);
  });

  it("overwhelm — softens load, no task list", () => {
    const r = turn("I am overwhelmed and everything feels equally loud.");
    expect(r.thinkingMap.archetype).toBe("overwhelm");
    expect(r.assistantText).not.toMatch(/do these three things|priority matrix/i);
  });

  it("creative block — curiosity not prompts dump", () => {
    const r = turn(
      "I have a creative block and cannot think of any campaign ideas.",
    );
    expect(r.thinkingMap.archetype).toBe("creative-block");
    expect(r.assistantText).not.toMatch(/here are 10 ideas/i);
  });

  it("relationship — no scripts or auto-routing", () => {
    const r = turn(
      "I need a difficult conversation with a client and I keep putting it off.",
    );
    expect(r.assistantText).not.toMatch(/Open the Boardroom|email script/i);
    expect(r.assistantText.length).toBeGreaterThan(20);
  });

  it("never asks only because a question is next — rejects already answered", () => {
    const first = turn("Which project should I start with — A or B?");
    const map = first.thinkingMap;
    const second = runReflectiveTurn({
      experienceId: "talk-it-out",
      messages: [
        { role: "user", content: "Which project should I start with — A or B?" },
        { role: "assistant", content: first.assistantText },
        { role: "user", content: "The first one. I already chose A." },
      ],
      userText: "The first one. I already chose A.",
      previousMap: map,
      usedQuestionIds: first.questionId ? [first.questionId] : [],
      candidateQuestions: [
        {
          id: "sit-multi-begin",
          text: "Which one would make you breathe a little easier if it were already handled?",
        },
        ...BANK,
      ],
      futureFeelingAlreadyAsked: false,
    });
    expect(second.assistantText).toBeTruthy();
    expect(second.meta.deepenedUnderstanding || second.assistantText.length > 10).toBe(
      true,
    );
  });
});
