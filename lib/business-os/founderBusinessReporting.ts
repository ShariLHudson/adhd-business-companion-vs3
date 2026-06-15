/**
 * Founder-facing Business OS reporting.
 */

import { businessAreaLabel, businessHealthLabel } from "./businessAreas";
import { getBusinessOSStore } from "./businessStore";
import type { BusinessArea, BusinessHealthLevel, FounderBusinessOSReport } from "./types";

const MS_DAY = 86_400_000;

export function buildFounderBusinessOSReport(
  now = new Date(),
): FounderBusinessOSReport {
  const store = getBusinessOSStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const healthCounts = new Map<BusinessHealthLevel, number>();
  const riskAreaCounts = new Map<string, number>();
  const actionCounts = new Map<string, number>();

  let overloadedCount = 0;

  for (const s of recent) {
    healthCounts.set(s.health, (healthCounts.get(s.health) ?? 0) + 1);
    if (s.health === "overloaded") overloadedCount += 1;
    if (s.highestRiskArea) {
      riskAreaCounts.set(
        s.highestRiskArea,
        (riskAreaCounts.get(s.highestRiskArea) ?? 0) + 1,
      );
    }
  }

  for (const snap of store.history.slice(-20)) {
    for (const action of snap.recommendedActions) {
      actionCounts.set(action.label, (actionCounts.get(action.label) ?? 0) + 1);
    }
  }

  const healthDistribution = [...healthCounts.entries()]
    .map(([level, count]) => ({
      level,
      label: businessHealthLabel(level),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const topRiskAreas = [...riskAreaCounts.entries()]
    .map(([area, count]) => ({
      area: area as BusinessArea,
      label: businessAreaLabel(area as BusinessArea),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const latest = store.history[store.history.length - 1];
  const topOpportunities =
    latest?.activeOpportunities.slice(0, 5).map((o) => ({
      label: o.label,
      area: o.area,
      count: 1,
    })) ?? [];

  const commonActions = [...actionCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topHealth = healthDistribution[0]?.level;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    healthDistribution,
    overloadedCount,
    topRiskAreas,
    topOpportunities,
    commonActions,
    recommendedFounderAction: founderActionFor(topHealth, latest),
    notes:
      "Local preview — Business OS reduces cognitive load, never shames or hustles.",
  };
}

function founderActionFor(
  health: BusinessHealthLevel | undefined,
  latest: { highestRiskArea: BusinessArea | null } | undefined,
): string {
  if (health === "overloaded") {
    return "Lead with founder capacity protection — simplify companion business prompts.";
  }
  if (latest?.highestRiskArea === "founder_capacity") {
    return "Surface capacity before growth — CoS and recovery hints align.";
  }
  if (latest?.highestRiskArea === "operations") {
    return "Promote workflow systemization offers when friction repeats.";
  }
  return "Keep business sorting optional and gentle.";
}
