/**
 * Learning Signals™ — internal graph feed, not dashboards.
 * @see constitution.ts — emitLearningSignals
 */

import type { LearningSignal, LearningSignalKind, ReflectionInput } from "./types";

function uid(): string {
  return `ls-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emitLearningSignals(
  input: ReflectionInput,
  surprises: string[],
): LearningSignal[] {
  const signals: LearningSignal[] = [];
  const { dayKey, outcomes, judgment } = input;
  const at = new Date().toISOString();

  const push = (
    kind: LearningSignalKind,
    direction: LearningSignal["direction"],
    magnitude: LearningSignal["magnitude"],
    summary: string,
  ) => {
    signals.push({ id: uid(), kind, dayKey, at, direction, magnitude, summary });
  };

  if (outcomes.momentumCompleted) {
    push("momentum-success", "positive", 2, "Momentum anchor created forward motion.");
  }

  if (outcomes.userOverrides > 0) {
    push("permission-accuracy", "neutral", 1, "User override — calibrate permission.");
  }

  if (outcomes.userDeclaredSurvival) {
    push("confidence-growth", "positive", 2, "Honest boundary — self-trust signal.");
  }

  if (outcomes.proposalsConfirmed > 0 && outcomes.proposalsOffered > 0) {
    const ratio = outcomes.proposalsConfirmed / outcomes.proposalsOffered;
    push(
      "decision-confidence",
      ratio >= 0.5 ? "positive" : "neutral",
      1,
      `Confirmation ratio ${ratio.toFixed(2)}.`,
    );
  }

  if (surprises.length > 0) {
    push("prediction-accuracy", "neutral", 1, `Surprises: ${surprises.length}`);
  }

  if (judgment.dayMode === "recovery" || judgment.dayMode === "survival") {
    push("recovery-speed", "positive", 1, "Recovery or survival day honored.");
  }

  return signals.slice(0, 12);
}
