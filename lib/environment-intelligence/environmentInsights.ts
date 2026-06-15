/**
 * Explainable environment insights and adjustment labels.
 */

import type { EnvironmentAdjustment, EnvironmentSnapshot } from "./types";

const ADJUSTMENT_LABELS: Record<EnvironmentAdjustment, string> = {
  close_extra_tabs: "Close extra tabs",
  move_one_distraction: "Move one distracting item",
  put_phone_away: "Put phone away",
  use_headphones: "Use headphones",
  lower_noise: "Lower noise",
  change_location: "Change location",
  clear_one_surface: "Clear one small surface",
  focus_audio: "Use focus audio",
  sensory_break: "Take a sensory recovery break",
  better_fit_location: "Try a better-fit environment",
};

export function adjustmentLabel(adj: EnvironmentAdjustment): string {
  return ADJUSTMENT_LABELS[adj];
}

export function explainEnvironment(snapshot: EnvironmentSnapshot): string {
  return [
    `Type: ${snapshot.environmentType}`,
    `Sensory: ${snapshot.sensoryLoad}`,
    `Interruptions: ${snapshot.interruptionLevel}`,
    `Clutter: ${snapshot.clutterLevel}`,
    `Focus fit: ${snapshot.focusFit}`,
    `Suggested: ${adjustmentLabel(snapshot.recommendedAdjustment)}`,
  ].join(" · ");
}

export function environmentTipForPlan(
  snapshot: EnvironmentSnapshot | null,
): string | null {
  if (!snapshot) return null;
  if (snapshot.focusFit === "poor" || snapshot.sensoryLoad === "high") {
    return `Environment note: ${adjustmentLabel(snapshot.recommendedAdjustment)} before deep work.`;
  }
  return null;
}
