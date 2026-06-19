/**
 * Create Workspace Conversation Stress Test
 * Verifies ChatGPT + Google Docs behavior — NOT Form Wizard + Workflow Engine.
 */

import { describe, expect, it } from "vitest";
import {
  MAKE_CONFIDENCE_THRESHOLD,
  resolveIntent,
} from "./intentStabilizer";
import {
  classifyWorkspaceIntent,
  isFieldContentIntent,
} from "./workspaceIntent";
import { resolveSopCoachTurn } from "./workspaceSopCoach";
import {
  buildWorkspaceChatHints,
  resolveWorkspaceCoachTurn,
} from "./workspaceAwareness";
import {
  formatCreationContextForPrompt,
  toCreationContext,
} from "./workspaceCreation";
import { createWorkspaceSession } from "./workspaceSop";

const OPEN_PHRASE =
  "I need a 5 day marketing plan for ADHD business owners";

const DRAFT = `Day 1: Why your brain resists marketing
Day 2: One tiny action that counts
Day 3: Messaging without overwhelm
Day 4: Follow-through systems
Day 5: Your next simple step`;

const creationContext = toCreationContext("content-generator", {
  itemType: "Plan",
  title: "5-day marketing plan for ADHD business owners",
  draftContent: DRAFT,
  brief: OPEN_PHRASE,
  stage: "editing draft",
  source: "generated",
});

const createCtx = {
  section: "content-generator" as const,
  title: "Create",
  view: "create",
  stage: "Editing draft",
  selectedItemName: "Plan — 5-day marketing plan for ADHD business owners",
  draftPreview: DRAFT,
};

const sopSession = createWorkspaceSession(
  "content-generator",
  OPEN_PHRASE,
  "medium",
);

/** Local coach replies that indicate form-wizard behavior — must never appear. */
const WIZARD_FAIL_PATTERNS = [
  /we'?re on (?:the )?audience/i,
  /i added that as/i,
  /added that as the/i,
  /type that in the field/i,
  /current step:/i,
  /fill in \*\*audience\*\*/i,
  /say \*\*next\*\* when you want to move on/i,
];

const CONVERSATION_PHRASES: Array<{
  test: number;
  label: string;
  input: string;
  allowedIntents: string[];
}> = [
  {
    test: 2,
    label: "general question",
    input: "What makes a good marketing plan?",
    allowedIntents: ["conversation", "discovery"],
  },
  {
    test: 3,
    label: "research request",
    input: "What are the biggest struggles ADHD business owners face?",
    allowedIntents: ["conversation"],
  },
  {
    test: 4,
    label: "follow-up discussion",
    input: "Which of those do you think causes the biggest business problems?",
    allowedIntents: ["conversation"],
  },
  {
    test: 5,
    label: "selection",
    input: "Let's use those five.",
    allowedIntents: ["conversation", "discovery"],
  },
  {
    test: 6,
    label: "clarification",
    input: "Why do you think those are the best five?",
    allowedIntents: ["conversation"],
  },
  {
    test: 7,
    label: "brainstorming",
    input: "What title would make people curious enough to read all five days?",
    allowedIntents: ["conversation", "helpRequest"],
  },
  {
    test: 8,
    label: "critique",
    input: "I don't really like those.",
    allowedIntents: ["conversation", "feedback"],
  },
  {
    test: 9,
    label: "strategy",
    input:
      "If you were teaching this workshop, what order would you put the symptoms in?",
    allowedIntents: ["conversation", "discovery"],
  },
  {
    test: 10,
    label: "teaching",
    input: "Why do ADHD business owners struggle with follow-through?",
    allowedIntents: ["conversation"],
  },
  {
    test: 11,
    label: "draft awareness",
    input: "What are we building again?",
    allowedIntents: ["conversation"],
  },
  {
    test: 12,
    label: "existing draft awareness",
    input: "Can you see what's already in the draft?",
    allowedIntents: ["conversation"],
  },
  {
    test: 13,
    label: "revision request",
    input: "Can you rewrite Day 1 to be more curiosity driven?",
    allowedIntents: ["conversation", "helpRequest"],
  },
  {
    test: 14,
    label: "deep conversation",
    input:
      "Honestly, I think overwhelm is the symptom everything else grows from.",
    allowedIntents: ["conversation"],
  },
  {
    test: 15,
    label: "temporary topic change",
    input: "By the way, what is a CTA?",
    allowedIntents: ["conversation"],
  },
  {
    test: 16,
    label: "return to project",
    input: "Okay, back to the marketing plan.",
    allowedIntents: ["conversation"],
  },
  {
    test: 18,
    label: "user confusion",
    input: "I'm confused.",
    allowedIntents: ["conversation"],
  },
  {
    test: 19,
    label: "coaching",
    input: "What would you do next if you were me?",
    allowedIntents: ["conversation"],
  },
];

