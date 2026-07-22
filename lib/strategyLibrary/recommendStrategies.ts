/**
 * Prompt 143 — recommend instead of browsing.
 * Max three recommendations before "Browse All."
 */

import { POPULAR_STRATEGIES, type PopularStrategy } from "@/lib/strategyIntelligence";
import { STRATEGIES, type Strategy } from "@/lib/strategySystem";

export const STRATEGY_RECOMMENDATION_LIMIT = 3;

/** Curated first-screen recommendations (max 3). */
export function getTopStrategyRecommendations(
  limit = STRATEGY_RECOMMENDATION_LIMIT,
): PopularStrategy[] {
  return POPULAR_STRATEGIES.slice(0, Math.max(0, limit));
}

/** Recommended catalog strategies for Apply mode (max 3). */
export function getRecommendedStrategiesForApply(
  limit = STRATEGY_RECOMMENDATION_LIMIT,
): Strategy[] {
  const flagged = STRATEGIES.filter((s) => s.recommended);
  if (flagged.length > 0) return flagged.slice(0, limit);
  return STRATEGIES.slice(0, limit);
}

export function remainingPopularStrategyCount(
  shown = STRATEGY_RECOMMENDATION_LIMIT,
): number {
  return Math.max(0, POPULAR_STRATEGIES.length - shown);
}
