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
import {
  userExpressedExplicitBlocker,
} from "@/lib/conversationIntervention";
import {
  isGenuineEmotionalDistress,
  shouldDeferToolCardOnFirstDistress,
  shouldRunEmotionalTriage,
  userExplicitlyRequestedInterventionHelp,
} from "@/lib/messageClassification";
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

  const textGrounded = hasTextGroundedBlocker(hits, text);
  const showOffer =
    textGrounded &&
    (state === "stuck" ||
      state === "frozen" ||
      (state === "hesitant" && shouldEvaluateActivation(text))) &&
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

/** Context-only signals must not surface cards without user-stated stuck/confusion. */
const CONTEXT_ONLY_SIGNALS = new Set([
  "high cognitive load",
  "stuck emotional state",
  "emotional distress tone",
  "low energy check-in",
  "missing next action on project",
  "many open captures",
  "repeated task avoidance",
]);

function hasTextGroundedBlocker(
  hits: ReturnType<typeof detectActivationSignals>,
  text: string,
): boolean {
  if (shouldEvaluateActivation(text)) return true;
  return hits.some(
    (h) => !CONTEXT_ONLY_SIGNALS.has(h.signal) && h.weight >= 3,
  );
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
  userText?: string,
  messages?: { role: string; content: string }[],
): boolean {
  if (!snapshot.companionOffer.trim()) return false;
  const t = userText?.trim();
  if (!t) return false;
  if (userExplicitlyRequestedInterventionHelp(t)) return true;
  if (userExpressedExplicitBlocker(t)) return true;
  if (isGenuineEmotionalDistress(t) || shouldRunEmotionalTriage(t)) {
    return false;
  }
  if (messages?.length && shouldDeferToolCardOnFirstDistress(messages, t)) {
    return false;
  }
  return true;
}
