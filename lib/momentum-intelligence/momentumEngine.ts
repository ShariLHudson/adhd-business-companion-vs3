/**
 * Momentum Intelligence — notice progress, not perfection.
 */

import { buildMomentumOffer, momentumAcknowledgeMessage, momentumHintForChat } from "./momentumMessages";
import { scoreMomentum } from "./momentumScoring";
import {
  dismissMomentumOffer,
  isMomentumOfferDismissedToday,
  notifyMomentumUpdated,
  recordMomentumSnapshot,
} from "./momentumStore";
import type { MomentumInput, MomentumOffer, MomentumSnapshot } from "./types";

export function evaluateMomentum(input: MomentumInput = {}): MomentumSnapshot {
  return scoreMomentum(input, input.now ?? new Date());
}

export function evaluateAndRecordMomentum(
  input: MomentumInput = {},
): MomentumSnapshot {
  const snapshot = evaluateMomentum(input);
  recordMomentumSnapshot(snapshot);
  notifyMomentumUpdated();
  return snapshot;
}

export function evaluateMomentumOffer(
  input: MomentumInput = {},
): MomentumOffer | null {
  const now = input.now ?? new Date();
  if (isMomentumOfferDismissedToday(now)) return null;

  const snapshot = evaluateMomentum({ ...input, now });
  const showLevels = new Set(["restarting", "building", "steady"]);
  if (!showLevels.has(snapshot.momentumLevel)) return null;
  if (snapshot.confidence === "low" && snapshot.wins.length === 0) return null;

  const offer = buildMomentumOffer(snapshot);
  if (!offer.companionOffer.trim()) return null;
  return offer;
}

export function shouldSurfaceMomentumOffer(
  offer: MomentumOffer | null,
): boolean {
  return Boolean(offer?.companionOffer.trim());
}

export function acceptMomentumAcknowledge(
  offer: MomentumOffer,
): { message: string } {
  return { message: momentumAcknowledgeMessage(offer) };
}

export { momentumHintForChat, dismissMomentumOffer };
export type { MomentumInput, MomentumOffer, MomentumSnapshot };