function assertPassesToApi(input: string, testNum: number) {
  const { intent } = classifyWorkspaceIntent(input);
  expect(
    isFieldContentIntent(input),
    `Test ${testNum}: must not be fieldContent`,
  ).toBe(false);
  expect(intent, `Test ${testNum}: must not be fieldContent intent`).not.toBe(
    "fieldContent",
  );

  const coach = resolveWorkspaceCoachTurn(
    createCtx,
    input,
    "medium",
    "",
    sopSession,
  );
  expect(
    coach,
    `Test ${testNum}: local coach must defer to API (null)`,
  ).toBeNull();

  const sop = resolveSopCoachTurn(sopSession, createCtx, input, "medium", "");
  expect(sop, `Test ${testNum}: SOP coach must not intercept`).toBeNull();

  if (coach?.reply) {
    for (const pat of WIZARD_FAIL_PATTERNS) {
      expect(
        coach.reply,
        `Test ${testNum}: wizard phrase in coach reply`,
      ).not.toMatch(pat);
    }
  }
  expect(coach?.fill, `Test ${testNum}: must not auto-fill fields`).toBeUndefined();
}

describe("Create workspace stress test — Test 1: open Create", () => {
  it("routes creation request to make with Plan type and topic", () => {
    const r = resolveIntent(OPEN_PHRASE);
    expect(r.action).toBe("make");
    expect(r.type).toBe("Marketing Plan");
    expect(r.confidence).toBeGreaterThanOrEqual(MAKE_CONFIDENCE_THRESHOLD);
    expect(r.topic.toLowerCase()).toMatch(/5 day marketing plan/);
    expect(r.topic.toLowerCase()).toMatch(/adhd business owners/);
  });
});

describe("Create workspace stress test — Tests 2–19: natural conversation", () => {
  it.each(CONVERSATION_PHRASES)(
    "Test $test — $label: not field content, passes to API",
    ({ test, input, allowedIntents }) => {
      const { intent } = classifyWorkspaceIntent(input);
      expect(allowedIntents).toContain(intent);
      assertPassesToApi(input, test);
    },
  );
});

describe("Create workspace stress test — Test 17: draft persistence (hints)", () => {
  it("API hints include full draft context and conversational create mode", () => {
    const hints = buildWorkspaceChatHints(createCtx, {
      coGuideActive: true,
      energy: "medium",
      userText: "What are we building again?",
      sopSession,
      creationContext,
    });
    expect(hints).toBeDefined();
    expect(hints).toContain("CREATE WORKSPACE MODE");
    expect(hints).toContain("ChatGPT beside a Google Doc");
    expect(hints).toContain("NOT a form wizard");
    expect(hints).toContain("Day 1: Why your brain resists marketing");
    expect(hints).toContain("5-day marketing plan for ADHD business owners");
    expect(hints).not.toContain("SOP SESSION");
    expect(hints).not.toMatch(/current step id/i);
  });

  it("creation context block references visible draft for awareness tests", () => {
    const block = formatCreationContextForPrompt(creationContext)!;
    expect(block).toContain("Draft exists: yes");
    expect(block).toContain("Day 1:");
    expect(block).toContain("SOURCE OF TRUTH");
    expect(block).not.toMatch(/we're on (?:the )?audience/i);
  });
});

describe("Create workspace stress test — Test 20: human feel (guardrails)", () => {
  it("no conversational phrase in the suite triggers field write or wizard coach", () => {
    for (const { test, input } of CONVERSATION_PHRASES) {
      assertPassesToApi(input, test);
    }
  });

  it("selection variants do not map to audience field", () => {
    const variants = [
      "Yes let's use all of those.",
      "Let's use those five.",
      "Go with all of them.",
      "Add those to the plan.",
    ];
    for (const input of variants) {
      expect(isFieldContentIntent(input)).toBe(false);
      assertPassesToApi(input, 5);
    }
  });
});
