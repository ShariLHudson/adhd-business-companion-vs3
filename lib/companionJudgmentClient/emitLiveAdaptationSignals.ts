/**
 * Founder Intelligence™ feed — life changed, not plans failed.
 */

import type { LearningSignal, LearningSignalKind } from "@/lib/companionBrain";
import type { CompanionJudgmentResult } from "@/lib/companionBrain";
import type { RealitySignal } from "./types";

function uid(): string {
  return `las-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emitLiveAdaptationSignals(input: {
  dayKey: string;
  signal: RealitySignal;
  judgment: CompanionJudgmentResult;
  previousDayMode: CompanionJudgmentResult["dayMode"] | null;
}): LearningSignal[] {
  const { dayKey, signal, judgment, previousDayMode } = input;
  const at = new Date().toISOString();
  const signals: LearningSignal[] = [];

  const push = (
    kind: LearningSignalKind,
    summary: string,
    direction: LearningSignal["direction"] = "neutral",
  ) => {
    signals.push({
      id: uid(),
      kind,
      dayKey,
      at,
      direction,
      magnitude: 1,
      summary,
    });
  };

  if (previousDayMode && previousDayMode !== judgment.dayMode) {
    push(
      "prediction-accuracy",
      `Reality shift: ${previousDayMode} → ${judgment.dayMode} (${signal.source}).`,
    );
  }

  if (judgment.dayMode === "recovery" || judgment.dayMode === "survival") {
    push("recovery-speed", "Live adaptation honored reduced capacity.", "positive");
  }

  if (signal.source === "todays-reality") {
    push(
      "planning-confidence",
      "Today's Reality updated — judgment re-evaluated without manual replan.",
      "positive",
    );
  }

  if (judgment.permission.summaryCount > 0) {
    push("overwhelm-reduction", "Permission exclusions adjusted after reality change.");
  }

  return signals.slice(0, 8);
}
