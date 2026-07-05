/**
 * Spark Restoration Intelligence™ — energy types and evaluation.
 * @see docs/estate/SPARK_RESTORATION_INTELLIGENCE.md
 */

import type { RestorationTrigger } from "@/lib/estateRestoration/types";

/** What kind of energy needs restoring — not "should they stop working?" */
export type SparkEnergyType =
  | "mental"
  | "emotional"
  | "creative"
  | "sensory"
  | "play"
  | "curiosity"
  | "social";

export type RestorationRecommendationKind =
  | "place"
  | "capability"
  | "guide_story"
  | "adventure"
  | "game"
  | "conversation";

export type RestorationRecommendation = {
  id: string;
  label: string;
  kind: RestorationRecommendationKind;
  placeId?: string;
  section?: string;
  spreadId?: string;
  gameId?: string;
  reason: string;
};

export type SparkRestorationInput = {
  userText: string;
  currentTurn?: number;
  emotionalState?: string | null;
  overwhelmed?: boolean;
  workspace?: string | null;
  estatePlaceId?: string | null;
  /** Minutes in current focused activity — when available */
  focusedMinutes?: number;
  lastAssistantText?: string | null;
};

export type SparkRestorationEvaluation = {
  shouldOffer: boolean;
  energyType: SparkEnergyType;
  confidence: "low" | "medium" | "high";
  trigger: RestorationTrigger | null;
  recommendations: readonly RestorationRecommendation[];
  primary: RestorationRecommendation;
  returnContextLabel: string | null;
  /** Curiosity path — inline guide story when available */
  guideStorySnippet?: string;
  guideSpreadId?: string;
  guideSpreadTitle?: string;
};

export type EnergyRestorationOffer = {
  intro: string;
  invitation: string;
  energyType: SparkEnergyType;
  primary: RestorationRecommendation;
  alternatives: readonly RestorationRecommendation[];
  responseHint: string;
};

export type AdventureWheelEntry = {
  id: string;
  label: string;
  kind: RestorationRecommendationKind;
  placeId?: string;
  spreadId?: string;
  section?: string;
};
