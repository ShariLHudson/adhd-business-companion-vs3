/**
 * Reflection Intelligence™ — interpret the day silently.
 * @see constitution.ts — performReflection
 */

import { emitLearningSignals } from "./emitLearningSignals";
import { updateCompanionBrain } from "./updateCompanionBrain";
import type {
  JudgmentPatch,
  ReflectionInput,
  ReflectionResult,
} from "./types";

export function performReflection(input: ReflectionInput): ReflectionResult {
  const surprises: string[] = [];
  const patches: JudgmentPatch[] = [];

  if (input.outcomes.userOverrides > 0) {
    surprises.push("User swapped or overrode companion preparation.");
    patches.push({
      target: "permissionJudgment",
      path: "overrideAcceptance",
      delta: 0.02,
      reason: "User agency on high-energy day.",
      signalIds: [],
    });
  }

  if (input.outcomes.userDeclaredSurvival) {
    patches.push({
      target: "confidenceJudgment",
      path: "survivalHonor",
      delta: 0.03,
      reason: "Survival declaration honored.",
      signalIds: [],
    });
  }

  if (
    input.judgment.dayMode === "hyperfocus" ||
    input.memory.sessionFlags?.hyperfocusActive
  ) {
    patches.push({
      target: "timingJudgment",
      path: "hyperfocusNoMissedAnchor",
      delta: 0.02,
      reason: "Do not penalize missed anchor during flow.",
      signalIds: [],
    });
  }

  const signals = emitLearningSignals(input, surprises);
  const brainState = updateCompanionBrain(
    input.memory.brainState,
    input,
    signals,
    patches,
  );

  return {
    dayKey: input.dayKey,
    reflectedAt: new Date().toISOString(),
    surprises,
    judgmentPatches: patches,
    signals,
    brainState,
  };
}
