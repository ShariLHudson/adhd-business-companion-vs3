/**
 * Founder-facing environment reporting.
 */

import { adjustmentLabel } from "./environmentInsights";
import { getEnvironmentStore } from "./environmentStore";
import type { EnvironmentAdjustment, FounderEnvironmentReport } from "./types";

const MS_DAY = 86_400_000;

const FRICTION_LABELS: Record<string, string> = {
  noise: "Noise",
  clutter: "Clutter",
  interruptions: "Interruptions",
  too_many_tabs: "Too many tabs",
  sensory_overload: "Sensory overload",
  working_from_bed: "Working from bed",
  messy_desk: "Messy desk",
};

export function buildFounderEnvironmentReport(
  now = new Date(),
): FounderEnvironmentReport {
  const store = getEnvironmentStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const frictionCounts = new Map<string, number>();
  let sensoryOverloadCount = 0;
  let poorFocusCount = 0;
  let improvingFocus = 0;

  for (const s of recent) {
    frictionCounts.set(
      s.frictionId,
      (frictionCounts.get(s.frictionId) ?? 0) + 1,
    );
    if (s.sensoryLoad === "overwhelming" || s.sensoryLoad === "high") {
      sensoryOverloadCount += 1;
    }
    if (s.focusFit === "poor") poorFocusCount += 1;
    if (s.focusFit === "good" || s.focusFit === "excellent") improvingFocus += 1;
  }

  const frictionPoints = [...frictionCounts.entries()]
    .map(([id, count]) => ({
      id,
      label: FRICTION_LABELS[id] ?? adjustmentLabel(id as EnvironmentAdjustment),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const helpfulAdjustments = Object.entries(store.helpfulAdjustments)
    .map(([adjustment, count]) => ({
      adjustment: adjustment as EnvironmentAdjustment,
      label: adjustmentLabel(adjustment as EnvironmentAdjustment),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const focusFitTrend: FounderEnvironmentReport["focusFitTrend"] =
    poorFocusCount > improvingFocus
      ? "worsening"
      : improvingFocus > poorFocusCount
        ? "improving"
        : "stable";

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    frictionPoints,
    sensoryOverloadCount,
    focusFitTrend,
    helpfulAdjustments,
    recommendedFounderAction: founderActionFor(frictionPoints[0]?.id),
    notes:
      "Local preview — tiny environment wins, never shame about clutter.",
  };
}

function founderActionFor(frictionId: string | undefined): string {
  switch (frictionId) {
    case "too_many_tabs":
      return "Promote one-tab / one-surface focus in environment offers.";
    case "sensory_overload":
    case "noise":
      return "Headphones and sensory breaks are high-value — surface early.";
    case "working_from_bed":
      return "Gentle location nudges when working from bed is detected.";
    case "messy_desk":
    case "clear_one_surface":
      return "One-surface clears beat whole-room messaging.";
    default:
      return "Keep environment suggestions optional and tiny.";
  }
}
