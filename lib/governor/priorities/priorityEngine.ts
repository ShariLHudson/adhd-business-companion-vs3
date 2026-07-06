import type { GovernorRecommendation, IncomingRecommendation } from "../types";
import { evaluateAttentionPolicy } from "../policies/attentionPolicy";
import { isFounderFacing } from "../policies/attentionPolicy";

export function toGovernorRecommendation(item: IncomingRecommendation): GovernorRecommendation {
  const decision = evaluateAttentionPolicy(item);
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    source: item.source,
    disposition: decision.disposition,
    confidence: decision.confidence,
    reasoning: decision.reasoning,
  };
}

export function prioritizeRecommendations(
  items: IncomingRecommendation[],
): {
  primary: GovernorRecommendation | null;
  supporting: GovernorRecommendation[];
  deferredCount: number;
  silentCount: number;
} {
  const evaluated = items.map(toGovernorRecommendation);
  const founderFacing = evaluated.filter((r) => isFounderFacing(r.disposition));
  const silent = evaluated.filter((r) => r.disposition === "silent" || r.disposition === "remember_silently");
  const waiting = evaluated.filter((r) => r.disposition === "wait");

  const sorted = founderFacing.sort((a, b) => b.confidence.score - a.confidence.score);
  const primary = sorted[0] ?? null;
  const supporting = sorted.slice(1, 4);

  return {
    primary,
    supporting,
    deferredCount: waiting.length,
    silentCount: silent.length,
  };
}
