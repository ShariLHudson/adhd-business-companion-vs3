import type { ArrivalRecommendation } from "@/lib/arrivalExperience/types";
import type { CharacterEvaluation, CharacterFilterContext, CharacterVerdict } from "./types";
import { evaluateCharacterFilter } from "./evaluateCharacterFilter";

export function filterSpokenThroughCharacter(
  line: string | null,
  context: Omit<CharacterFilterContext, "kind"> = {},
): CharacterVerdict {
  return evaluateCharacterFilter(line, { ...context, kind: "spoken_line" });
}

export function filterQuestionThroughCharacter(
  question: string | null,
  context: Omit<CharacterFilterContext, "kind"> = {},
): CharacterVerdict {
  return evaluateCharacterFilter(question, { ...context, kind: "question" });
}

export function evaluateWelcomeCharacter(input: {
  greeting: string;
  invite: string | null;
  context: Omit<CharacterFilterContext, "kind">;
}): CharacterEvaluation {
  return {
    greeting: filterSpokenThroughCharacter(input.greeting, input.context),
    invite: filterQuestionThroughCharacter(input.invite, input.context),
  };
}

export function applyCharacterToArrivalRecommendation(
  recommendation: ArrivalRecommendation | null,
  context: Omit<CharacterFilterContext, "kind"> = {},
): ArrivalRecommendation | null {
  if (!recommendation) return null;

  const verdict = evaluateCharacterFilter(recommendation.line, {
    ...context,
    kind: "room_recommendation",
  });

  if (!verdict.authentic) return null;
  return recommendation;
}
