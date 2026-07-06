/**
 * Optional Founder bridge — Executive Questions without UI wiring.
 * Consumes the ecosystem framework; Founder Studio imports this layer later.
 */
import {
  composeExecutiveAnswer,
  executiveQuestionService,
  type ComposedExecutiveAnswer,
  type ExecutiveContext,
  type ExecutiveQuestion,
  type ExecutiveQuestionId,
} from "@/lib/executiveQuestions";

import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";

export type FounderExecutiveQuestionsBundle = {
  product: "founder";
  todaysQuestions: ExecutiveQuestion[];
  recommendedQuestion: ComposedExecutiveAnswer | null;
  missionQuestions: ExecutiveQuestion[];
  decisionQuestions: ExecutiveQuestion[];
};

export function getFounderTodaysQuestions(
  context: ExecutiveContext = { product: "founder", timeHorizon: "today" },
): ExecutiveQuestion[] {
  return executiveQuestionService.listQuestions({
    ...context,
    product: "founder",
    timeHorizon: "today",
  });
}

export function getFounderRecommendedQuestion(
  context: ExecutiveContext = { product: "founder" },
): ComposedExecutiveAnswer | null {
  const recommended = executiveQuestionService.listRecommendedQuestions(context);
  const top = recommended[0];
  if (!top) return null;
  return composeExecutiveAnswer(top.id, { ...context, product: "founder" });
}

export function getFounderMissionQuestions(
  missionId: string = DEFAULT_ACTIVE_MISSION_ID,
): ExecutiveQuestion[] {
  return executiveQuestionService.listQuestions({
    product: "founder",
    missionId,
  });
}

export function getFounderDecisionQuestions(): ExecutiveQuestion[] {
  return executiveQuestionService
    .listQuestions({ product: "founder" })
    .filter((q) => q.category === "founder" && q.tags.includes("decision"));
}

export function getFounderExecutiveQuestionsBundle(
  context: ExecutiveContext = { product: "founder" },
): FounderExecutiveQuestionsBundle {
  const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
  return {
    product: "founder",
    todaysQuestions: getFounderTodaysQuestions(context),
    recommendedQuestion: getFounderRecommendedQuestion({ ...context, missionId }),
    missionQuestions: getFounderMissionQuestions(missionId),
    decisionQuestions: getFounderDecisionQuestions(),
  };
}

export function composeFounderExecutiveAnswer(questionId: ExecutiveQuestionId) {
  return composeExecutiveAnswer(questionId, { product: "founder", missionId: DEFAULT_ACTIVE_MISSION_ID });
}
