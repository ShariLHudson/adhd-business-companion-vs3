/**
 * 060 — Merge candidates → one primary + ≤3 secondary.
 */

import {
  CONFIDENCE_RANK,
  isDisplayableConfidence,
  MAX_SECONDARY_RECOMMENDATIONS,
  MAX_URGENT_RECOMMENDATIONS,
} from "./limits";
import type {
  IntelligentRecommendation,
  RecommendationPack,
} from "./types";

function compareRecs(
  a: IntelligentRecommendation,
  b: IntelligentRecommendation,
): number {
  if (a.urgent && !b.urgent) return -1;
  if (!a.urgent && b.urgent) return 1;
  const conf =
    CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence];
  if (conf !== 0) return conf;
  return b.score - a.score;
}

function dedupeByTitle(
  items: IntelligentRecommendation[],
): IntelligentRecommendation[] {
  const seen = new Set<string>();
  const out: IntelligentRecommendation[] = [];
  for (const item of items) {
    const key = item.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/**
 * Enforce: 1 primary · ≤3 secondary · ≤1 urgent · suppress low confidence.
 */
export function rankAndLimitRecommendations(
  candidates: IntelligentRecommendation[],
  options?: { returningSession?: boolean; fallbackPrimary?: IntelligentRecommendation },
): RecommendationPack {
  const deduped = dedupeByTitle(candidates);
  const displayable = deduped.filter((c) =>
    isDisplayableConfidence(c.confidence),
  );
  const suppressed = deduped.filter(
    (c) => !isDisplayableConfidence(c.confidence),
  );

  const sorted = [...displayable].sort(compareRecs);

  let urgentCount = 0;
  const gated: IntelligentRecommendation[] = [];
  for (const item of sorted) {
    if (item.urgent) {
      if (urgentCount >= MAX_URGENT_RECOMMENDATIONS) {
        suppressed.push({ ...item, urgent: false });
        continue;
      }
      urgentCount += 1;
    }
    gated.push(item);
  }

  const primary =
    gated[0] ??
    options?.fallbackPrimary ??
    ({
      id: "fallback-continue",
      title: "Continue where you left off",
      category: "continue_work",
      confidence: "high",
      reason: "Your creation is ready whenever you are.",
      estimatedEffort: null,
      impact: "medium",
      unlocks: [],
      actionLabel: "Continue",
      conversationLine:
        "Whenever you're ready, we can pick up right where this creation left off.",
      source: "creation_engine",
      score: 1,
    } satisfies IntelligentRecommendation);

  const secondary = gated
    .slice(1)
    .filter((c) => c.id !== primary.id)
    .slice(0, MAX_SECONDARY_RECOMMENDATIONS);

  const rest = gated.slice(1 + secondary.length);
  return {
    primary,
    secondary,
    suppressed: [...suppressed, ...rest],
    returningSession: Boolean(options?.returningSession),
  };
}
