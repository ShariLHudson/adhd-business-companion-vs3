// Founder Ecosystem — Phase 10 recommendation selectors.
// Named accessors + a couple of plain-language answers over a
// FounderRecommendations set. Pure.

import type {
  AdvisorNote,
  FounderRecommendations,
  Recommendation,
  TimeAllocationSlice,
} from "./recommendationTypes";

export const selectTopRecommendation = (r: FounderRecommendations): Recommendation | null =>
  r.recommendations[0] ?? null;

export const selectFocusToday = (r: FounderRecommendations): Recommendation | null =>
  r.recommendations.find((x) => x.category === "focus-today") ?? r.recommendations[0] ?? null;

export const selectNextActions = (
  r: FounderRecommendations,
  limit = 3,
): Recommendation[] => r.recommendations.slice(0, limit);

export const selectTimeAllocation = (r: FounderRecommendations): TimeAllocationSlice[] =>
  r.timeAllocation;

export const selectAdvisorNotes = (r: FounderRecommendations): AdvisorNote[] => r.advisorNotes;

export const selectRiskAlerts = (r: FounderRecommendations) =>
  r.alerts.filter((a) => a.kind === "risk");

export const selectOpportunityAlerts = (r: FounderRecommendations) =>
  r.alerts.filter((a) => a.kind === "opportunity");

/** Recommendations that have at least one actionable, non-"none" link. */
export const selectActionable = (r: FounderRecommendations): Recommendation[] =>
  r.recommendations.filter((x) => x.links.some((l) => l.target !== "none"));

/** Things to actively skip right now (stage distractions). */
export const selectThingsToAvoid = (r: FounderRecommendations): string[] =>
  r.recommendations.map((x) => x.avoid).filter((x): x is string => Boolean(x));

// ---- Plain-language answers --------------------------------------------
export function whatShouldIFocusOnToday(r: FounderRecommendations): string {
  const top = selectFocusToday(r);
  return top ? `${top.title} (${top.estimatedMinutes} min). ${top.rationale}` : r.headline;
}

export function whatAreMyNextSteps(r: FounderRecommendations): string[] {
  return selectNextActions(r, 3).map((x) => `${x.title} — ${x.links[0]?.label ?? "no link"}`);
}
