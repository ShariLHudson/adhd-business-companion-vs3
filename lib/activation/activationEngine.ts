/**
 * Activation Intelligence — smallest supportive next step, not motivation pressure.
 */

import {
  getBrainDumps,
  getDayState,
  getProjects,
  type Project,
} from "@/lib/companionStore";
import type { EmotionalState } from "@/lib/companionEmotions";
import { evaluateCognitiveLoad, gatherCognitiveLoadInput } from "@/lib/cognitive-load";
import { userIntelligenceEngine } from "@/lib/ecosystem/userIntelligenceEngine";
import { detectActivationSignals, shouldEvaluateActivation } from "./activationSignals";
import {
  overallConfidence,
  pickPrimaryBlocker,
  rankLikelyBlockers,
} from "./activationPatterns";
import {
  buildActivationGuidance,
  inferActivationState,
} from "./activationMessages";
import {
  isActivationOfferDismissedToday,
  notifyActivationUpdated,
  recordActivationSnapshot,
} from "./activationStore";
import type { ActivationInput, ActivationSnapshot } from "./types";

export function gatherActivationInput(
  partial: ActivationInput = {},
): ActivationInput {
  const projects = getProjects();
  const day = partial.dayState ?? getDayState();
  const load =
    partial.cognitiveLoadLevel != null
      ? null
      : evaluateCognitiveLoad(
          gatherCognitiveLoadInput({
            now: partial.now,
            emotionalState: partial.emotionalState as EmotionalState | undefined,
            dayState: day,
            recentText: partial.text,
          }),
        );

  return {
    ...partial,
    projectsMissingNextAction:
      partial.projectsMissingNextAction ??
      projects.filter(
        (p: Project) =>
          p.status !== "completed" &&
          p.horizon === "now" &&
          !p.nextAction?.trim(),
      ).length,
    openBrainDumpCount:
      partial.openBrainDumpCount ??
      getBrainDumps().filter((e) => !e.done).length,
    dayEnergyLow: partial.dayEnergyLow ?? day?.energy === "low",
    cognitiveLoadLevel:
      partial.cognitiveLoadLevel ?? load?.score.level ?? null,
    cognitiveLoadScore:
      partial.cognitiveLoadScore ?? load?.score.value ?? null,
    signalCounts:
      partial.signalCounts ?? userIntelligenceEngine.getCounts(),
  };
}

/** Evaluate activation from signals — explainable blockers, small next step. */
export function evaluateActivation(
  partial: ActivationInput = {},
): ActivationSnapshot {
  const now = partial.now ?? new Date();
  const input = gatherActivationInput({ ...partial, now });
  const text = input.text ?? "";
  const hits = detectActivationSignals(input);
  const likelyBlockers = rankLikelyBlockers(hits);
  const primary = pickPrimaryBlocker(likelyBlockers);
  const state = inferActivationState(
    likelyBlockers,
    text,
    input.cognitiveLoadLevel,
  );
  const rotationKey = `${primary?.type ?? "none"}:${dayKey(now)}`;
  const guidance = buildActivationGuidance(
    primary,
    state,
    input.cognitiveLoadLevel,
    rotationKey,
    input.dayEnergyLow,
  );

  const showOffer =
    (state === "stuck" || state === "frozen" || state === "hesitant") &&
    (shouldEvaluateActivation(text) || likelyBlockers.length > 0) &&
    !isActivationOfferDismissedToday(now);

  return {
    state,
    likelyBlockers,
    confidence: overallConfidence(likelyBlockers),
    suggestedNextStep: guidance.suggestedNextStep,
    companionOffer: showOffer ? guidance.companionOffer : "",
    createdAt: now.toISOString(),
  };
}

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Evaluate and persist snapshot for founder reporting. */
export function evaluateAndRecordActivation(
  partial: ActivationInput = {},
): ActivationSnapshot {
  const snapshot = evaluateActivation(partial);
  if (snapshot.state !== "moving") {
    recordActivationSnapshot(snapshot);
    notifyActivationUpdated();
  }
  return snapshot;
}

/** Whether companion should surface the activation offer for this message. */
export function shouldSurfaceActivationOffer(
  snapshot: ActivationSnapshot,
): boolean {
  return Boolean(snapshot.companionOffer.trim());
}
