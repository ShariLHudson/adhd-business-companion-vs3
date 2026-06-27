/**
 * Sprint 5 — Trust Engine
 * Measure and strengthen trust through consistency, memory, and follow-through.
 */

import { getIntelligenceProfile } from "./intelligence-layer/profileStore";
import { getTrustAuditLog } from "./intelligence-layer/trustEvolutionAudit";
import type { OutcomeThread } from "./companionOutcomeThread";

export type TrustSnapshot = {
  respondsToSuggestions: number | null;
  disengagesFromNagging: number | null;
  momentumFromInterventions: number | null;
  recentAcceptances: number;
  recentDismissals: number;
  trustLevel: "building" | "steady" | "fragile" | "unknown";
};

export function buildTrustSnapshot(): TrustSnapshot {
  const trust = getIntelligenceProfile().relationship.trust;
  const log = getTrustAuditLog().slice(-40);
  const recentAcceptances = log.filter((e) =>
    /accepted|completed/i.test(e.trustCategory),
  ).length;
  const recentDismissals = log.filter((e) =>
    /dismissed|abandoned|ignored/i.test(e.trustCategory),
  ).length;

  const responds = trust.responds_to_suggestions?.score ?? null;
  const nagging = trust.disengages_from_nagging?.score ?? null;
  const momentum = trust.momentum_from_interventions?.score ?? null;

  let trustLevel: TrustSnapshot["trustLevel"] = "unknown";
  if (responds !== null && responds > 55 && recentDismissals <= recentAcceptances) {
    trustLevel = "steady";
  } else if (recentAcceptances >= 2) {
    trustLevel = "building";
  } else if (nagging !== null && nagging > 60) {
    trustLevel = "fragile";
  }

  return {
    respondsToSuggestions: responds,
    disengagesFromNagging: nagging,
    momentumFromInterventions: momentum,
    recentAcceptances,
    recentDismissals,
    trustLevel,
  };
}

export function explainRecommendationHint(input: {
  featureLabel: string;
  friction?: string | null;
}): string {
  const friction = input.friction ?? "what you described";
  return `I'm suggesting **${input.featureLabel}** because ${friction} looks like the biggest obstacle right now.`;
}

export function trustEngineHintForChat(input: {
  snapshot?: TrustSnapshot;
  outcomeThread?: OutcomeThread | null;
  recommendationExplanation?: string | null;
}): string {
  const snapshot = input.snapshot ?? buildTrustSnapshot();
  const parts: string[] = [
    "TRUST ENGINE (Sprint 5 — invisible):",
    "Strengthen trust: remember context, follow through, explain why, stay consistent.",
    "NEVER abandon a thread. NEVER reset after yes/sure/okay.",
  ];

  if (input.outcomeThread?.currentProblem) {
    parts.push(
      `Remember: you were working on "${input.outcomeThread.currentProblem.slice(0, 120)}".`,
    );
  }
  if (input.outcomeThread?.currentGoal) {
    parts.push(`Active goal: ${input.outcomeThread.currentGoal.slice(0, 120)}.`);
  }
  if (input.outcomeThread?.pendingAction) {
    parts.push(`Follow through on: ${input.outcomeThread.pendingAction.slice(0, 120)}.`);
  }

  if (snapshot.trustLevel === "fragile" || snapshot.disengagesFromNagging !== null && snapshot.disengagesFromNagging > 60) {
    parts.push("Trust is fragile — avoid nagging, repeated offers, or pressure. One gentle suggestion max.");
  } else if (snapshot.trustLevel === "building") {
    parts.push("Trust is building — explain recommendations briefly when suggesting tools.");
  }

  if (input.recommendationExplanation) {
    parts.push(`When offering a tool, you may explain: ${input.recommendationExplanation}`);
  }

  parts.push(
    "Positive trust: returning, following through, sharing struggles, accepting routing.",
    "Negative trust signals: ignored suggestions, abandoned workflows, frustration — respond with smaller scope, not more advice.",
  );

  return parts.join("\n");
}
