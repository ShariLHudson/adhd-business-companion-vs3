/**
 * Founder-facing predictive support reporting.
 */

import { founderActionFor, riskTypeLabel } from "./predictiveInsights";
import { getPredictiveStore } from "./predictiveStore";
import type { FounderPredictiveReport, PredictiveRiskType } from "./types";

const MS_DAY = 86_400_000;

export function buildFounderPredictiveReport(
  now = new Date(),
): FounderPredictiveReport {
  const store = getPredictiveStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const sincePrior7d = now.getTime() - 14 * MS_DAY;

  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const prior = store.founderSamples.filter((s) => {
    const t = new Date(s.at).getTime();
    return t >= sincePrior7d && t < since7d;
  });

  const typeCounts = new Map<PredictiveRiskType, number>();
  const supportCounts = new Map<string, number>();
  let elevatedOrHighCount = 0;
  let founderOverloadCount = 0;

  for (const s of recent) {
    typeCounts.set(s.riskType, (typeCounts.get(s.riskType) ?? 0) + 1);
    if (s.riskLevel === "elevated" || s.riskLevel === "high") {
      elevatedOrHighCount += 1;
    }
    if (s.riskType === "founder_overload_risk") founderOverloadCount += 1;
  }

  for (const snap of store.history.slice(-30)) {
    supportCounts.set(
      snap.recommendedSupport,
      (supportCounts.get(snap.recommendedSupport) ?? 0) + 1,
    );
  }

  const priorTypeCounts = new Map<PredictiveRiskType, number>();
  for (const s of prior) {
    priorTypeCounts.set(s.riskType, (priorTypeCounts.get(s.riskType) ?? 0) + 1);
  }

  const emergingRisks = [...typeCounts.entries()]
    .map(([riskType, count]) => {
      const priorCount = priorTypeCounts.get(riskType) ?? 0;
      const trend =
        count >= priorCount + 2
          ? ("rising" as const)
          : count <= priorCount - 1
            ? ("easing" as const)
            : ("stable" as const);
      return {
        riskType,
        label: riskTypeLabel(riskType),
        count,
        trend,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const riskTrend =
    recent.length >= prior.length + 2
      ? "rising"
      : recent.length <= prior.length - 2
        ? "easing"
        : "stable";

  const topType = emergingRisks[0]?.riskType;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    emergingRisks,
    riskTrend,
    commonSupportOpportunities: [...supportCounts.entries()]
      .map(([support, count]) => ({ support, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    founderOverloadCount,
    elevatedOrHighCount,
    recommendedFounderAction: founderActionFor(topType, elevatedOrHighCount),
    notes:
      "Local preview — prevent suffering, never predict failure or use fear.",
  };
}
