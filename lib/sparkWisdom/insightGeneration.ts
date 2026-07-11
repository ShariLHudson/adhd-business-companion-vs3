/**
 * Spec 122 — Insight Generation
 */

import type { InsightRecommendation } from "./types";

const INSIGHT_INTERVAL_MIN = 5;
const INSIGHT_INTERVAL_MAX = 10;

export function countMeaningfulExchanges(
  history: Array<{ role: "user" | "assistant"; content: string }>,
): number {
  return history.filter((line) => line.role === "user").length;
}

export function recommendInsight(
  history: Array<{ role: "user" | "assistant"; content: string }>,
): InsightRecommendation | null {
  const turnCount = countMeaningfulExchanges(history);
  if (turnCount < INSIGHT_INTERVAL_MIN) return null;
  if (turnCount % INSIGHT_INTERVAL_MIN !== 0 && turnCount % INSIGHT_INTERVAL_MAX !== 0) {
    return null;
  }

  const framing =
    turnCount % INSIGHT_INTERVAL_MAX === 0
      ? ("emerged" as const)
      : turnCount % 7 === 0
        ? ("pattern" as const)
        : ("hearing" as const);

  const guidanceByFraming: Record<InsightRecommendation["framing"], string> = {
    pattern: "I'm noticing a pattern — share only if you can name something specific from this thread.",
    hearing: "Here's what I'm hearing — synthesize themes; do not lecture.",
    emerged:
      "I think something important just emerged — reflect back; one insight, not a list.",
  };

  return {
    due: true,
    turnCount,
    framing,
    guidance: guidanceByFraming[framing],
  };
}
