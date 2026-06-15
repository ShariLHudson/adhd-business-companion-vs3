/**
 * Founder-facing day designer reporting — patterns only.
 */

import { getDayDesignerStore } from "./dayStore";
import type { FounderDayDesignerReport } from "./types";

const BLOCKER_LABELS: Record<string, string> = {
  stuck_frozen: "Stuck / frozen when planning",
  overloaded: "Overloaded cognitive load",
  low_energy: "Low energy at plan time",
};

const REDUCED_TIP = "Reduce scope and leave margin";

export function buildFounderDayDesignerReport(
  now = new Date(),
): FounderDayDesignerReport {
  const store = getDayDesignerStore();
  const since7d = now.getTime() - 7 * 86_400_000;
  const sincePrior7d = now.getTime() - 14 * 86_400_000;

  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const prior = store.founderSamples.filter((s) => {
    const t = new Date(s.at).getTime();
    return t >= sincePrior7d && t < since7d;
  });

  const blockerCounts = new Map<string, number>();
  const energyCounts = new Map<string, number>();
  let reducedCount = 0;

  for (const sample of recent) {
    energyCounts.set(
      sample.energy,
      (energyCounts.get(sample.energy) ?? 0) + 1,
    );
    if (sample.reducedLoad) reducedCount += 1;
    if (sample.planningBlocker) {
      blockerCounts.set(
        sample.planningBlocker,
        (blockerCounts.get(sample.planningBlocker) ?? 0) + 1,
      );
    }
  }

  const commonPlanningBlockers = [...blockerCounts.entries()]
    .map(([id, count]) => ({
      id,
      label: BLOCKER_LABELS[id] ?? id,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const commonEnergyStates = [...energyCounts.entries()]
    .map(([energy, count]) => ({ energy, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const topBlocker = commonPlanningBlockers[0]?.id;

  return {
    generatedAt: now.toISOString(),
    plansCreated: recent.length,
    sampleSize: recent.length,
    commonPlanningBlockers,
    commonReducedLoadTips: reducedCount
      ? [{ tip: REDUCED_TIP, count: reducedCount }]
      : [],
    commonEnergyStates,
    loadTrend: computeTrend(recent.length, prior.length),
    recommendedFounderAction: founderActionFor(topBlocker),
    notes:
      "Local preview — aggregated planning patterns only, never individual schedules.",
  };
}

function computeTrend(
  recent: number,
  prior: number,
): "rising" | "stable" | "easing" {
  if (recent >= prior + 2) return "rising";
  if (recent <= prior - 2) return "easing";
  return "stable";
}

function founderActionFor(blocker: string | undefined): string {
  switch (blocker) {
    case "overloaded":
      return "Users plan under heavy load — surface load-sorting before full day planning.";
    case "stuck_frozen":
      return "Stuck users request plans — default to tiny-start flows, not full schedules.";
    case "low_energy":
      return "Low-energy plans dominate — promote minimum viable day templates.";
    default:
      return "Monitor planning uptake — keep day designer optional and shame-free.";
  }
}
