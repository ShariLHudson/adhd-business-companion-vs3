/**
 * Founder-facing adaptive companion reporting.
 */

import { modeLabel } from "./adaptiveMessages";
import { getAdaptiveStore } from "./adaptiveStore";
import type { CompanionResponseMode, FounderAdaptiveReport } from "./types";

const MS_DAY = 86_400_000;

export function buildFounderAdaptiveReport(
  now = new Date(),
): FounderAdaptiveReport {
  const store = getAdaptiveStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const sincePrior7d = now.getTime() - 14 * MS_DAY;

  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const prior = store.founderSamples.filter((s) => {
    const t = new Date(s.at).getTime();
    return t >= sincePrior7d && t < since7d;
  });

  const modeCounts = new Map<CompanionResponseMode, number>();
  for (const s of recent) {
    const m = s.mode as CompanionResponseMode;
    modeCounts.set(m, (modeCounts.get(m) ?? 0) + 1);
  }

  const commonModes = [...modeCounts.entries()]
    .map(([mode, count]) => ({
      mode,
      label: modeLabel(mode),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const supportModes = new Set<CompanionResponseMode>([
    "support",
    "sorting",
    "reflection",
  ]);
  const actionModes = new Set<CompanionResponseMode>([
    "activation",
    "planning",
    "focus",
  ]);

  let support = 0;
  let action = 0;
  let celebrate = 0;
  let reflect = 0;
  for (const [mode, count] of modeCounts) {
    if (supportModes.has(mode)) support += count;
    if (actionModes.has(mode)) action += count;
    if (mode === "celebration") celebrate += count;
    if (mode === "reflection") reflect += count;
  }

  const top = commonModes[0]?.mode;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    commonModes,
    modeTrend:
      recent.length >= prior.length + 3
        ? "rising"
        : recent.length <= prior.length - 3
          ? "easing"
          : "stable",
    stateDistribution: { support, action, celebrate, reflect },
    recommendedImprovement: improvementFor(top),
    notes:
      "Local preview — mode distribution helps tune companion tone, not surveil users.",
  };
}

function improvementFor(mode: CompanionResponseMode | undefined): string {
  switch (mode) {
    case "support":
      return "Support mode is common — audit copy for calming-first, no productivity nudges when load is high.";
    case "activation":
      return "Activation mode is frequent — ensure tiny-step offers stay primary over full plans.";
    case "sorting":
      return "Sorting mode is high — promote park/wait workflows before new creation.";
    case "planning":
      return "Planning requests are common — keep day designer optional and light.";
    case "celebration":
      return "Celebration mode is active — recognition intelligence is landing well.";
    case "reflection":
      return "Reflection mode is rising — keep loop language non-labeling and optional.";
    case "focus":
      return "Focus mode is common — reduce re-planning interruptions in chat.";
    default:
      return "Monitor mode mix — prioritize well-being over engagement metrics.";
  }
}
