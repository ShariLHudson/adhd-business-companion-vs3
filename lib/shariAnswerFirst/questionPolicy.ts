/**
 * Central question policy — earn the right to ask.
 */

import type { ShariPrimaryHelpMode } from "./types";
import type { ResolvedShariContext } from "./contextResolver";
import { isUnnecessaryContextQuestion } from "./contextResolver";

const FORBIDDEN_BEFORE_HELP_RE =
  /\b(?:did i hear that right|which (?:area|category|of these)|what feels like the hardest|why are you creating this|which of these areas would you like)\b/i;

export type ShariQuestionPolicy = {
  answerBeforeQuestionRequired: boolean;
  essentialClarificationRequired: boolean;
  questionAllowedAfterAnswer: boolean;
  bestFollowUpQuestion: string | null;
  forbiddenBeforeHelp: boolean;
  reasons: string[];
};

export function evaluateQuestionPolicy(input: {
  rawRequest: string;
  primaryHelpMode: ShariPrimaryHelpMode;
  context: ResolvedShariContext;
  consequentialDecision: boolean;
  currentResearchRequired: boolean;
}): ShariQuestionPolicy {
  const reasons: string[] = [];
  const reflective = input.primaryHelpMode === "reflective_thinking";
  const howTo =
    input.primaryHelpMode === "how_to_guidance" ||
    input.primaryHelpMode === "troubleshooting" ||
    input.primaryHelpMode === "explanation";

  const answerBeforeQuestionRequired = !reflective;
  if (answerBeforeQuestionRequired) {
    reasons.push("answer_before_question");
  }

  // Essential clarification only for consequential ambiguity / safety / conflicting facts
  let essentialClarificationRequired = false;
  if (
    input.consequentialDecision &&
    !input.context.knownContextAvailable &&
    /\b(?:should i|worth|spend|\$\d+)\b/i.test(input.rawRequest) &&
    input.rawRequest.length < 40
  ) {
    // Still answer with judgment first; one question after is enough
    essentialClarificationRequired = false;
    reasons.push("advice_can_proceed_with_assumptions");
  }

  const questionAllowedAfterAnswer =
    howTo ||
    input.primaryHelpMode === "advice" ||
    input.primaryHelpMode === "comparison" ||
    input.primaryHelpMode === "simple_planning" ||
    reflective;

  let bestFollowUpQuestion: string | null = null;
  if (howTo && /\b(?:booth|vendor)\b/i.test(input.rawRequest)) {
    bestFollowUpQuestion =
      "What booth size are you working with, if you already know it?";
  } else if (input.primaryHelpMode === "advice") {
    bestFollowUpQuestion =
      "What would tip this either way for you — money, energy, or audience fit?";
  } else if (reflective) {
    bestFollowUpQuestion =
      "What feels like the smallest piece of this you could face first?";
  }

  return {
    answerBeforeQuestionRequired,
    essentialClarificationRequired,
    questionAllowedAfterAnswer: reflective ? true : questionAllowedAfterAnswer,
    bestFollowUpQuestion,
    forbiddenBeforeHelp: false,
    reasons,
  };
}

/** Detect if a draft answer violates question policy. */
export function draftViolatesQuestionPolicy(
  draft: string,
  policy: ShariQuestionPolicy,
  context: ResolvedShariContext,
): { violates: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (policy.answerBeforeQuestionRequired) {
    const earlyQuestion =
      draft.trim().endsWith("?") &&
      draft.split(/\n/).filter((l) => l.trim().length > 20).length < 3;
    if (earlyQuestion && draft.length < 280) {
      reasons.push("question_before_substance");
    }
    if (FORBIDDEN_BEFORE_HELP_RE.test(draft)) {
      reasons.push("forbidden_clarify_pattern");
    }
    if (isUnnecessaryContextQuestion(draft, context)) {
      reasons.push("asks_for_known_context");
    }
  }
  return { violates: reasons.length > 0, reasons };
}
