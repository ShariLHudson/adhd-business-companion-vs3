/**
 * Conversation-first Strategy Chamber guidance — reflect, one question, organize.
 * Question selection and options are driven by strategyChamber/intelligence.
 */

import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyOption, StrategyWorkItem } from "./types";
import {
  analyzeStrategyWorkItem,
  generateStrategicOptions,
  selectNextQuestion,
  shouldOfferStrategicOptions,
} from "./intelligence";

export type GuidedQuestionChoice = {
  id: string;
  label: string;
  question: string;
};

export type ConversationTurnView = {
  reflection: string;
  question: string;
  questionChoices: GuidedQuestionChoice[];
  showFreeResponse: true;
  showOptions: boolean;
  options: StrategyOption[];
  showDecisionRecord: boolean;
  showContinueJourney: boolean;
  showThinkingAvailable: boolean;
  thinkingThroughLine: string;
};

function sameText(a?: string | null, b?: string | null): boolean {
  return Boolean(a?.trim() && b?.trim() && a.trim() === b.trim());
}

export function countMeaningfulAnswers(item: StrategyWorkItem): number {
  let n = 0;
  if (item.decisionStatement?.trim()) n += 1;
  n += item.memberStatements?.length ?? 0;
  if (
    item.currentReality?.trim() &&
    !sameText(item.currentReality, item.decisionStatement)
  ) {
    if (!(item.memberStatements?.length)) n += 1;
  }
  return n;
}

export function buildShariReflection(item: StrategyWorkItem): string {
  const question = item.decisionStatement?.trim();
  if (!question) {
    return "I'm here to think this through with you — one step at a time.";
  }
  if (!item.currentReality?.trim() && !(item.memberStatements?.length)) {
    return `You're trying to get clearer about this: ${question}`;
  }
  if (item.chosenDirection?.trim()) {
    return `You're leaning toward “${item.chosenDirection.trim()}” while keeping the original question in view: ${question}`;
  }
  if (item.optionsConsidered?.length) {
    return `We've named a few directions for: ${question}`;
  }
  if (item.currentReality?.trim()) {
    return `You're deciding about “${question}” while noticing that ${item.currentReality.trim()}`;
  }
  return `We're still unpacking: ${question}`;
}

export function buildNextGuidedQuestion(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): string {
  return selectNextQuestion(item, presentation).question;
}

/**
 * Compact selector — max 3 contextual choices + free response.
 */
export function buildQuestionChoices(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): GuidedQuestionChoice[] {
  const plan = selectNextQuestion(item, presentation);
  return plan.choices.slice(0, presentation?.maxVisibleChoices ?? 3);
}

export function shouldOfferEmergingOptions(item: StrategyWorkItem): boolean {
  return shouldOfferStrategicOptions(item);
}

/**
 * Option sketches from Strategy Judgment intelligence — not a blank Options form.
 */
export function suggestEmergingOptions(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): StrategyOption[] {
  return generateStrategicOptions(item, presentation).slice(0, 3);
}

export function shouldShowDecisionRecord(item: StrategyWorkItem): boolean {
  if (item.decisionRecordConfirmed) return true;
  if (item.chosenDirection?.trim()) return true;
  if (item.status === "handed_off" || item.status === "direction_chosen") {
    return true;
  }
  const hasSituation =
    Boolean(item.currentReality?.trim()) &&
    !sameText(item.currentReality, item.decisionStatement);
  const hasDepth =
    Boolean(item.assumptions?.length) ||
    Boolean(item.risks?.length) ||
    Boolean(item.optionsConsidered?.length) ||
    Boolean(item.desiredDirection?.trim());
  return hasSituation && hasDepth && countMeaningfulAnswers(item) >= 3;
}

export function shouldShowContinueJourney(item: StrategyWorkItem): boolean {
  if (item.chosenDirection?.trim()) return true;
  if (item.status === "handed_off") return true;
  return (
    countMeaningfulAnswers(item) >= 4 && Boolean(item.optionsConsidered?.length)
  );
}

export function thinkingThroughLine(item: StrategyWorkItem): string {
  const q = item.decisionStatement?.trim();
  if (!q) return "Thinking through: a strategic question";
  const short = q.length > 90 ? `${q.slice(0, 87).trim()}…` : q;
  return `Thinking through: ${short}`;
}

export function buildConversationTurnView(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
  opts?: { forceShowRecord?: boolean; forceShowThinking?: boolean },
): ConversationTurnView {
  const judgment = analyzeStrategyWorkItem(item, presentation);
  const reflection = item.shariReflection?.trim() || buildShariReflection(item);
  const question =
    item.activeQuestion?.trim() || judgment.nextQuestion.question;
  const options = judgment.options;
  const showOptions = judgment.showOptions && !item.chosenDirection?.trim();

  let questionChoices = judgment.nextQuestion.choices;
  if (presentation && presentation.maxVisibleChoices < 3) {
    questionChoices = questionChoices.slice(0, presentation.maxVisibleChoices);
  }

  return {
    reflection: presentation?.shortParagraphs
      ? reflection.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")
      : reflection,
    question,
    questionChoices,
    showFreeResponse: true,
    showOptions,
    options: options.slice(0, 3),
    showDecisionRecord:
      opts?.forceShowRecord === true || shouldShowDecisionRecord(item),
    showContinueJourney: shouldShowContinueJourney(item),
    showThinkingAvailable:
      opts?.forceShowThinking === true ||
      Boolean(item.decisionStatement?.trim()) ||
      countMeaningfulAnswers(item) >= 1,
    thinkingThroughLine: thinkingThroughLine(item),
  };
}

export function buildResumeRecap(item: StrategyWorkItem): string {
  const q = item.decisionStatement?.trim() || item.title;
  const reality = item.currentReality?.trim();
  const open = item.activeQuestion?.trim() || buildNextGuidedQuestion(item);
  if (reality && !sameText(reality, q)) {
    return `You were considering: ${q}\n\nSo far: ${reality}\n\nNext: ${open}`;
  }
  return `You were deciding: ${q}\n\nWe can pick up with the next helpful question.`;
}
