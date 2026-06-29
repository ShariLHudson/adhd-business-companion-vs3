/**
 * Decision Intelligence — reduce decision fatigue without deciding for the user.
 * Experience rules: docs/DECISION_EXPERIENCE_FRAMEWORK.md (T-008)
 */

import { getDayState } from "@/lib/companionStore";
import { scoreDecision } from "./decisionScoring";
import {
  buildDecisionOffer,
  decisionHintForChat,
  narrowPrompt,
  parkPrompt,
} from "./decisionMessages";
import { shouldEvaluateDecision } from "./decisionSignals";
import {
  dismissDecisionOffer,
  isDecisionOfferDismissedToday,
  notifyDecisionUpdated,
  parkDecision,
  recordDecisionResolved,
  recordDecisionSnapshot,
} from "./decisionStore";
import type { DecisionInput, DecisionOffer, DecisionSnapshot } from "./types";

export function gatherDecisionInput(
  partial: DecisionInput = {},
): DecisionInput {
  const day = getDayState();
  return {
    ...partial,
    dayEnergyLow: partial.dayEnergyLow ?? day?.energy === "low",
    hasDayPlan: partial.hasDayPlan ?? false,
  };
}

export function evaluateDecision(
  partial: DecisionInput = {},
): DecisionSnapshot {
  const input = gatherDecisionInput(partial);
  return scoreDecision(input, input.now ?? new Date());
}

export function evaluateAndRecordDecision(
  partial: DecisionInput = {},
): DecisionSnapshot {
  const snapshot = evaluateDecision(partial);
  if (snapshot.decisionState !== "clear") {
    recordDecisionSnapshot(snapshot);
    notifyDecisionUpdated();
  }
  return snapshot;
}

export function evaluateDecisionOffer(
  partial: DecisionInput = {},
): DecisionOffer | null {
  const now = partial.now ?? new Date();
  if (isDecisionOfferDismissedToday(now)) return null;

  const snapshot = evaluateDecision({ ...partial, now });
  if (
    snapshot.decisionState === "clear" ||
    snapshot.decisionState === "decided"
  ) {
    return null;
  }
  if (!shouldEvaluateDecision(partial.text ?? "")) return null;

  return buildDecisionOffer(snapshot);
}

export function shouldSurfaceDecisionOffer(
  offer: DecisionOffer | null,
): boolean {
  return Boolean(
    offer &&
      offer.companionOffer.trim() &&
      offer.snapshot.decisionState !== "clear",
  );
}

export function acceptDecisionNarrow(offer: DecisionOffer): { message: string } {
  recordDecisionSnapshot(offer.snapshot);
  notifyDecisionUpdated();
  return { message: narrowPrompt(offer.snapshot) };
}

export function acceptDecisionPark(offer: DecisionOffer): { message: string } {
  parkDecision(
    offer.snapshot.suggestedNextStep,
    offer.snapshot.decisionType,
  );
  notifyDecisionUpdated();
  return { message: parkPrompt(offer.snapshot) };
}

export function markDecisionResolved(): void {
  recordDecisionResolved();
  notifyDecisionUpdated();
}

export {
  decisionHintForChat,
  dismissDecisionOffer,
};

export type { DecisionInput, DecisionOffer, DecisionSnapshot };
