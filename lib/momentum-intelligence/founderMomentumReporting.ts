/**
 * Founder-facing momentum reporting.
 */

import { blockerLabel, builderLabel } from "./momentumSignals";
import { momentumLevelLabel } from "./momentumInsights";
import { getMomentumStore } from "./momentumStore";
import type {
  FounderMomentumReport,
  MomentumBlocker,
  MomentumBuilder,
  MomentumLevel,
} from "./types";

const MS_DAY = 86_400_000;

export function buildFounderMomentumReport(
  now = new Date(),
): FounderMomentumReport {
  const store = getMomentumStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const levelCounts = new Map<MomentumLevel, number>();
  const builderCounts = new Map<MomentumBuilder, number>();
  const blockerCounts = new Map<MomentumBlocker, number>();
  let risingCount = 0;
  let strongCount = 0;

  for (const s of recent) {
    levelCounts.set(s.level, (levelCounts.get(s.level) ?? 0) + 1);
    if (s.trend === "rising") risingCount += 1;
    if (s.level === "strong") strongCount += 1;
    for (const b of s.builders) {
      builderCounts.set(b, (builderCounts.get(b) ?? 0) + 1);
    }
    for (const b of s.blockers) {
      blockerCounts.set(b, (blockerCounts.get(b) ?? 0) + 1);
    }
  }

  const distribution = [...levelCounts.entries()]
    .map(([level, count]) => ({
      level,
      label: momentumLevelLabel(level),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const top = distribution[0]?.level;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    distribution,
    stalledCount: levelCounts.get("stalled") ?? 0,
    restartingCount: levelCounts.get("restarting") ?? 0,
    risingCount,
    strongCount,
    commonBuilders: [...builderCounts.entries()]
      .map(([builder, count]) => ({
        builder,
        label: builderLabel(builder),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    commonBlockers: [...blockerCounts.entries()]
      .map(([blocker, count]) => ({
        blocker,
        label: blockerLabel(blocker),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recommendedFounderAction: founderActionFor(top),
    notes:
      "Local preview — celebrate small wins, never shame stalled momentum.",
  };
}

function founderActionFor(level: MomentumLevel | undefined): string {
  switch (level) {
    case "stalled":
      return "Lead with support and recovery — avoid productivity framing when stalled.";
    case "restarting":
      return "Protect restarting users — encouragement without rushing.";
    case "building":
      return "Momentum is building — don't add load when users are moving.";
    case "strong":
      return "Strong momentum — resist piling on; celebrate and follow their pace.";
    default:
      return "Reflect overlooked progress in companion copy.";
  }
}
