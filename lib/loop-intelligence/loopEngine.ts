/**
 * Loop Intelligence — recurring patterns with awareness, not diagnosis.
 */

import {
  contextualLoopSignals,
  intelligenceLoopSignals,
  observationsFromText,
} from "./loopSignals";
import { userIntelligenceEngine } from "@/lib/ecosystem/userIntelligenceEngine";
import {
  buildLoopSnapshot,
  detectLoopCandidates,
  pickPrimaryLoop,
} from "./loopDetection";
import {
  dismissLoopOffer,
  getLoopObservations,
  isLoopOfferDismissedToday,
  isLoopTypeDismissedToday,
  notifyLoopUpdated,
  recordLoopObservations,
  recordLoopSnapshot,
} from "./loopStore";
import type { LoopInput, LoopSnapshot } from "./types";

export function observeLoopSignalsFromInput(
  input: LoopInput = {},
): void {
  const now = input.now ?? new Date();
  const enriched: LoopInput = {
    ...input,
    now,
    signalCounts: input.signalCounts ?? userIntelligenceEngine.getCounts(),
  };
  const textObs = enriched.text?.trim()
    ? observationsFromText(enriched.text, now)
    : [];
  const contextObs = contextualLoopSignals(enriched);
  const intelligenceObs = intelligenceLoopSignals(enriched);
  const merged = [...textObs, ...contextObs, ...intelligenceObs];
  if (merged.length) recordLoopObservations(merged);
}

/** Evaluate loops from stored observations — never from a single message alone. */
export function evaluateLoopIntelligence(
  input: LoopInput = {},
): LoopSnapshot | null {
  const now = input.now ?? new Date();
  if (isLoopOfferDismissedToday(now)) return null;

  const candidates = detectLoopCandidates(getLoopObservations(), now);
  const primary = pickPrimaryLoop(candidates);
  if (!primary) return null;
  if (isLoopTypeDismissedToday(primary.loopType, now)) return null;

  return buildLoopSnapshot(primary, now, {
    cognitiveLoadLevel: input.cognitiveLoadLevel,
    activationState: input.activationState,
  });
}

export function evaluateAndRecordLoopIntelligence(
  input: LoopInput = {},
): LoopSnapshot | null {
  observeLoopSignalsFromInput(input);
  const snapshot = evaluateLoopIntelligence(input);
  if (snapshot) {
    recordLoopSnapshot(snapshot);
    notifyLoopUpdated();
  }
  return snapshot;
}

export function shouldSurfaceLoopOffer(
  snapshot: LoopSnapshot | null,
): boolean {
  return Boolean(snapshot?.companionResponse.trim());
}

export { dismissLoopOffer };
