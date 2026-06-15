/**
 * Predictive Support Intelligence — early, gentle prevention.
 */

import { gatherPredictiveSignals } from "./predictiveSignals";
import {
  detectPredictivePatterns,
  pickTopPattern,
  weightToConfidence,
  weightToRiskLevel,
} from "./predictivePatterns";
import {
  buildPredictiveOffer,
  predictiveAcceptMessage,
  predictiveHintForChat,
} from "./predictiveMessages";
import {
  dismissPredictiveOffer,
  isPredictiveOfferDismissedToday,
  notifyPredictiveUpdated,
  recordPredictiveSnapshot,
} from "./predictiveStore";
import type {
  PredictiveSupportInput,
  PredictiveSupportOffer,
  PredictiveSupportSnapshot,
} from "./types";

export function evaluatePredictiveSupport(
  input: PredictiveSupportInput = {},
): PredictiveSupportSnapshot | null {
  const now = input.now ?? new Date();
  const ctx = gatherPredictiveSignals({ ...input, now });
  const top = pickTopPattern(detectPredictivePatterns(ctx));
  if (!top || top.weight < 2) return null;

  const riskLevel = weightToRiskLevel(top.weight);
  const confidence = weightToConfidence(top.sourceSignals.length, top.weight);

  if (riskLevel === "low" && confidence === "low") return null;

  return {
    riskType: top.riskType,
    confidence,
    riskLevel,
    predictedOutcome: top.predictedOutcome,
    recommendedSupport: top.recommendedSupport,
    sourceSignals: top.sourceSignals.length ? top.sourceSignals : ctx.signals.slice(0, 4),
    createdAt: now.toISOString(),
  };
}

export function evaluateAndRecordPredictiveSupport(
  input: PredictiveSupportInput = {},
): PredictiveSupportSnapshot | null {
  const snapshot = evaluatePredictiveSupport(input);
  if (snapshot) {
    recordPredictiveSnapshot(snapshot);
    notifyPredictiveUpdated();
  }
  return snapshot;
}

export function evaluatePredictiveOffer(
  input: PredictiveSupportInput = {},
): PredictiveSupportOffer | null {
  const now = input.now ?? new Date();
  if (isPredictiveOfferDismissedToday(now)) return null;

  const snapshot = evaluatePredictiveSupport({ ...input, now });
  if (!snapshot) return null;
  if (snapshot.riskLevel !== "elevated" && snapshot.riskLevel !== "high") {
    return null;
  }
  if (snapshot.confidence === "low") return null;

  recordPredictiveSnapshot(snapshot);
  notifyPredictiveUpdated();
  return buildPredictiveOffer(snapshot);
}

export function shouldSurfacePredictiveOffer(
  offer: PredictiveSupportOffer | null,
): boolean {
  return Boolean(offer?.companionOffer.trim());
}

export function acceptPredictiveSupport(
  offer: PredictiveSupportOffer,
): { message: string } {
  recordPredictiveSnapshot(offer.snapshot);
  notifyPredictiveUpdated();
  return { message: predictiveAcceptMessage(offer.snapshot) };
}

export {
  predictiveHintForChat,
  dismissPredictiveOffer,
};

export type {
  PredictiveSupportInput,
  PredictiveSupportOffer,
  PredictiveSupportSnapshot,
};
