/**
 * Conversation-first Strategy Chamber guidance — reflect, one question, organize.
 */

import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type { StrategyOption, StrategyWorkItem } from "./types";

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
  if (item.currentReality?.trim() && !sameText(item.currentReality, item.decisionStatement)) {
    // counted via memberStatements usually; only add if statements empty
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

export function buildNextGuidedQuestion(item: StrategyWorkItem): string {
  if (!item.decisionStatement?.trim()) {
    return "What decision or direction are you trying to get clearer about?";
  }
  if (!item.currentReality?.trim()) {
    return "What changed that made you begin considering this now?";
  }
  if (!item.desiredDirection?.trim() && (item.memberStatements?.length ?? 0) < 2) {
    return "What result are you hoping for if this goes well?";
  }
  if (item.risks?.length && !item.optionsConsidered?.length) {
    return "Which part of this feels most important to look at first?";
  }
  if (!item.optionsConsidered?.length && (item.memberStatements?.length ?? 0) >= 2) {
    return "Would it help to look at a few possible directions, or keep talking first?";
  }
  if (item.optionsConsidered?.length && !item.chosenDirection?.trim()) {
    return "Which direction feels strongest right now — or would you rather keep exploring?";
  }
  if (item.chosenDirection?.trim() && !item.decisionRecordConfirmed) {
    return "Does this capture what you meant, or would you like to change anything before we use it?";
  }
  if (item.chosenDirection?.trim()) {
    return "What should stay true as you take the next step?";
  }
  return "What else feels important for me to understand?";
}

/**
 * Compact selector — max 3 contextual choices + free response.
 * Generated from the work item, not a static library wall.
 */
export function buildQuestionChoices(
  item: StrategyWorkItem,
): GuidedQuestionChoice[] {
  const choices: GuidedQuestionChoice[] = [];
  if (!item.currentReality?.trim()) {
    choices.push(
      {
        id: "changed",
        label: "What changed recently?",
        question: "What changed that made you begin considering this now?",
      },
      {
        id: "not_working",
        label: "What is not working now?",
        question: "What is not working about the current situation?",
      },
      {
        id: "concern",
        label: "What concerns you most?",
        question: "What concerns you most about this decision?",
      },
    );
  } else if (!item.optionsConsidered?.length) {
    choices.push(
      {
        id: "hope",
        label: "What result are you hoping for?",
        question: "What result are you hoping for if this goes well?",
      },
      {
        id: "worry",
        label: "What worries you most?",
        question: "What worries you most if you get this wrong?",
      },
      {
        id: "options",
        label: "Show me a few directions",
        question: "Would it help to look at a few possible directions?",
      },
    );
  } else if (!item.chosenDirection?.trim()) {
    choices.push(
      {
        id: "strongest",
        label: "Which feels strongest?",
        question: "Which direction feels strongest right now?",
      },
      {
        id: "combine",
        label: "Can we combine parts?",
        question: "Would combining parts of these options feel better?",
      },
      {
        id: "not_ready",
        label: "I'm not ready to choose",
        question: "What would help you feel ready to choose later?",
      },
    );
  } else {
    choices.push(
      {
        id: "confirm",
        label: "Does this capture it?",
        question:
          "Does this capture what you meant, or would you like to change anything?",
      },
      {
        id: "next",
        label: "What should happen next?",
        question: "What should stay true as you take the next step?",
      },
    );
  }

  return choices.slice(0, 3);
}

export function shouldOfferEmergingOptions(item: StrategyWorkItem): boolean {
  if (item.chosenDirection?.trim()) return false;
  // Member asked to keep talking first
  if (item.optionsOffered === false) return false;
  if (item.optionsConsidered?.length) return true;
  const answers = countMeaningfulAnswers(item);
  return (
    answers >= 3 &&
    Boolean(item.decisionStatement?.trim() && item.currentReality?.trim())
  );
}

/**
 * Lightweight option sketches from context — not a blank Options form.
 */
export function suggestEmergingOptions(item: StrategyWorkItem): StrategyOption[] {
  if (item.optionsConsidered?.length) {
    return item.optionsConsidered.slice(0, 3);
  }
  const q = (item.decisionStatement || "").toLowerCase();
  const aboutPrice = /\bprice|pricing|membership|fee|rate\b/.test(q);
  if (aboutPrice) {
    return [
      {
        id: "raise_all",
        title: "Raise the price for everyone",
        whyItMayFit:
          "Improves revenue more directly when the offer already feels underpriced.",
        benefits: ["Clearer revenue impact"],
        tradeoffs: ["May create more concern among current members"],
        whatWouldNeedToBeTrue: ["Members still see enough value after the change"],
      },
      {
        id: "grandfather",
        title: "Keep current members at their price",
        whyItMayFit:
          "Protects trust with people already committed while updating new joins.",
        benefits: ["Protects current member relationships"],
        tradeoffs: ["Slower revenue change"],
        whatWouldNeedToBeTrue: ["New-member pricing alone is enough for now"],
      },
      {
        id: "value_first",
        title: "Strengthen or clarify value before changing the price",
        whyItMayFit:
          "Useful when the worry is less about the number and more about how the change will feel.",
        benefits: ["Stronger explanation before asking more"],
        tradeoffs: ["Takes more time before revenue changes"],
        whatWouldNeedToBeTrue: ["There is a clear value improvement to show"],
      },
    ];
  }

  // Generic calm trio when context is thinner
  return [
    {
      id: "commit",
      title: "Choose a clear direction and commit for a season",
      whyItMayFit: "Helpful when scattered effort is the real cost.",
      benefits: ["Focus"],
      tradeoffs: ["Less flexibility short-term"],
    },
    {
      id: "pilot",
      title: "Run a small experiment before a full commitment",
      whyItMayFit: "Useful when certainty is still low.",
      benefits: ["Learning with less risk"],
      tradeoffs: ["Slower final decision"],
    },
    {
      id: "pause",
      title: "Pause and protect capacity first",
      whyItMayFit: "Fits when energy or resources are already stretched.",
      benefits: ["Reduces overload"],
      tradeoffs: ["Delays progress on the opportunity"],
    },
  ];
}

export function shouldShowDecisionRecord(item: StrategyWorkItem): boolean {
  if (item.decisionRecordConfirmed) return true;
  if (item.chosenDirection?.trim()) return true;
  if (item.status === "handed_off" || item.status === "direction_chosen") {
    return true;
  }
  // Meaningful depth: situation + at least one more organized field
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
  // Not during the first few questions
  return countMeaningfulAnswers(item) >= 4 && Boolean(item.optionsConsidered?.length);
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
  const reflection = item.shariReflection?.trim() || buildShariReflection(item);
  const question = item.activeQuestion?.trim() || buildNextGuidedQuestion(item);
  const options = suggestEmergingOptions(item);
  const showOptions =
    shouldOfferEmergingOptions(item) && !item.chosenDirection?.trim();

  let questionChoices = buildQuestionChoices(item);
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
