/**
 * Spark Decision Engine — operating system for how Spark thinks before every response.
 */

export const SPARK_DECISION_MISSION =
  "Meet the member where they are. Help them get where they want to go." as const;

export const SPARK_DECISION_FORBIDDEN =
  "What's the problem?" as const;

export const SPARK_DECISION_FRICTION_QUESTION =
  "What is making this difficult today?" as const;

export type SparkPrimaryIntent =
  | "CREATE"
  | "THINK"
  | "SUPPORT"
  | "LEARN"
  | "EXPLORE";

export type SparkDecisionFrictionType =
  | "knowledge"
  | "clarity"
  | "prioritization"
  | "confidence"
  | "emotional_weight"
  | "capacity"
  | "memory"
  | "momentum"
  | "none";

export type SparkCompanionStyleRole =
  | "builder"
  | "teacher"
  | "guide"
  | "thinking_partner"
  | "companion"
  | "researcher"
  | "challenger";

export type SparkLeaveBetterOutcome =
  | "more_clarity"
  | "less_shame"
  | "more_momentum"
  | "better_understanding"
  | "better_work"
  | "better_decision"
  | "better_plan"
  | "better_perspective"
  | "better_rest";

export type EstateRouteSuggestion = {
  placeId: string;
  reason: string;
  optional: true;
};

import type { SparkLandscapeDecision } from "@/lib/sparkCompanion/sparkLandscapes/types";

export type SparkDecisionEngineDecision = {
  intent: SparkPrimaryIntent;
  intentConfidence: "high" | "medium" | "low";
  friction: SparkDecisionFrictionType;
  companionRole: SparkCompanionStyleRole;
  estateRoute: EstateRouteSuggestion | null;
  /** Spark Landscapes — today's weather, not identity */
  landscape: SparkLandscapeDecision;
  targetOutcomes: readonly SparkLeaveBetterOutcome[];
  learningSignals: readonly string[];
  anticipateHints: readonly string[];
  suppressEmotionalCoaching: boolean;
  reason: string;
};

export type SparkDecisionEngineInput = {
  userText: string;
  overwhelmed?: boolean;
  momentumActive?: boolean;
  placeId?: string | null;
  /** Trust exists — gentle challenger role allowed */
  trustEstablished?: boolean;
};

export type SparkDecisionEngineHintInput = SparkDecisionEngineInput;

export const SPARK_SEVEN_INTERNAL_QUESTIONS = [
  "What is the member trying to accomplish?",
  SPARK_DECISION_FRICTION_QUESTION,
  "What role do they need from me?",
  "Would an Estate experience improve this?",
  "What is the smallest action that creates meaningful progress?",
  "What can I learn that will help them next time?",
  "Will they leave feeling lighter, clearer, more capable, wiser, or moving forward?",
] as const;
