/**
 * Map signal combinations to predictive risk patterns.
 */

import type {
  PredictiveConfidence,
  PredictiveRiskLevel,
  PredictiveRiskType,
} from "./types";
import type { PredictiveSignalContext } from "./predictiveSignals";

export type PatternCandidate = {
  riskType: PredictiveRiskType;
  weight: number;
  predictedOutcome: string;
  recommendedSupport: string;
  sourceSignals: string[];
};

export function detectPredictivePatterns(
  ctx: PredictiveSignalContext,
): PatternCandidate[] {
  const patterns: PatternCandidate[] = [];

  if (
    (ctx.decliningEnergy && ctx.increasingLoad) ||
    (ctx.decliningRecovery && ctx.stalledMomentum) ||
    (ctx.decliningEnergy && ctx.decliningRecovery && ctx.increasingLoad)
  ) {
    patterns.push({
      riskType: "burnout_risk",
      weight: score(3, ctx.decliningEnergy, ctx.increasingLoad, ctx.decliningRecovery, ctx.stalledMomentum),
      predictedOutcome: "Energy may keep dipping if load stays high",
      recommendedSupport: "Reduce commitments and offer recovery support",
      sourceSignals: pick(ctx, ["declining energy", "increasing cognitive load", "declining recovery", "stalled momentum"]),
    });
  }

  if (ctx.increasingLoad && (ctx.overwhelmLoop || ctx.highCognitiveLoad)) {
    patterns.push({
      riskType: "overwhelm_risk",
      weight: score(2, ctx.increasingLoad, ctx.overwhelmLoop, ctx.highCognitiveLoad),
      predictedOutcome: "Cognitive load may become harder to carry",
      recommendedSupport: "Simplify and park new inputs before it feels heavier",
      sourceSignals: pick(ctx, ["increasing cognitive load", "overwhelm loop", "high cognitive load"]),
    });
  }

  if (
    (ctx.repeatedStuck && ctx.decisionFatigue) ||
    (ctx.repeatedStuck && ctx.overwhelmLoop)
  ) {
    patterns.push({
      riskType: "freeze_risk",
      weight: score(4, ctx.repeatedStuck, ctx.decisionFatigue, ctx.overwhelmLoop),
      predictedOutcome: "Starting may feel harder without a smaller entry point",
      recommendedSupport: "Reduce scope and offer one tiny next step",
      sourceSignals: pick(ctx, ["repeated stuck states", "decision fatigue", "overwhelm loop"]),
    });
  }

  if (ctx.decisionFatigue || getDecisionFatigueFromContext(ctx)) {
    patterns.push({
      riskType: "decision_fatigue_risk",
      weight: score(2, ctx.decisionFatigue),
      predictedOutcome: "Decisions may feel heavier than they need to",
      recommendedSupport: "Narrow to one decision or park the rest gently",
      sourceSignals: pick(ctx, ["decision fatigue"]),
    });
  }

  if (
    (ctx.decliningActivation && ctx.avoidancePattern) ||
    (ctx.stalledMomentum && ctx.decliningActivation)
  ) {
    patterns.push({
      riskType: "momentum_loss_risk",
      weight: score(2, ctx.decliningActivation, ctx.avoidancePattern, ctx.stalledMomentum),
      predictedOutcome: "Momentum may slip without a small win",
      recommendedSupport: "Offer a small win opportunity — no pressure",
      sourceSignals: pick(ctx, ["declining activation", "avoidance pattern", "stalled momentum"]),
    });
  }

  if (
    (ctx.stalledProjects > 0 && ctx.avoidancePattern) ||
    (ctx.stalledProjects > 0 && ctx.highCognitiveLoad)
  ) {
    patterns.push({
      riskType: "project_abandonment_risk",
      weight: score(2, ctx.stalledProjects > 0, ctx.avoidancePattern, ctx.highCognitiveLoad),
      predictedOutcome: "A project may drift without reconnecting to why it matters",
      recommendedSupport: "Reconnect to outcome or shrink the project scope",
      sourceSignals: pick(ctx, [`${ctx.stalledProjects} stalled project(s)`, "avoidance pattern", "high cognitive load"]),
    });
  }

  if (ctx.decliningRecovery || ctx.decliningEnergy) {
    patterns.push({
      riskType: "recovery_needed_risk",
      weight: score(2, ctx.decliningRecovery, ctx.decliningEnergy),
      predictedOutcome: "Rest may help more than pushing through",
      recommendedSupport: "Permission to recover — productive rest counts",
      sourceSignals: pick(ctx, ["declining recovery", "declining energy"]),
    });
  }

  if (ctx.relationshipDrift) {
    patterns.push({
      riskType: "relationship_followup_risk",
      weight: score(1, ctx.relationshipDrift),
      predictedOutcome: "A warm connection may cool without a gentle touch",
      recommendedSupport: "Optional follow-up reminder — no guilt",
      sourceSignals: pick(ctx, ["relationship follow-up drift"]),
    });
  }

  if (ctx.founderOverload) {
    patterns.push({
      riskType: "founder_overload_risk",
      weight: score(2, ctx.founderOverload),
      predictedOutcome: "Founder capacity may tighten if more is added",
      recommendedSupport: "Protect capacity before adding growth tasks",
      sourceSignals: pick(ctx, ["founder overload"]),
    });
  }

  if (ctx.poorEnvironmentFit && ctx.increasingLoad) {
    patterns.push({
      riskType: "custom",
      weight: score(1, ctx.poorEnvironmentFit, ctx.increasingLoad),
      predictedOutcome: "Environment friction may add to load",
      recommendedSupport: "One tiny environment adjustment before deep work",
      sourceSignals: pick(ctx, ["poor environment fit", "increasing cognitive load"]),
    });
  }

  return patterns.sort((a, b) => b.weight - a.weight);
}

function score(base: number, ...flags: unknown[]): number {
  let w = base;
  for (const f of flags) {
    if (f) w += 1;
  }
  return w;
}

function pick(ctx: PredictiveSignalContext, keys: string[]): string[] {
  return keys.filter((k) => ctx.signals.some((s) => s.includes(k) || s === k));
}

function getDecisionFatigueFromContext(ctx: PredictiveSignalContext): boolean {
  return ctx.signals.includes("decision fatigue");
}

export function weightToRiskLevel(weight: number): PredictiveRiskLevel {
  if (weight >= 6) return "high";
  if (weight >= 4) return "elevated";
  if (weight >= 2) return "moderate";
  return "low";
}

export function weightToConfidence(
  signalCount: number,
  weight: number,
): PredictiveConfidence {
  if (signalCount >= 3 && weight >= 4) return "high";
  if (signalCount >= 2 || weight >= 3) return "medium";
  return "low";
}

export function pickTopPattern(
  patterns: PatternCandidate[],
): PatternCandidate | null {
  return patterns[0] ?? null;
}
