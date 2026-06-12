// Founder Ecosystem — Phase 9 Journey selectors.
// Named accessors + plain-language answers over a FounderJourney. Pure.

import {
  STAGE_LABEL,
  STAGE_ORDER,
  type BusinessStage,
  type FounderFocus,
  type FounderJourney,
  type JourneyRecommendation,
} from "./journeyTypes";

const FOCUS_LABEL: Record<FounderFocus, string> = {
  marketing: "Marketing",
  sales: "Sales",
  operations: "Operations",
  "product-creation": "Product creation",
  systems: "Systems",
  content: "Content",
  "customer-success": "Customer success",
  leadership: "Leadership",
};

export const selectCurrentStage = (j: FounderJourney): BusinessStage => j.currentStage;
export const selectStageLabel = (j: FounderJourney): string => STAGE_LABEL[j.currentStage];

export const selectPrimaryFocusLabel = (j: FounderJourney): string | null =>
  j.primaryFocus ? FOCUS_LABEL[j.primaryFocus] : null;

export const selectChallenges = (j: FounderJourney): string[] => j.currentChallenges;
export const selectOpportunities = (j: FounderJourney): string[] => j.currentOpportunities;
export const selectRisks = (j: FounderJourney): string[] => j.currentRisks;

export const selectRecommendations = (j: FounderJourney): JourneyRecommendation[] =>
  j.recommendations;

export const selectRecommendedActions = (j: FounderJourney): string[] =>
  j.recommendations.map((r) => r.text);

/** What to actively skip right now (the stage's common distractions). */
export const selectThingsToAvoid = (j: FounderJourney): string[] =>
  j.recommendations.map((r) => r.avoid).filter((x): x is string => Boolean(x));

/** Progress through the 5-stage journey, 0–1. */
export const selectJourneyProgress = (j: FounderJourney): number =>
  (STAGE_ORDER.indexOf(j.currentStage) + 1) / STAGE_ORDER.length;

// ---- Plain-language answers --------------------------------------------
export function whereAmIInMyJourney(j: FounderJourney): string {
  const focus = j.primaryFocus ? `, focused on ${FOCUS_LABEL[j.primaryFocus].toLowerCase()}` : "";
  return `You're in the ${STAGE_LABEL[j.currentStage]} stage${focus} (confidence: ${j.confidence}).`;
}

export function whatMattersMostNow(j: FounderJourney): string {
  const top = j.recommendations[0];
  return top ? `${top.text}. ${top.reason}` : "Keep moving — no single thing stands out yet.";
}

export function whatToSkipNow(j: FounderJourney): string {
  const avoid = selectThingsToAvoid(j);
  return avoid.length ? `For now, skip: ${avoid.join("; ")}.` : "Nothing obvious to cut right now.";
}
