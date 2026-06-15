/**
 * Explainable recovery insights.
 */

import { recoveryNeedLabel } from "./recoveryScoring";
import type { RecoverySnapshot } from "./types";

const LEVEL_LABELS: Record<RecoverySnapshot["recoveryLevel"], string> = {
  fully_recovered: "Fully recovered",
  stable: "Stable",
  strained: "Strained",
  depleted: "Depleted",
  burnout_risk: "Burnout risk",
};

export function recoveryLevelLabel(level: RecoverySnapshot["recoveryLevel"]): string {
  return LEVEL_LABELS[level];
}

export function explainRecoverySnapshot(snapshot: RecoverySnapshot): string[] {
  const lines: string[] = [];
  if (snapshot.recoverySignals.length) {
    lines.push(
      `Signals: ${snapshot.recoverySignals.map((s) => s.label).join(", ")}`,
    );
  }
  if (snapshot.recoveryNeeds.length) {
    lines.push(
      `Needs: ${snapshot.recoveryNeeds.map((n) => recoveryNeedLabel(n)).join(", ")}`,
    );
  }
  lines.push(`Energy trend: ${snapshot.energyTrend}`);
  lines.push(`Risk: ${snapshot.riskLevel}`);
  return lines;
}

export function founderRecoveryImprovements(
  snapshots: { level: string; trend: string; needs: string[] }[],
): string[] {
  const improvements: string[] = [];
  const depleted = snapshots.filter(
    (s) => s.level === "depleted" || s.level === "burnout_risk",
  ).length;
  const declining = snapshots.filter((s) => s.trend === "declining").length;
  const decisionFatigue = snapshots.some((s) =>
    s.needs.includes("decision_reduction"),
  );

  if (decisionFatigue) {
    improvements.push("Many users are showing decision fatigue.");
  }
  if (depleted >= 2) {
    improvements.push("Recovery needs are increasing.");
  }
  if (declining >= 2) {
    improvements.push("Burnout risk is trending upward.");
  }
  if (!improvements.length) {
    improvements.push("Recovery patterns look steady — keep permission-to-rest messaging.");
  }
  return improvements;
}
