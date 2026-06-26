import type { ArrivalRecommendation } from "@/lib/arrivalExperience/types";
import type { RestraintContext, RestraintEvaluation, RestraintVerdict } from "./types";
import { evaluateRestraintFilter } from "./evaluateRestraintFilter";

export function filterQuestionThroughRestraint(
  question: string | null,
  context: Omit<RestraintContext, "kind">,
): RestraintVerdict {
  return evaluateRestraintFilter(question, { ...context, kind: "question" });
}

export function filterSpokenLineThroughRestraint(
  line: string | null,
  context: Omit<RestraintContext, "kind"> = {},
): RestraintVerdict {
  return evaluateRestraintFilter(line, { ...context, kind: "spoken_line" });
}

export function evaluateWelcomeRestraint(input: {
  greeting: string;
  invite: string | null;
  context: Omit<RestraintContext, "kind">;
}): RestraintEvaluation {
  return {
    greeting: filterSpokenLineThroughRestraint(input.greeting, input.context),
    invite: filterQuestionThroughRestraint(input.invite, input.context),
  };
}

export function applyRestraintToArrivalRecommendation(
  recommendation: ArrivalRecommendation | null,
  context: Omit<RestraintContext, "kind">,
): ArrivalRecommendation | null {
  if (!recommendation) return null;

  const verdict = evaluateRestraintFilter(recommendation.line, {
    ...context,
    kind: "room_recommendation",
  });

  if (!verdict.allowed) return null;

  return recommendation;
}

/** One thing at a time — keep the highest-priority single interaction. */
export function enforceOneThingAtATime<T extends { kind: string }>(
  candidates: T[],
): T | null {
  if (!candidates.length) return null;
  return candidates[0] ?? null;
}
