/**
 * Score momentum level, trend, and recommended support.
 */

import type {
  MomentumConfidence,
  MomentumInput,
  MomentumLevel,
  MomentumSnapshot,
  MomentumTrend,
} from "./types";
import {
  collectRecentWins,
  detectMomentumBlockers,
  detectMomentumBuilders,
  gatherMomentumInput,
} from "./momentumSignals";

export function recommendedSupportFor(
  level: MomentumLevel,
  blockers: ReturnType<typeof detectMomentumBlockers>,
): string {
  if (level === "stalled" && blockers.includes("repeated_overwhelm")) {
    return "Support and recovery — notice effort, not output. No productivity push.";
  }
  if (level === "restarting") {
    return "Encouragement and protection — small wins count; don't rush.";
  }
  if (level === "building") {
    return "Acknowledge movement gently — protect momentum without adding load.";
  }
  if (level === "strong") {
    return "Avoid overloading with more work — celebrate, then follow their pace.";
  }
  if (level === "steady") {
    return "Steady presence — reflect progress they might overlook.";
  }
  return "Warm observation only — no hype or hustle framing.";
}

export function inferMomentumTrend(
  input: ReturnType<typeof gatherMomentumInput>,
  netScore: number,
): MomentumTrend {
  const health = input.userHealthStatus;
  if (
    health === "recovering" ||
    input.activationState === "recovering" ||
    (netScore >= 3 && input.positiveScore > input.negativeScore)
  ) {
    return "rising";
  }
  if (netScore <= -2 || input.negativeScore > input.positiveScore + 2) {
    return "falling";
  }
  return "stable";
}

export function inferMomentumLevel(
  netScore: number,
  builders: ReturnType<typeof detectMomentumBuilders>,
  blockers: ReturnType<typeof detectMomentumBlockers>,
  input: ReturnType<typeof gatherMomentumInput>,
): MomentumLevel {
  const returning =
    builders.includes("returned_after_absence") &&
    input.weekEvents.length > 0 &&
    blockers.length <= 2;

  if (returning && netScore >= 0 && netScore < 4) return "restarting";
  if (netScore <= -3 || (blockers.length >= 3 && builders.length === 0)) {
    return "stalled";
  }
  if (netScore >= 8 && builders.length >= 3 && blockers.length <= 1) {
    return "strong";
  }
  if (netScore >= 4 || builders.length >= 2) return "building";
  if (netScore >= 0) return "steady";
  return "stalled";
}

export function scoreMomentum(
  partial: MomentumInput = {},
  now = partial.now ?? new Date(),
): MomentumSnapshot {
  const input = gatherMomentumInput({ ...partial, now });
  const builders = detectMomentumBuilders(input);
  const blockers = detectMomentumBlockers(input);
  const wins = collectRecentWins(input, now);
  const netScore = input.positiveScore - input.negativeScore;
  const momentumLevel = inferMomentumLevel(netScore, builders, blockers, input);
  const momentumTrend = inferMomentumTrend(input, netScore);

  const confidence: MomentumConfidence =
    input.weekEvents.length >= 3 || builders.length + blockers.length >= 3
      ? "high"
      : input.weekEvents.length >= 1 || builders.length >= 1
        ? "medium"
        : "low";

  return {
    momentumLevel,
    confidence,
    momentumTrend,
    wins,
    momentumBuilders: builders,
    momentumBlockers: blockers,
    recommendedSupport: recommendedSupportFor(momentumLevel, blockers),
    createdAt: now.toISOString(),
  };
}
