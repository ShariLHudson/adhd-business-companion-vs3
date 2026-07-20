/** 060 — ADHD-friendly hard limits */

export const MAX_PRIMARY_RECOMMENDATIONS = 1;
export const MAX_SECONDARY_RECOMMENDATIONS = 3;
export const MAX_URGENT_RECOMMENDATIONS = 1;

export const CONFIDENCE_RANK: Record<
  import("./types").RecommendationConfidence,
  number
> = {
  very_high: 5,
  high: 4,
  medium: 3,
  low: 2,
  very_low: 1,
};

/** Displayable confidence — low/very_low never shown unless requested */
export function isDisplayableConfidence(
  c: import("./types").RecommendationConfidence,
): boolean {
  return c === "very_high" || c === "high" || c === "medium";
}
