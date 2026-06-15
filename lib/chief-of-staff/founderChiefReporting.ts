/**
 * Founder-facing Chief of Staff reporting.
 */

import { chiefAssessmentLabel } from "./chiefInsights";
import { getChiefStore } from "./chiefStore";
import type { ChiefAssessmentLevel, FounderChiefReport } from "./types";

const MS_DAY = 86_400_000;

export function buildFounderChiefReport(now = new Date()): FounderChiefReport {
  const store = getChiefStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const assessmentCounts = new Map<ChiefAssessmentLevel, number>();
  const ignoreCounts = new Map<string, number>();
  const actionCounts = new Map<string, number>();
  let overloadedCount = 0;

  for (const s of recent) {
    assessmentCounts.set(
      s.assessment,
      (assessmentCounts.get(s.assessment) ?? 0) + 1,
    );
    if (s.assessment === "overloaded" || s.assessment === "critical") {
      overloadedCount += 1;
    }
  }

  for (const snap of store.history.slice(-30)) {
    for (const item of snap.projectsToIgnore) {
      ignoreCounts.set(item, (ignoreCounts.get(item) ?? 0) + 1);
    }
    for (const action of snap.recommendedActions) {
      actionCounts.set(action.label, (actionCounts.get(action.label) ?? 0) + 1);
    }
  }

  const assessmentDistribution = [...assessmentCounts.entries()]
    .map(([level, count]) => ({
      level,
      label: chiefAssessmentLabel(level),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const latest = store.history[store.history.length - 1];
  const topAssessment = assessmentDistribution[0]?.level;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    assessmentDistribution,
    overloadedCount,
    commonIgnoreItems: [...ignoreCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    commonActions: [...actionCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recommendedFounderAction: founderActionFor(topAssessment, latest),
    notes:
      "Local preview — Chief of Staff reduces overwhelm; ignore list is a feature.",
  };
}

function founderActionFor(
  assessment: ChiefAssessmentLevel | undefined,
  latest: { projectsToIgnore: string[] } | undefined,
): string {
  if (assessment === "critical" || assessment === "overloaded") {
    return "Default to capacity protection — shorter CoS lists, stronger ignore prompts.";
  }
  if (latest && latest.projectsToIgnore.length >= 3) {
    return "Ignore list is landing — keep it prominent in CoS offers.";
  }
  return "Offer CoS perspective when choices feel scattered, never as pressure.";
}
