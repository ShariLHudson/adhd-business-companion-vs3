/**
 * Restart recovery — welcome back without guilt.
 */

import type { OpenLoop, RestartRecovery, TinyNextStep } from "./types";
import { simplifyNextStep } from "./nextStep";

export function buildRestartRecovery(input: {
  daysSinceLastActivity: number;
  lastObjectiveSummary?: string;
  lastSparkMessage?: string;
  openLoops?: OpenLoop[];
}): RestartRecovery {
  const whereWeLeftOff =
    input.lastObjectiveSummary?.trim() ||
    input.lastSparkMessage?.slice(0, 120) ||
    input.openLoops?.[0]?.label ||
    "the last thing you were working on";

  const suggestedResume: TinyNextStep = simplifyNextStep({
    message: "",
    objectiveSummary: whereWeLeftOff,
    openLoopLabel: input.openLoops?.[0]?.label,
    primarySignal: "returning_after_absence",
  });

  const days = input.daysSinceLastActivity;
  const welcomeCopy =
    days >= 7
      ? `Welcome back — no catch-up homework. Here's where we left off.`
      : `Welcome back. Here's where we left off.`;

  return {
    welcomeCopy,
    whereWeLeftOff,
    suggestedResume,
    guiltFree: true,
  };
}
