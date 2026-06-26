/**
 * Live adaptation copy — judgment explained, never software behavior.
 */

import type { CompanionJudgmentResult, DayMode } from "@/lib/companionBrain";
import type { RealitySignal } from "./types";

const HEAVY_DAY_MODES = new Set<DayMode>(["survival", "recovery", "health"]);

function isHeavyDayMode(mode: DayMode): boolean {
  return HEAVY_DAY_MODES.has(mode);
}

export function formatAdaptationMessage(
  judgment: CompanionJudgmentResult,
  signal: RealitySignal,
  previous: CompanionJudgmentResult | null | undefined,
): string {
  const prevMode = previous?.dayMode;

  if (judgment.dayMode === "survival" || judgment.dayMode === "recovery") {
    if (prevMode === "normal" || prevMode === "creative") {
      return "I think today needs a little more breathing room.";
    }
    return "Given how today has changed, I think this is the better path.";
  }

  if (judgment.dayMode === "health") {
    return "Health leads today — I've moved a few things so you don't have to.";
  }

  if (judgment.dayMode === "family") {
    return "Family comes first today. I've simplified what else is asking for attention.";
  }

  if (judgment.permission.summaryCount > (previous?.permission.summaryCount ?? 0)) {
    return "I've protected tomorrow by simplifying today.";
  }

  if (judgment.dayMode === "celebration") {
    return "Today still deserves to be the win — nothing else is required.";
  }

  if (signal.source === "todays-reality") {
    if (isHeavyDayMode(judgment.dayMode)) {
      return "Today feels heavier — I'm carrying what doesn't need your energy right now.";
    }
    return "Given how today has changed, I reshaped what deserves your attention — nothing was deleted.";
  }

  if (judgment.momentum.label && judgment.momentum.label !== previous?.momentum.label) {
    return `If one thing still fits: ${judgment.momentum.label}.`;
  }

  return "I've adjusted today's picture to match where you actually are.";
}
