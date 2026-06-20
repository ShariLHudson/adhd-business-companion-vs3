/**
 * Create experience vision — thinking partner, not form builder.
 * The draft is the byproduct; discovery and agreement come first.
 */

import type { CreateWorkflowState } from "./createWorkflow";
import { getDiscoveryQuestions } from "./createWorkflow";
import { isHelpSeekingAnswer, isUserQuestionText } from "./builderContentSync";
import { isCreateExplorationRequest } from "./createExplorationMode";
import { createDepthHintForChat } from "./createDepth";

export const CREATE_THINKING_PARTNER_PRINCIPLES = [
  "PURPOSE: Help the user think, discover, clarify, organize, and shape ideas. The draft is the byproduct; the thinking process is the product.",
  "DISCOVERY BEFORE DOCUMENTATION: Explore audience, problems, outcomes, ideas, positioning, and promise before writing.",
  "CHAT = thinking. WORKSPACE = approved decisions only (the living thinking board).",
  "Never rush to draft after one or two answers — measure clarity, not question count.",
  "Questions, research, I don't know, and brainstorming stay in chat — never auto-save to the workspace.",
  "A section is complete only when the user clearly agrees (yes, use that, I like that, let's go with that).",
  "Draft when clarity is high AND the user requests a draft — or confirms write-with-what-we-have.",
  "After a draft exists: keep talking — review, edit, discuss, improve together. Do not abandon chat.",
].join("\n");

export const DRAFT_WITH_WHAT_WE_HAVE_PROMPT =
  "We can create a draft now. Some sections may be lighter than others. Would you like me to continue?";

const ADHD_BUSINESS_PROBLEM_OPTIONS = [
  "Overwhelm",
  "Inconsistent follow-through",
  "Too many ideas",
  "Difficulty prioritizing",
  "Difficulty finishing",
];

function audienceLooksAdhdBusiness(audience: string): boolean {
  const a = audience.toLowerCase();
  return /\badhd\b/.test(a) && /\b(?:business|founder|owner|entrepreneur|coach)/.test(a);
}

/** Coaching hint when user is exploring — research question or uncertainty. */
export function researchExplorationCoachHint(
  questionId: string,
  workflow: CreateWorkflowState,
  userText: string,
): string | null {
  if (isHelpSeekingAnswer(userText)) {
    return fieldExplorationCoachHint(questionId, workflow);
  }
  if (isCreateExplorationRequest(userText) || isUserQuestionText(userText)) {
    return [
      "RESEARCH / DISCOVERY MODE:",
      "Answer the question fully. Provide examples and ideas.",
      "Help the user discover the answer — do NOT save their question as content.",
      'Do NOT say "Would you like me to use that?" — they did not offer an answer.',
      "End by asking which option feels most relevant for what they want to create.",
    ].join("\n");
  }
  return null;
}

/** Coaching hint when user is stuck on a discovery field — not saved to workspace. */
export function fieldExplorationCoachHint(
  questionId: string,
  workflow: CreateWorkflowState,
): string | null {
  const audience = workflow.discoveryAnswers.audience?.trim() ?? "";

  if (questionId === "problem" && audienceLooksAdhdBusiness(audience)) {
    const bullets = ADHD_BUSINESS_PROBLEM_OPTIONS.map((o) => `* ${o}`).join("\n");
    return [
      'User said they do not know (or needs help) on **problem**.',
      'Open with: "Let\'s explore that."',
      "Offer common challenges ADHD business owners often face:",
      bullets,
      "Ask which feels most relevant — or invite them to mix their own.",
      "Do NOT save this list to the workspace. Wait for them to pick and approve one direction.",
    ].join("\n");
  }

  if (questionId === "problem") {
    return [
      "User is stuck on **problem**.",
      'Open with "Let\'s explore that" and offer 3–5 concrete struggles their audience likely faces.',
      "Ask which resonates. Do NOT save options until they choose and approve.",
    ].join("\n");
  }

  if (questionId === "desiredOutcome" || questionId === "outcome") {
    return [
      "User is exploring **desired outcome**.",
      "Help them imagine the after-state — what changes for the reader when this works?",
      "Offer examples; wait for approval before saving.",
    ].join("\n");
  }

  if (questionId === "audience" || questionId === "reader") {
    return [
      "User is exploring **audience**.",
      "Help them narrow who this is really for — role, situation, and what they care about.",
      "Offer examples; wait for approval before saving.",
    ].join("\n");
  }

  return null;
}

export function createThinkingPartnerHint(
  typeLabel: string,
  workflow: CreateWorkflowState,
  userText: string,
): string {
  const currentField = getDiscoveryQuestions(typeLabel, workflow.discoveryAnswers).find(
    (q) => !workflow.discoveryAnswers[q.id]?.trim(),
  );
  const exploring =
    isHelpSeekingAnswer(userText) ||
    isCreateExplorationRequest(userText) ||
    isUserQuestionText(userText);
  const fieldCoach =
    exploring && currentField
      ? researchExplorationCoachHint(currentField.id, workflow, userText) ??
        fieldExplorationCoachHint(currentField.id, workflow)
      : null;

  return [
    "CREATE THINKING PARTNER MODE (mandatory):",
    CREATE_THINKING_PARTNER_PRINCIPLES,
    createDepthHintForChat(typeLabel),
    `Building: **${typeLabel}**.`,
    currentField
      ? `CURRENT TOPIC (think together — not a form field): ${currentField.prompt}`
      : "Help them shape remaining decisions on the thinking board.",
    fieldCoach,
    userText.trim() ? `User said: "${userText.trim()}"` : "",
    "Answer questions fully. Brainstorm and research welcome.",
    "Do NOT treat their question or I don't know as an answer.",
    "Do NOT advance toward draft until enough decisions are agreed in the workspace.",
  ]
    .filter(Boolean)
    .join("\n");
}
