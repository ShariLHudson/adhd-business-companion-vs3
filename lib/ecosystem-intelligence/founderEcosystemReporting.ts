/**
 * Founder-facing ecosystem hub reporting.
 */

import { ecosystemHealthLabel, ecosystemSystemImprovement } from "./ecosystemInsights";
import { priorityLabel } from "./ecosystemPriority";
import { getEcosystemStore } from "./ecosystemStore";
import type { EcosystemHealth, EcosystemPriority, FounderEcosystemReport } from "./types";

const MS_DAY = 86_400_000;

export function buildFounderEcosystemReport(
  now = new Date(),
): FounderEcosystemReport {
  const store = getEcosystemStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const live = store.history[store.history.length - 1] ?? null;

  const healthCounts = new Map<EcosystemHealth, number>();
  const priorityCounts = new Map<EcosystemPriority, number>();
  const suppressionCounts = new Map<string, number>();

  for (const s of recent) {
    healthCounts.set(s.userHealth, (healthCounts.get(s.userHealth) ?? 0) + 1);
    priorityCounts.set(
      s.topSignal,
      (priorityCounts.get(s.topSignal) ?? 0) + 1,
    );
  }

  for (const snap of store.history.slice(-40)) {
    for (const sup of snap.suppressions) {
      suppressionCounts.set(sup, (suppressionCounts.get(sup) ?? 0) + 1);
    }
  }

  const healthDistribution = [...healthCounts.entries()]
    .map(([health, count]) => ({
      health,
      label: ecosystemHealthLabel(health),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const topPriorities = [...priorityCounts.entries()]
    .map(([priority, count]) => ({
      priority,
      label: priorityLabel(priority),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    healthDistribution,
    topPriorities,
    commonSuppressions: [...suppressionCounts.entries()]
      .map(([suppression, count]) => ({ suppression, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    topUserNeeds: live
      ? [
          live.userState.summary,
          live.topSignal !== "calm_presence"
            ? priorityLabel(live.topSignal)
            : null,
        ].filter(Boolean) as string[]
      : [],
    topFounderRisks: live?.founderState.topRisk ? [live.founderState.topRisk] : [],
    topFounderOpportunities: live?.founderState.topOpportunity
      ? [live.founderState.topOpportunity]
      : [],
    recommendedSystemImprovement: live
      ? ecosystemSystemImprovement(live)
      : "Run ecosystem orchestration to gather coordinated signals.",
    notes:
      "Local preview — one Companion, coordinated signals, no engagement manipulation.",
  };
}
