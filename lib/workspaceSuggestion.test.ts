import { describe, expect, it } from "vitest";
import {
  classifyWorkspaceIntent,
  isClarificationRequest,
} from "./workspaceIntent";
import { resolveSopCoachTurn } from "./workspaceSopCoach";
import { buildClarificationTurn } from "./workspaceSopConversation";
import {
  createWorkspaceSession,
  setSopOptions,
  type WorkspaceSession,
} from "./workspaceSop";
import {
  getEffectiveSuggestions,
  tryResolveSuggestionSelection,
} from "./workspaceSuggestion";
import type { WorkspaceContext } from "./workspaceAwareness";

const TITLE_OPTIONS = [
  "ADHD Business Momentum",
  "Stop Spinning, Start Moving",
  "From Overwhelmed to One Clear Step",
];

const ASSISTANT_WITH_OPTIONS = `Here are a few title options:

1. ADHD Business Momentum
2. Stop Spinning, Start Moving
3. From Overwhelmed to One Clear Step

Say **number 2** or pick one in the field beside us.`;

function sessionWithOptions(): WorkspaceSession {
  const base = createWorkspaceSession("projects", "workshop", "medium");
  return setSopOptions(base, TITLE_OPTIONS, "Title help");
}

const emptyCtx: WorkspaceContext = {
  section: "projects",
  title: "Projects",
  view: "create",
  stage: "title",
  selectedItemName: null,
  selectedItemGoal: null,
};

const sectionsCtx: WorkspaceContext = {
  ...emptyCtx,
  stage: "sections",
};

function sessionOnSections(): WorkspaceSession {
  const base = createWorkspaceSession("projects", "ADHD business app workshop", "high");
  return {
    ...base,
    currentStepId: "workshop-sections",
    projectTitle: "Stop Spinning, Start Moving",
    acceptedValues: {
      "workshop-title": "Stop Spinning, Start Moving",
      "workshop-outcome": "Take one clear action",
    },
  };
}

describe("suggested option selection", () => {
  const session = sessionWithOptions();

  for (const input of [
    "2",
    "number 2",
    "option 2",
    "the second one",
    "use the second one",
    "use option 2",
    "I like number 2",
  ]) {
    it(`selects option 2 for input: "${input}"`, () => {
      const result = tryResolveSuggestionSelection(
        input,
        session,
        ASSISTANT_WITH_OPTIONS,
      );
      expect(result).not.toBeNull();
      expect(result!.value).toBe("Stop Spinning, Start Moving");
      expect(result!.index).toBe(1);
      expect(result!.value).not.toBe(input);
    });
  }

  it("never treats numeric picks as field content", () => {
    for (const input of [
      "2",
      "number 2",
      "option 2",
      "the second one",
      "use the second one",
      "use option 2",
      "I like number 2",
    ]) {
      const intent = classifyWorkspaceIntent(input, ASSISTANT_WITH_OPTIONS, {
        session,
      });
      expect(intent.intent).toBe("confirmation");
      expect(intent.intent).not.toBe("fieldContent");
    }
  });
});

describe("resolveSopCoachTurn selection", () => {
  it('writes "Stop Spinning, Start Moving" to title field for input "2"', () => {
    const session = sessionWithOptions();
    const turn = resolveSopCoachTurn(
      session,
      emptyCtx,
      "2",
      "medium",
      ASSISTANT_WITH_OPTIONS,
    );
    expect(turn).not.toBeNull();
    expect(turn!.fill?.value).toBe("Stop Spinning, Start Moving");
    expect(turn!.fill?.field).toBe("project-title");
    expect(turn!.fill?.value).not.toBe("2");
    expect(turn!.sessionPatch?.suggestedOptions).toEqual([]);
    expect(turn!.sessionPatch?.acceptedValues["workshop-title"]).toBe(
      "Stop Spinning, Start Moving",
    );
  });

  it("recovers options from last assistant when session options are empty", () => {
    const session = createWorkspaceSession("projects", "workshop", "medium");
    const options = getEffectiveSuggestions(session, ASSISTANT_WITH_OPTIONS);
    expect(options).toHaveLength(3);

    const turn = resolveSopCoachTurn(
      session,
      emptyCtx,
      "I like number 2",
      "medium",
      ASSISTANT_WITH_OPTIONS,
    );
    expect(turn?.fill?.value).toBe("Stop Spinning, Start Moving");
  });
});

describe("clarification questions", () => {
  const session = sessionOnSections();

  for (const input of [
    "I don't understand what this is for",
    "Can you explain this section?",
    "What am I supposed to put here?",
    "Why are we doing this?",
    "I don't understand what this is for so can you explain it to me?",
  ]) {
    it(`classifies "${input}" as clarification, not fieldContent`, () => {
      expect(isClarificationRequest(input)).toBe(true);
      const intent = classifyWorkspaceIntent(input, "", { session });
      expect(intent.intent).toBe("clarification");
      expect(intent.intent).not.toBe("fieldContent");
    });
  }

  it("explains sections without saving the question", () => {
    const turn = buildClarificationTurn(session, sectionsCtx);
    expect(turn.reply).toMatch(/Sections/i);
    expect(turn.reply).toMatch(/3 main things/i);
    expect(turn.reply).toMatch(/ADHD entrepreneurs feel stuck/i);
    expect(turn.fill).toBeUndefined();
    expect(turn.sessionPatch?.acceptedValues["workshop-sections"]).toBeUndefined();
  });

  it("resolveSopCoachTurn answers clarification on sections step", () => {
    const turn = resolveSopCoachTurn(
      session,
      sectionsCtx,
      "I don't understand what this is for so can you explain it to me?",
      "high",
      "",
    );
    expect(turn).not.toBeNull();
    expect(turn!.reply).toMatch(/outline the main pieces/i);
    expect(turn!.fill).toBeUndefined();
  });
});
