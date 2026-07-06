import type { FounderProfileRecommendContext, FounderProfileView } from "../types";
import { listPreferences } from "../preferences/preferenceLearning";
import { listPatterns } from "../patterns/patternEngine";
import { listFrictionPatterns } from "../patterns/frictionPatterns";
import { listStrengths } from "../patterns/strengthPatterns";
import { buildRecommendations } from "../recommendations/recommendationEngine";
import { mergedObservations } from "../history/observationHistory";

export const FOUNDER_PROFILE_PRINCIPLES = [
  "Adapt to Shari — never to a personality type.",
  "Learn through observation — not assessments or quizzes.",
  "Everything evolves — nothing is permanent.",
  "Speak observationally: I've noticed — never You are this type.",
  "Evidence strengthens confidence; fading evidence decays quietly.",
] as const;

export function composeAdaptationView(context: FounderProfileRecommendContext = {}): FounderProfileView {
  void context;
  const observations = mergedObservations();
  const patterns = listPatterns();
  const preferences = listPreferences();

  return {
    product: "founder",
    observationCount: observations.length,
    patternCount: patterns.length,
    preferences,
    patterns,
    friction: listFrictionPatterns(),
    strengths: listStrengths(),
    recommendations: buildRecommendations(),
    principles: [...FOUNDER_PROFILE_PRINCIPLES],
  };
}
