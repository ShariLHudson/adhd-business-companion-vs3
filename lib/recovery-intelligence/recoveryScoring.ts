/**
 * Score recovery level, energy trend, risk, and needs.
 */

import type {
  RecoveryConfidence,
  RecoveryInput,
  RecoveryLevel,
  RecoveryNeed,
  RecoveryRiskLevel,
  RecoverySignal,
  RecoverySnapshot,
  EnergyTrend,
} from "./types";
import { collectRecoverySignals, signalWeightTotal } from "./recoverySignals";

const LOAD_ORDER = ["light", "moderate", "heavy", "overloaded"] as const;

export function recoveryNeedLabel(need: RecoveryNeed): string {
  const labels: Record<RecoveryNeed, string> = {
    sleep: "Sleep",
    rest: "Rest",
    lighter_workload: "Lighter workload",
    recovery_day: "Recovery day",
    emotional_support: "Emotional support",
    decision_reduction: "Decision reduction",
    sensory_recovery: "Sensory recovery",
    social_recovery: "Social recovery",
    reduced_commitments: "Reduced commitments",
    mental_decompression: "Mental decompression",
  };
  return labels[need];
}

export function deriveRecoveryNeeds(
  input: RecoveryInput,
  signals: RecoverySignal[],
  level: RecoveryLevel,
): RecoveryNeed[] {
  const needs = new Set<RecoveryNeed>();
  const ids = new Set(signals.map((s) => s.id));

  if (ids.has("poor_sleep") || ids.has("fatigue")) needs.add("sleep");
  if (ids.has("exhaustion") || level === "depleted" || level === "burnout_risk") {
    needs.add("rest");
    needs.add("recovery_day");
  }
  if (
    input.cognitiveLoadLevel === "heavy" ||
    input.cognitiveLoadLevel === "overloaded" ||
    ids.has("overwhelm")
  ) {
    needs.add("lighter_workload");
    needs.add("mental_decompression");
  }
  if (ids.has("decision_fatigue") || input.adaptiveMode === "sorting") {
    needs.add("decision_reduction");
  }
  if (
    ids.has("hopelessness") ||
    ids.has("discouragement") ||
    ids.has("emotional_overload") ||
    input.emotionalState === "emotional"
  ) {
    needs.add("emotional_support");
  }
  if (ids.has("pain") || ids.has("mental_exhaustion")) {
    needs.add("sensory_recovery");
  }
  if (level === "strained" || level === "depleted") {
    needs.add("reduced_commitments");
  }
  if (input.userHealthStatus === "disengaging") {
    needs.add("social_recovery");
  }
  if (!needs.size && level !== "fully_recovered") {
    needs.add("rest");
  }
  return [...needs];
}

function inferEnergyTrend(input: RecoveryInput): EnergyTrend {
  const cur = input.cognitiveLoadLevel;
  const prior = input.priorCognitiveLoadLevel;
  if (cur && prior) {
    const ci = LOAD_ORDER.indexOf(cur);
    const pi = LOAD_ORDER.indexOf(prior);
    if (ci < pi) return "improving";
    if (ci > pi) return "declining";
  }
  if (input.momentumTrend === "rising") return "improving";
  if (input.momentumTrend === "falling") return "declining";
  if (
    input.activationState === "recovering" ||
    input.userHealthStatus === "recovering"
  ) {
    return "improving";
  }
  if (
    input.activationState === "frozen" ||
    input.userHealthStatus === "overloaded"
  ) {
    return "declining";
  }
  return "stable";
}

function inferRiskLevel(
  level: RecoveryLevel,
  weight: number,
  trend: EnergyTrend,
): RecoveryRiskLevel {
  if (level === "burnout_risk" || (weight >= 12 && trend === "declining")) {
    return "high";
  }
  if (level === "depleted" || weight >= 9) return "elevated";
  if (level === "strained" || weight >= 5) return "moderate";
  return "low";
}

function recommendedRecoveryFor(
  level: RecoveryLevel,
  needs: RecoveryNeed[],
): string {
  switch (level) {
    case "burnout_risk":
      return "Recovery overrides productivity — minimum viable day, protect energy before any new plans.";
    case "depleted":
      return "Minimum viable day — rest, lighter workload, no big decisions.";
    case "strained":
      return "Reduce commitments — fewer decisions, lighter scope today.";
    case "stable":
      return "Normal guidance with gentle pacing — watch for overload.";
    case "fully_recovered":
      return "Normal planning is appropriate — stay attuned without pushing.";
    default:
      return "Protect energy — recovery is productive.";
  }
}

export function scoreRecovery(
  input: RecoveryInput,
  signals: RecoverySignal[],
  now = input.now ?? new Date(),
): RecoverySnapshot {
  const weight = signalWeightTotal(signals);
  const load = input.cognitiveLoadLevel;
  const activation = input.activationState;
  const health = input.userHealthStatus;

  let recoveryLevel: RecoveryLevel = "stable";

  if (
    weight >= 12 ||
    load === "overloaded" ||
    health === "overloaded" ||
    (activation === "frozen" && weight >= 6)
  ) {
    recoveryLevel = "burnout_risk";
  } else if (
    weight >= 8 ||
    load === "heavy" ||
    health === "needs_support" ||
    activation === "frozen"
  ) {
    recoveryLevel = "depleted";
  } else if (
    weight >= 4 ||
    input.dayEnergyLow ||
    input.dayOverwhelmHigh ||
    health === "recovering"
  ) {
    recoveryLevel = "strained";
  } else if (
    weight <= 1 &&
    load === "light" &&
    activation === "moving" &&
    (!health || health === "supported" || health === "steady")
  ) {
    recoveryLevel = "fully_recovered";
  } else {
    recoveryLevel = "stable";
  }

  const energyTrend = inferEnergyTrend(input);
  const recoveryNeeds = deriveRecoveryNeeds(input, signals, recoveryLevel);
  const riskLevel = inferRiskLevel(recoveryLevel, weight, energyTrend);

  const confidence: RecoveryConfidence =
    weight >= 8 || recoveryLevel === "burnout_risk"
      ? "high"
      : weight >= 4 || signals.length >= 2
        ? "medium"
        : "low";

  return {
    recoveryLevel,
    confidence,
    recoveryNeeds,
    recoverySignals: signals.slice(0, 8),
    energyTrend,
    riskLevel,
    recommendedRecovery: recommendedRecoveryFor(recoveryLevel, recoveryNeeds),
    createdAt: now.toISOString(),
  };
}

export function recoveryOverridesProductivity(snapshot: RecoverySnapshot): boolean {
  return (
    snapshot.recoveryLevel === "burnout_risk" ||
    snapshot.recoveryLevel === "depleted" ||
    snapshot.riskLevel === "high"
  );
}
