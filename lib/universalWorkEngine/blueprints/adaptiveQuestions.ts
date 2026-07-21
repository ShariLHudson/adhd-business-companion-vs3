/**
 * Adaptive Blueprint questions — evaluate before asking.
 */

import type {
  AdaptiveQuestionDecision,
  BlueprintAdaptiveQuestion,
  BlueprintDefinition,
  BlueprintDepthMode,
  WorkBlueprintState,
} from "./types";
import { recordBlueprintAudit } from "./auditHistory";
import { refreshConditionalSections, requireWorkBlueprintState, putWorkBlueprintState } from "./workBlueprintStateStore";
import { requireBlueprint } from "./registry";

function knownValueForQuestion(
  q: BlueprintAdaptiveQuestion,
  state: WorkBlueprintState,
): string | null {
  if (state.answeredQuestions[q.id]?.trim()) {
    return state.answeredQuestions[q.id]!;
  }
  for (const key of q.knownContextKeys ?? []) {
    const v = state.knownContext[key]?.trim();
    if (v) return v;
  }
  return null;
}

/**
 * Before asking: known? required now? inferable? postponable?
 * material change? lower friction? depth mode?
 */
export function evaluateAdaptiveQuestion(
  state: WorkBlueprintState,
  question: BlueprintAdaptiveQuestion,
): AdaptiveQuestionDecision {
  const known = knownValueForQuestion(question, state);
  if (known) {
    return {
      action: "skip_known",
      questionId: question.id,
      knownValue: known,
      reason: "already_known",
    };
  }

  if (!question.requiredInModes.includes(state.depthMode)) {
    return {
      action: "not_required_now",
      questionId: question.id,
      reason: `not_in_${state.depthMode}`,
    };
  }

  for (const dep of question.dependencies ?? []) {
    const depKnown =
      Boolean(state.answeredQuestions[dep]?.trim()) ||
      Boolean(state.knownContext[dep]?.trim());
    if (!depKnown) {
      return {
        action: "postpone",
        questionId: question.id,
        reason: `dependency_unmet:${dep}`,
      };
    }
  }

  if (question.inferFromContext) {
    const raw = state.knownContext[question.inferFromContext.key]?.trim();
    if (raw) {
      return {
        action: "infer",
        questionId: question.id,
        inferredValue: question.inferFromContext.asAnswer || raw,
        reason: "safe_inference",
      };
    }
  }

  if (
    question.postponable &&
    question.materialChangeNextStep === false &&
    state.depthMode === "quick_start"
  ) {
    return {
      action: "postpone",
      questionId: question.id,
      reason: "postponable_quick_start",
    };
  }

  const useLowerFriction =
    state.depthMode === "quick_start" && Boolean(question.lowerFrictionPrompt);

  return {
    action: "ask",
    questionId: question.id,
    prompt: useLowerFriction
      ? question.lowerFrictionPrompt!
      : question.prompt,
    reason: useLowerFriction ? "lower_friction" : "required_now",
  };
}

export function listAdaptiveQuestionDecisions(
  workId: string,
  blueprint?: BlueprintDefinition,
): AdaptiveQuestionDecision[] {
  const state = requireWorkBlueprintState(workId);
  const bp =
    blueprint ?? requireBlueprint(state.blueprintId, state.blueprintVersion);
  return bp.adaptiveQuestions.map((q) => evaluateAdaptiveQuestion(state, q));
}

export function answerBlueprintQuestion(
  workId: string,
  questionId: string,
  answer: string,
): WorkBlueprintState {
  const state = requireWorkBlueprintState(workId);
  const next: WorkBlueprintState = {
    ...state,
    answeredQuestions: {
      ...state.answeredQuestions,
      [questionId]: answer,
    },
    skippedQuestionIds: state.skippedQuestionIds.filter((id) => id !== questionId),
    knownContext: {
      ...state.knownContext,
      [questionId]: answer,
    },
    updatedAt: new Date().toISOString(),
  };
  putWorkBlueprintState(next);
  recordBlueprintAudit({
    blueprintId: state.blueprintId,
    blueprintVersion: state.blueprintVersion,
    workId: state.workId,
    action: "answer_question",
    detail: questionId,
  });
  return refreshConditionalSections(next);
}

export function skipBlueprintQuestion(
  workId: string,
  questionId: string,
): WorkBlueprintState {
  const state = requireWorkBlueprintState(workId);
  const skipped = state.skippedQuestionIds.includes(questionId)
    ? state.skippedQuestionIds
    : [...state.skippedQuestionIds, questionId];
  const next: WorkBlueprintState = {
    ...state,
    skippedQuestionIds: skipped,
    updatedAt: new Date().toISOString(),
  };
  putWorkBlueprintState(next);
  recordBlueprintAudit({
    blueprintId: state.blueprintId,
    blueprintVersion: state.blueprintVersion,
    workId: state.workId,
    action: "skip_question",
    detail: questionId,
  });
  return next;
}

/** Skipped questions remain recoverable — restore into the ask queue. */
export function recoverSkippedQuestion(
  workId: string,
  questionId: string,
): WorkBlueprintState {
  const state = requireWorkBlueprintState(workId);
  const next: WorkBlueprintState = {
    ...state,
    skippedQuestionIds: state.skippedQuestionIds.filter((id) => id !== questionId),
    updatedAt: new Date().toISOString(),
  };
  putWorkBlueprintState(next);
  recordBlueprintAudit({
    blueprintId: state.blueprintId,
    blueprintVersion: state.blueprintVersion,
    workId: state.workId,
    action: "recover_question",
    detail: questionId,
  });
  return next;
}

export function mergeKnownContext(
  workId: string,
  context: Record<string, string>,
): WorkBlueprintState {
  const state = requireWorkBlueprintState(workId);
  const next: WorkBlueprintState = {
    ...state,
    knownContext: { ...state.knownContext, ...context },
    updatedAt: new Date().toISOString(),
  };
  putWorkBlueprintState(next);
  return refreshConditionalSections(next);
}

export function questionsForDepthMode(
  blueprint: BlueprintDefinition,
  depthMode: BlueprintDepthMode,
): BlueprintAdaptiveQuestion[] {
  return blueprint.adaptiveQuestions.filter((q) =>
    q.requiredInModes.includes(depthMode),
  );
}
