/**
 * Strategy Chamber guided conversation — one question at a time.
 * Organizes the Strategy Work Item behind the scenes (not a form).
 */

import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import {
  applyConversationalAnswer,
  applyOpeningStrategicQuestion,
} from "./answerIntake";
import {
  buildNextGuidedQuestion,
  buildResumeRecap,
  buildShariReflection,
} from "./conversationGuidance";
import { analyzeStrategyWorkItem } from "./intelligence";
import type {
  StrategyThinkingStage,
  StrategyWorkItem,
  StrategyWorkStatus,
} from "./types";

export type GuidedJourneyPrompt = {
  stage: StrategyThinkingStage;
  question: string;
  reflection?: string;
  whyItMatters?: string;
  exampleHint?: string;
  fieldHint:
    | "currentReality"
    | "desiredDirection"
    | "optionsConsidered"
    | "chosenDirection"
    | "handoffReady"
    | "strategic_question";
};

const STAGE_ORDER: StrategyThinkingStage[] = [
  "understand_current_state",
  "choose_direction",
  "explore_options",
  "evaluate_decision",
  "handoff_direction",
];

export function stageOrderIndex(stage: StrategyThinkingStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function nextThinkingStage(
  stage: StrategyThinkingStage,
): StrategyThinkingStage | null {
  const idx = stageOrderIndex(stage);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1]!;
}

export function statusForStage(stage: StrategyThinkingStage): StrategyWorkStatus {
  switch (stage) {
    case "understand_current_state":
    case "choose_direction":
      return "understanding";
    case "explore_options":
      return "exploring";
    case "evaluate_decision":
      return "evaluating";
    case "handoff_direction":
      return "direction_chosen";
    default:
      return "understanding";
  }
}

export function guidedPromptForWorkItem(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): GuidedJourneyPrompt {
  const question =
    item.activeQuestion?.trim() ||
    buildNextGuidedQuestion(item, presentation);
  const reflection =
    item.shariReflection?.trim() || buildShariReflection(item);
  return {
    stage: item.currentStage,
    question,
    reflection: presentation?.summaryFirst
      ? reflection
      : reflection,
    whyItMatters: presentation?.summaryFirst
      ? undefined
      : "You can answer in a few words — polished writing is not required.",
    exampleHint: presentation?.preferExamples
      ? "Example: “Costs went up, but I haven’t changed the membership price.”"
      : undefined,
    fieldHint: item.decisionStatement?.trim()
      ? "currentReality"
      : "strategic_question",
  };
}

/**
 * Apply one conversational answer and refresh Shari’s reflection + next question.
 */
export function applyGuidedJourneyAnswer(
  item: StrategyWorkItem,
  answer: string,
): Partial<StrategyWorkItem> {
  const trimmed = answer.trim();
  if (!trimmed) return {};

  const isOpening = !item.decisionStatement?.trim();
  const patch = isOpening
    ? applyOpeningStrategicQuestion(item, trimmed)
    : applyConversationalAnswer(item, trimmed);

  const merged: StrategyWorkItem = {
    ...item,
    ...patch,
    memberStatements: patch.memberStatements ?? item.memberStatements,
    optionsConsidered: patch.optionsConsidered ?? item.optionsConsidered,
    assumptions: patch.assumptions ?? item.assumptions,
    risks: patch.risks ?? item.risks,
    constraints: patch.constraints ?? item.constraints,
    currentReality: patch.currentReality ?? item.currentReality,
    decisionStatement: patch.decisionStatement ?? item.decisionStatement,
    desiredDirection: patch.desiredDirection ?? item.desiredDirection,
    chosenDirection: patch.chosenDirection ?? item.chosenDirection,
    strategyType: patch.strategyType ?? item.strategyType,
    strategyFamily: patch.strategyFamily ?? item.strategyFamily,
  };

  const judgment = analyzeStrategyWorkItem(merged, undefined, {
    lastAnswer: trimmed,
  });

  return {
    ...patch,
    ...judgment.workItemPatch,
    shariReflection: buildShariReflection({ ...merged, ...judgment.workItemPatch }),
    activeQuestion: judgment.nextQuestion.question,
    draftResponse: "",
  };
}

export function buildStrategyResumeSummary(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): string {
  const depth = presentation?.resumeDepth ?? "standard";
  if (depth === "brief") {
    return `You were working on: ${item.decisionStatement?.trim() || item.title}`;
  }
  if (depth === "detailed") {
    return buildResumeRecap(item);
  }
  const q = item.decisionStatement?.trim() || item.title;
  const reality = item.currentReality?.trim();
  if (reality && reality !== q) {
    return `You were deciding: ${q}\nSo far: ${reality}`;
  }
  return `You were deciding: ${q}`;
}

export function guidedJourneyIsComplete(item: StrategyWorkItem): boolean {
  return Boolean(
    item.chosenDirection?.trim() &&
      (item.currentStage === "handoff_direction" ||
        item.status === "direction_chosen" ||
        item.status === "handed_off" ||
        item.status === "completed" ||
        item.decisionRecordConfirmed),
  );
}

/** Skip the current question without wiping prior answers. */
export function skipGuidedJourneyStage(
  item: StrategyWorkItem,
): Partial<StrategyWorkItem> {
  if (!item.decisionStatement?.trim()) return {};
  const next = nextThinkingStage(item.currentStage);
  if (!next) return {};
  const merged = {
    ...item,
    currentStage: next,
    status: statusForStage(next),
  };
  return {
    currentStage: next,
    status: statusForStage(next),
    activeQuestion: buildNextGuidedQuestion(merged),
    shariReflection: buildShariReflection(merged),
  };
}

export { buildResumeRecap };
