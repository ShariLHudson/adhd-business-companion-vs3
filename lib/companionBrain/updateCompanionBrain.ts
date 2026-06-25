/**
 * Update Companion Brain™ — judgment only, never user goals.
 * @see constitution.ts — updateCompanionBrain
 */

import { applyBoundedPatch, setCooldown } from "./store";
import type {
  CompanionBrainState,
  JudgmentPatch,
  LearningSignal,
  ReflectionInput,
} from "./types";

const MAX_PATCHES_PER_DAY = 3;

export function updateCompanionBrain(
  state: CompanionBrainState,
  input: ReflectionInput,
  signals: LearningSignal[],
  patches: JudgmentPatch[],
): CompanionBrainState {
  let next: CompanionBrainState = {
    ...state,
    lastReflectedDayKey: input.dayKey,
    updatedAt: new Date().toISOString(),
  };

  const bounded = patches.slice(0, MAX_PATCHES_PER_DAY);
  for (const patch of bounded) {
    if (patch.target === "timingJudgment") {
      next.timingJudgment = applyBoundedPatch(
        next.timingJudgment,
        patch.path,
        patch.delta,
      );
    } else if (patch.target === "permissionJudgment") {
      next.permissionJudgment = applyBoundedPatch(
        next.permissionJudgment,
        patch.path,
        patch.delta,
      );
    } else if (patch.target === "confidenceJudgment") {
      next.confidenceJudgment = applyBoundedPatch(
        next.confidenceJudgment,
        patch.path,
        patch.delta,
      );
    } else if (patch.target === "momentumJudgment") {
      next.momentumJudgment = applyBoundedPatch(
        next.momentumJudgment,
        patch.path,
        patch.delta,
      );
    }
  }

  const momentumSuccess = signals.some((s) => s.kind === "momentum-success");
  const permissionNeutral = signals.some((s) => s.kind === "permission-accuracy");

  next.calibration = {
    ...next.calibration,
    momentumSuccessEwma: momentumSuccess
      ? Math.min(1, next.calibration.momentumSuccessEwma + 0.05)
      : next.calibration.momentumSuccessEwma,
    permissionAccuracyEwma: permissionNeutral
      ? Math.max(0, next.calibration.permissionAccuracyEwma - 0.02)
      : next.calibration.permissionAccuracyEwma,
  };

  if (input.judgment.dayMode === "celebration") {
    next = setCooldown(next, "celebration", input.dayKey);
  }
  if (
    input.judgment.dayMode === "survival" ||
    input.judgment.dayMode === "recovery"
  ) {
    next = setCooldown(next, "survival", input.dayKey);
  }

  return next;
}
