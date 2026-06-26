/**
 * Detect when re-evaluation should surface companion adaptation — not noise.
 */

import type { CompanionJudgmentResult } from "@/lib/companionBrain";
import type { RealitySignal } from "./types";

const DAY_MODE_ORDER: CompanionJudgmentResult["dayMode"][] = [
  "celebration",
  "hyperfocus",
  "normal",
  "creative",
  "family",
  "health",
  "recovery",
  "survival",
];

function modeIndex(mode: CompanionJudgmentResult["dayMode"]): number {
  const i = DAY_MODE_ORDER.indexOf(mode);
  return i >= 0 ? i : 3;
}

export function detectMeaningfulShift(
  previous: CompanionJudgmentResult | null | undefined,
  next: CompanionJudgmentResult,
  signal: RealitySignal,
): boolean {
  if (!previous) return false;

  if (previous.dayMode !== next.dayMode) return true;

  if (
    signal.source === "todays-reality" ||
    signal.kind === "day-state"
  ) {
    const prevIdx = modeIndex(previous.dayMode);
    const nextIdx = modeIndex(next.dayMode);
    if (nextIdx > prevIdx + 1) return true;
  }

  const prevProposalCount = previous.proposals.length;
  const nextProposalCount = next.proposals.length;
  if (Math.abs(prevProposalCount - nextProposalCount) >= 2) return true;

  const prevMomentum = previous.momentum.label?.trim().toLowerCase() ?? "";
  const nextMomentum = next.momentum.label?.trim().toLowerCase() ?? "";
  if (prevMomentum && nextMomentum && prevMomentum !== nextMomentum) return true;

  if (
    (previous.dayMode === "survival" || previous.dayMode === "recovery") !==
    (next.dayMode === "survival" || next.dayMode === "recovery")
  ) {
    return true;
  }

  if (previous.permission.summaryCount !== next.permission.summaryCount) {
    return true;
  }

  return false;
}
