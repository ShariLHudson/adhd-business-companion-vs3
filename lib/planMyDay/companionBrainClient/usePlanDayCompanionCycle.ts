"use client";

import { useLiveCompanionJudgment } from "@/lib/companionJudgmentClient/useLiveCompanionJudgment";
import type { ReasoningCycleResult } from "@/lib/companionBrain";
import { presentPlanDayOrientation } from "./presentJudgment";
import { readPlanDaySession } from "./planDaySession";
import type { PlanDayOrientationPresentation } from "./presentJudgment";

export type PlanDayCompanionPresentation = {
  dayKey: string;
  cycle: ReasoningCycleResult;
  orientation: PlanDayOrientationPresentation;
  sessionPhase: "orienting" | "flexible" | "living";
  liveAdaptation: string | null;
  meaningfulShift: boolean;
  judgmentRevision: number;
  lastSignal: import("@/lib/companionJudgmentClient/types").RealitySignal | null;
};

/**
 * Plan My Day consumes Live Reality judgment — re-evaluates when reality changes.
 * UI never reasons.
 */
export function usePlanDayCompanionCycle(): PlanDayCompanionPresentation {
  const live = useLiveCompanionJudgment();
  const session = readPlanDaySession(live.dayKey);
  const orientation = presentPlanDayOrientation(live.cycle.judgment);

  return {
    dayKey: live.dayKey,
    cycle: live.cycle,
    orientation,
    sessionPhase: session.phase,
    liveAdaptation: live.adaptationMessage,
    meaningfulShift: live.meaningfulShift,
    judgmentRevision: live.revision,
    lastSignal: live.lastSignal ?? null,
  };
}
