/**
 * Future Shari Intelligence — connect today with tomorrow, gently.
 */

import { frictionFromSnapshot } from "./futureInsights";
import {
  buildFutureShariOffer,
  futureHintForChat,
  futureTellMeMessage,
} from "./futureMessages";
import {
  confidenceFromWeight,
  detectFutureCandidates,
  gatherFutureInput,
  integrationCandidates,
  pickFutureCandidate,
} from "./futureSignals";
import {
  dismissFutureOffer,
  isFutureOfferDismissedToday,
  notifyFutureShariUpdated,
  recordFutureAccepted,
  recordFutureSnapshot,
} from "./futureStore";
import type {
  FutureShariInput,
  FutureShariOffer,
  FutureShariSnapshot,
} from "./types";

export function evaluateFutureShari(
  partial: FutureShariInput = {},
): FutureShariSnapshot | null {
  const now = partial.now ?? new Date();
  const input = gatherFutureInput(partial);
  const text = input.text?.trim() ?? "";
  const candidates = [
    ...detectFutureCandidates(text),
    ...integrationCandidates(input),
  ];
  const top = pickFutureCandidate(candidates);
  if (!top) return null;

  return {
    opportunity: top.opportunity,
    confidence: confidenceFromWeight(top.weight),
    futureBenefit: top.futureBenefit,
    futureCost: top.futureCost,
    timeframe: top.timeframe,
    suggestedAction: top.suggestedAction,
    futureMessage: top.futureMessage,
    createdAt: now.toISOString(),
  };
}

export function evaluateFutureShariOffer(
  partial: FutureShariInput = {},
): FutureShariOffer | null {
  const now = partial.now ?? new Date();
  if (isFutureOfferDismissedToday(now)) return null;

  const snapshot = evaluateFutureShari({ ...partial, now });
  if (!snapshot || snapshot.confidence === "low") return null;

  if (
    partial.recoveryLevel === "burnout_risk" &&
    snapshot.opportunity !== "recovery"
  ) {
    return null;
  }

  recordFutureSnapshot(
    snapshot,
    integrationCandidates(gatherFutureInput(partial)).find(
      (c) => c.opportunity === snapshot.opportunity,
    )?.frictionPoint ?? frictionFromSnapshot(snapshot),
  );
  notifyFutureShariUpdated();
  return buildFutureShariOffer(snapshot);
}

export function shouldSurfaceFutureOffer(
  offer: FutureShariOffer | null,
): boolean {
  return Boolean(offer?.introLine.trim());
}

export function acceptFutureShari(offer: FutureShariOffer): { message: string } {
  recordFutureAccepted(offer.snapshot);
  notifyFutureShariUpdated();
  return { message: futureTellMeMessage(offer) };
}

export {
  futureHintForChat,
  dismissFutureOffer,
};

export type { FutureShariInput, FutureShariOffer, FutureShariSnapshot };
