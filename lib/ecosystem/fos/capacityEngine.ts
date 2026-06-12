// Founder Ecosystem — Phase 8 Capacity Engine.
// How much can the founder reasonably take on right now? Reads the latest
// check-in (energy/focus), current workload, open projects and overwhelm
// signals. Returns low / medium / high with an explainable score. Pure.
// This is a workload/energy capacity read — NOT a clinical assessment.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import type { CapacityLevel, CapacityState, Level } from "./fosTypes";
import { clamp, DAY } from "./fosUtil";

const LEVEL_POINTS: Record<Level, number> = { low: -1, medium: 0, high: 1 };

function latestCheckin(events: FounderEvent[]) {
  return events
    .filter((e) => e.type === "checkin.recorded")
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))[0];
}

export type CapacityInputs = {
  openTasks: number;
  openProjects: number;
  openDecisions: number;
  scheduledBlocks: number;
};

export function computeCapacity(
  events: FounderEvent[],
  founderId: ID,
  intel: FounderIntelligence,
  inputs: CapacityInputs,
  now: Date = new Date(),
): CapacityState {
  const mine = events.filter((e) => e.founderId === founderId);
  const checkin = latestCheckin(mine);
  const energy = ((checkin?.data?.energy as Level) ?? "medium") satisfies Level;
  const focus = ((checkin?.data?.focus as Level) ?? "medium") satisfies Level;

  const since = now.getTime() - 7 * DAY;
  const overwhelmSignals =
    mine.filter(
      (e) =>
        e.type === "painpoint.observed" &&
        new Date(e.ts).getTime() > since &&
        /overwhelm|too much|drowning/i.test(String(e.data?.text ?? "")),
    ).length +
    intel.risks.filter((r) => r.type === "repeated-overwhelm").length;

  const factors: string[] = [];
  let score = 60;

  score += LEVEL_POINTS[energy] * 20;
  if (energy !== "medium") factors.push(`${energy} energy`);
  score += LEVEL_POINTS[focus] * 10;
  if (focus !== "medium") factors.push(`${focus} focus`);

  if (inputs.openTasks > 5) {
    score -= (inputs.openTasks - 5) * 3;
    factors.push(`${inputs.openTasks} open tasks`);
  }
  if (inputs.openProjects > 3) {
    score -= (inputs.openProjects - 3) * 6;
    factors.push(`${inputs.openProjects} active projects`);
  }
  if (overwhelmSignals > 0) {
    score -= overwhelmSignals * 8;
    factors.push(`${overwhelmSignals} overwhelm signal${overwhelmSignals > 1 ? "s" : ""}`);
  }

  score = clamp(score);
  const level: CapacityLevel = score >= 66 ? "high" : score >= 33 ? "medium" : "low";

  return {
    level,
    score,
    energy,
    focus,
    workload: inputs.openTasks,
    openProjects: inputs.openProjects,
    activeCommitments: inputs.openTasks + inputs.openDecisions + inputs.scheduledBlocks,
    overwhelmSignals,
    factors,
  };
}
