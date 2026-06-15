/**
 * Founder-facing recovery reporting.
 */

import { founderRecoveryImprovements, recoveryLevelLabel } from "./recoveryInsights";
import { recoveryNeedLabel } from "./recoveryScoring";
import { getRecoveryStore } from "./recoveryStore";
import type {
  FounderRecoveryReport,
  RecoveryLevel,
  RecoveryNeed,
} from "./types";

const MS_DAY = 86_400_000;

export function buildFounderRecoveryReport(
  now = new Date(),
): FounderRecoveryReport {
  const store = getRecoveryStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const levelCounts = new Map<RecoveryLevel, number>();
  const needCounts = new Map<RecoveryNeed, number>();
  let burnoutRiskCount = 0;
  let decliningEnergyCount = 0;

  for (const s of recent) {
    levelCounts.set(s.level, (levelCounts.get(s.level) ?? 0) + 1);
    if (s.level === "burnout_risk" || s.level === "depleted") {
      burnoutRiskCount += 1;
    }
    if (s.energyTrend === "declining") decliningEnergyCount += 1;
    for (const n of s.recoveryNeeds) {
      needCounts.set(n, (needCounts.get(n) ?? 0) + 1);
    }
  }

  const distribution = [...levelCounts.entries()]
    .map(([level, count]) => ({
      level,
      label: recoveryLevelLabel(level),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const commonRecoveryNeeds = [...needCounts.entries()]
    .map(([need, count]) => ({
      need,
      label: recoveryNeedLabel(need),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const recoveryImprovements = founderRecoveryImprovements(
    recent.map((s) => ({
      level: s.level,
      trend: s.energyTrend,
      needs: s.recoveryNeeds,
    })),
  );

  const top = distribution[0]?.level;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    distribution,
    burnoutRiskCount,
    decliningEnergyCount,
    commonRecoveryNeeds,
    recoveryImprovements,
    recommendedFounderAction: founderActionFor(top),
    notes:
      "Local preview — improve recovery flows, never guilt users into pushing through.",
  };
}

function founderActionFor(level: RecoveryLevel | undefined): string {
  switch (level) {
    case "burnout_risk":
      return "Default to minimum viable day — recovery must override planning prompts.";
    case "depleted":
      return "Reduce decision and planning surfaces when depletion is detected.";
    case "strained":
      return "Offer lighter workload framing before new commitments.";
    case "stable":
      return "Monitor declining energy trends — keep rest permission visible.";
    case "fully_recovered":
      return "Recovery messaging is landing — avoid reintroducing hustle tone.";
    default:
      return "Collect more samples — prioritize well-being metrics over engagement.";
  }
}
