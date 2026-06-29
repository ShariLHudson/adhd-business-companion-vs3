/**
 * Gentle effort estimates — grounded, never pressure-based.
 */

import type { EffortEstimate } from "./types";

const PHRASES: Record<number, string> = {
  2: "This may only take a couple of minutes.",
  3: "This may only take about three minutes.",
  5: "This may only take about five minutes.",
  10: "This might be a ten-minute stretch — we can pause after.",
  15: "Set aside about fifteen minutes if you have it — no rush.",
};

export function estimateEffort(
  kind: "reflect" | "decide" | "write" | "plan" | "task",
  minutes: number,
): EffortEstimate {
  const rounded = minutes <= 2 ? 2 : minutes <= 3 ? 3 : minutes <= 5 ? 5 : minutes <= 10 ? 10 : 15;
  return {
    minutes: rounded,
    phrase: PHRASES[rounded] ?? `This may only take about ${rounded} minutes.`,
    gentle: true,
  };
}
