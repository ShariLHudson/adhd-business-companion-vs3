/**
 * Momentum Profile — quiet bridge to existing momentum intelligence.
 * Learns work style, energy, obstacles over time — largely invisible to members.
 *
 * @see docs/MOMENTUM_BUILDER_V1_ORCHESTRATION.md
 */

import { gatherMomentumInput } from "@/lib/momentum-intelligence/momentumSignals";
import { getMomentumStore } from "@/lib/momentum-intelligence/momentumStore";
import type { MomentumSnapshot } from "@/lib/momentum-intelligence/types";

export type MomentumProfileSignals = {
  momentumLevel: MomentumSnapshot["momentumLevel"] | "unknown";
  trend: MomentumSnapshot["momentumTrend"] | "unknown";
  recurringBlockers: string[];
  recurringWins: string[];
  preferredEnergyBand: "low" | "medium" | "high" | "unknown";
  hasDayPlanContext: boolean;
  hasActiveProjects: boolean;
};

export function readMomentumProfileSignals(input?: {
  now?: Date;
}): MomentumProfileSignals {
  const now = input?.now ?? new Date();
  const gathered = gatherMomentumInput({ now });
  const store = getMomentumStore();
  const recent = store.history.slice(-7);

  const recurringBlockers = tallyLabels(
    recent.flatMap((s) => s.momentumBlockers.map((b) => String(b))),
  );
  const recurringWins = tallyLabels(
    recent.flatMap((s) => s.wins.map((w) => w.label)),
  );

  const latest = recent[recent.length - 1];

  return {
    momentumLevel: latest?.momentumLevel ?? "unknown",
    trend: latest?.momentumTrend ?? "unknown",
    recurringBlockers,
    recurringWins,
    preferredEnergyBand: inferEnergyBand(gathered, recent),
    hasDayPlanContext: (gathered.dayPlansCompleted ?? 0) > 0,
    hasActiveProjects: (gathered.stalledProjectCount ?? 0) > 0,
  };
}

function tallyLabels(labels: string[]): string[] {
  const counts = new Map<string, number>();
  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);
}

function inferEnergyBand(
  gathered: ReturnType<typeof gatherMomentumInput>,
  recent: MomentumSnapshot[],
): MomentumProfileSignals["preferredEnergyBand"] {
  if (
    gathered.cognitiveLoadLevel === "heavy" ||
    gathered.cognitiveLoadLevel === "overloaded"
  ) {
    return "low";
  }
  if (recent.some((s) => s.momentumLevel === "building")) return "medium";
  if (recent.some((s) => s.momentumLevel === "steady")) return "high";
  return "unknown";
}
