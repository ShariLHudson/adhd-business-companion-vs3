import { describe, expect, it } from "vitest";
import {
  classifyWorkspaceIntent,
  isClarificationRequest,
  isFieldContentIntent,
  isKnowledgeQuestion,
  isProgressQuestion,
} from "./workspaceIntent";
import { resolveSopCoachTurn } from "./workspaceSopCoach";
import {
  createWorkspaceSession,
  setSopOptions,
  setSopStepValue,
} from "./workspaceSop";

const session = (() => {
  let s = createWorkspaceSession(
    "projects",
    "I need to create a workshop next week",
    "medium",
  );
  s = setSopStepValue(s, "workshop-title", "Stop Spinning, Start Moving");
  s = setSopOptions(s, [
    "ADHD Business Momentum",
    "Stop Spinning, Start Moving",
    "From Overwhelmed to One Clear Step",
  ]);
  return s;
})();

const assistantOptions = `1. ADHD Business Momentum
2. Stop Spinning, Start Moving
3. From Overwhelmed to One Clear Step`;

const ctx = {
  section: "projects" as const,
  title: "Projects",
  view: "create",
  stage: "title",
  selectedItemName: "Stop Spinning, Start Moving",
  selectedItemGoal: null,
};

/** Stress-test phrases — must never be fieldContent */
const CONVERSATIONAL_PHRASES: Array<{
  input: string;
  expectedIntent: string;
}> = [
  { input: "I don't know what to call it.", expectedIntent: "helpRequest" },
  {
    input: "Can you give me better title ideas?",
    expectedIntent: "discovery",
  },
  {
    input: "What does this section mean?",
    expectedIntent: "clarification",
  },
  {
    input: "Why are we doing this step?",
    expectedIntent: "clarification",
  },
  {
    input: "I don't understand what I'm supposed to put here.",
    expectedIntent: "clarification",
  },
  { input: "Can you give me examples?", expectedIntent: "discovery" },
  { input: "I like number 2.", expectedIntent: "confirmation" },
  { input: "Actually, I don't like that title.", expectedIntent: "feedback" },
  {
    input: "Can you make it more curiosity-driven?",
    expectedIntent: "helpRequest",
  },
  { input: "I'm overwhelmed.", expectedIntent: "conversation" },
  { input: "Can you slow this down?", expectedIntent: "clarification" },
  {
    input: "What have we already done?",
    expectedIntent: "conversation",
  },
  {
    input: "Where are we in the process?",
    expectedIntent: "conversation",
  },
  { input: "What comes next?", expectedIntent: "conversation" },
  { input: "I changed my mind.", expectedIntent: "conversation" },
  { input: "Go back to the title.", expectedIntent: "navigation" },
  { input: "Review my outcome.", expectedIntent: "reviewRequest" },
  { input: "Continue where I left off.", expectedIntent: "resumeRequest" },
];

describe("workspace conversational stress test — classification", () => {
  for (const { input, expectedIntent } of CONVERSATIONAL_PHRASES) {
    it(`"${input}" → ${expectedIntent}, not fieldContent`, () => {
      const intent = classifyWorkspaceIntent(input, assistantOptions, {
        session,
      });
      expect(intent.intent).toBe(expectedIntent);
      expect(isFieldContentIntent(input, assistantOptions, { session })).toBe(
        false,
      );
    });
  }

  it("ADHD knowledge question passes to API (not field content)", () => {
    const q = "What are ADHD business owners struggling with?";
    expect(isKnowledgeQuestion(q)).toBe(true);
    expect(isFieldContentIntent(q, "", { session })).toBe(false);
  });

  it("follow-up focus question passes to API", () => {
    const q = "Which of those problems should I focus on?";
    expect(isKnowledgeQuestion(q)).toBe(true);
  });
});

describe("workspace conversational stress test — coach behavior", () => {
  it("selects option 2 for I like number 2", () => {
    const turn = resolveSopCoachTurn(
      session,
      ctx,
      "I like number 2.",
      "medium",
      assistantOptions,
    );
    expect(turn?.fill?.value).toBe("Stop Spinning, Start Moving");
    expect(turn?.fill?.value).not.toBe("I like number 2.");
  });

  it("answers clarification without field fill", () => {
    const sectionsSession = {
      ...session,
      currentStepId: "workshop-sections" as const,
    };
    const turn = resolveSopCoachTurn(
      sectionsSession,
      { ...ctx, stage: "sections" },
      "What does this section mean?",
      "medium",
      "",
    );
    expect(turn?.fill).toBeUndefined();
    expect(turn?.reply).toMatch(/Sections/i);
  });

  it("shows progress for where are we", () => {
    const turn = resolveSopCoachTurn(
      session,
      ctx,
      "Where are we in the process?",
      "medium",
      "",
    );
    expect(turn?.reply).toMatch(/where we are|Current step/i);
    expect(turn?.fill).toBeUndefined();
  });

  it("goes back to title step", () => {
    const advanced = {
      ...session,
      currentStepId: "workshop-outcome" as const,
    };
    const turn = resolveSopCoachTurn(
      advanced,
      ctx,
      "Go back to the title.",
      "medium",
      "",
    );
    expect(turn?.sessionPatch?.currentStepId).toBe("workshop-title");
  });

  it("offers new titles when user dislikes current", () => {
    const turn = resolveSopCoachTurn(
      session,
      ctx,
      "Actually, I don't like that title.",
      "medium",
      "",
    );
    expect(turn?.reply).toMatch(/other directions|number 2/i);
    expect(turn?.sessionPatch?.suggestedOptions?.length).toBeGreaterThan(0);
  });
});
