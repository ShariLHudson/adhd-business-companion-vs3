// Founder Ecosystem — Phase 13 Founder Support Score (INTERNAL ONLY).
// A private health read used to tune how Shari shows up — engagement, momentum,
// capacity, progress, consistency. NEVER surfaced to the founder as a grade.
// Pure.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderOperatingState } from "../fos/founderOperatingState";
import type { FounderSupportScore } from "./companionTypes";

const DAY = 86_400_000;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export type SupportScoreOptions = { now?: Date; intel?: FounderIntelligence };

export function computeFounderSupportScore(
  events: FounderEvent[],
  founderId: ID,
  opts: SupportScoreOptions = {},
): FounderSupportScore {
  const now = opts.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);
  const os = getFounderOperatingState(mine, founderId, { now, intel: opts.intel });

  // Engagement — activity volume over the last 14 days.
  const since = now.getTime() - 14 * DAY;
  const recent = mine.filter((e) => new Date(e.ts).getTime() > since);
  const engagement = clamp(recent.length * 4);

  // Momentum & capacity come straight from the operating state.
  const momentum = clamp(os.momentum.score);
  const capacity = clamp(os.capacity.score);

  // Progress — average project completion + wins this period.
  const progresses = os.projectHealth
    .map((p) => p.progress)
    .filter((p): p is number => p !== null);
  const avgProgress = progresses.length
    ? progresses.reduce((a, b) => a + b, 0) / progresses.length
    : 0;
  const progress = clamp(avgProgress * 70 + os.momentum.wins * 6);

  // Consistency — distinct active days over the last 14.
  const activeDays = new Set(
    recent.map((e) => e.ts.slice(0, 10)),
  ).size;
  const consistency = clamp((activeDays / 14) * 100);

  const overall = clamp(
    engagement * 0.2 +
      momentum * 0.25 +
      capacity * 0.2 +
      progress * 0.2 +
      consistency * 0.15,
  );

  return {
    engagement,
    momentum,
    capacity,
    progress,
    consistency,
    overall,
    internalOnly: true,
  };
}

/** Internal tuning hint derived from the score — not a grade for the founder. */
export function supportPosture(
  score: FounderSupportScore,
): "protect-capacity" | "build-momentum" | "sustain" {
  if (score.capacity < 40) return "protect-capacity";
  if (score.momentum < 40) return "build-momentum";
  return "sustain";
}
