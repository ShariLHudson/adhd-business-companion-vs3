/**
 * Phase 4 — domain contribution accessors for the shared judgment engine.
 */

import type { StrategyTypeContract } from "../types";

export type DomainContributionSummary = {
  entrySignals: StrategyTypeContract["entrySignals"];
  hiddenUnderlyingQuestions: string[];
  evidenceNeeded: string[];
  commonFalseAssumptions: string[];
  optionPatterns: StrategyTypeContract["optionPatterns"];
  materialTradeoffs: string[];
  riskPatterns: string[];
  capacityChecks: string[];
  experiments: string[];
  recommendationRules: string[];
  handoffBoundaries: string[];
  handoffDestinations: StrategyTypeContract["handoffDestinations"];
};

export function summarizeDomainContributions(
  domain: StrategyTypeContract,
): DomainContributionSummary {
  return {
    entrySignals: domain.entrySignals,
    hiddenUnderlyingQuestions: domain.hiddenUnderlyingQuestions,
    evidenceNeeded: domain.evidencePrompts,
    commonFalseAssumptions: domain.commonAssumptions,
    optionPatterns: domain.optionPatterns,
    materialTradeoffs: domain.commonTradeoffs,
    riskPatterns: domain.commonRisks,
    capacityChecks: domain.capacityChecks,
    experiments: domain.experimentPatterns,
    recommendationRules: domain.recommendationRules.length
      ? domain.recommendationRules
      : domain.decisionHeuristics.map((h) => h.rule),
    handoffBoundaries: domain.handoffBoundaries,
    handoffDestinations: domain.handoffDestinations,
  };
}

/** First unanswered hidden question still useful for the turn. */
export function nextHiddenUnderlyingQuestion(
  domain: StrategyTypeContract | null | undefined,
  answeredBlob: string,
): string | null {
  if (!domain?.hiddenUnderlyingQuestions?.length) return null;
  const blob = answeredBlob.toLowerCase();
  for (const q of domain.hiddenUnderlyingQuestions) {
    const key = q
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 3)
      .join(" ");
    if (key && blob.includes(key.slice(0, 12))) continue;
    return q;
  }
  return domain.hiddenUnderlyingQuestions[0] ?? null;
}
