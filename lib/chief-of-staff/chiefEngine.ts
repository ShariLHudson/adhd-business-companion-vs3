/**
 * Chief of Staff Intelligence — orchestration.
 */

import { gatherChiefSignals, shouldEvaluateChiefPerspective } from "./chiefSignals";
import { buildChiefSnapshot } from "./chiefPriorities";
import { buildChiefRecommendations } from "./chiefRecommendations";
import {
  buildChiefOffer,
  chiefHintForChat,
  chiefTellMeMessage,
} from "./chiefMessages";
import {
  dismissChiefOffer,
  isChiefOfferDismissedToday,
  notifyChiefUpdated,
  recordChiefSnapshot,
} from "./chiefStore";
import type {
  ChiefOfStaffInput,
  ChiefOfStaffOffer,
  ChiefOfStaffSnapshot,
} from "./types";

export function evaluateChiefOfStaff(
  input: ChiefOfStaffInput = {},
): ChiefOfStaffSnapshot {
  const context = gatherChiefSignals(input);
  const snapshot = buildChiefSnapshot(context);
  snapshot.recommendedActions = buildChiefRecommendations(context);
  return snapshot;
}

export function evaluateAndRecordChiefOfStaff(
  input: ChiefOfStaffInput = {},
): ChiefOfStaffSnapshot {
  const snapshot = evaluateChiefOfStaff(input);
  recordChiefSnapshot(snapshot);
  notifyChiefUpdated();
  return snapshot;
}

export function evaluateChiefOffer(
  input: ChiefOfStaffInput = {},
): ChiefOfStaffOffer | null {
  const now = input.now ?? new Date();
  if (isChiefOfferDismissedToday(now)) return null;

  const snapshot = evaluateChiefOfStaff({ ...input, now });
  const stretched = ["stretched", "overloaded", "critical"].includes(
    snapshot.overallAssessment,
  );
  const textTriggered = input.text
    ? shouldEvaluateChiefPerspective(input.text)
    : false;

  if (!stretched && !textTriggered) return null;
  if (snapshot.recommendedActions.length === 0 && !textTriggered) return null;

  recordChiefSnapshot(snapshot);
  notifyChiefUpdated();
  return buildChiefOffer(snapshot);
}

export function shouldSurfaceChiefOffer(
  offer: ChiefOfStaffOffer | null,
): boolean {
  return Boolean(offer?.introLine.trim());
}

export function acceptChiefPerspective(
  offer: ChiefOfStaffOffer,
): { message: string } {
  recordChiefSnapshot(offer.snapshot);
  notifyChiefUpdated();
  return { message: chiefTellMeMessage(offer.snapshot) };
}

export {
  chiefHintForChat,
  dismissChiefOffer,
};

export type { ChiefOfStaffInput, ChiefOfStaffOffer, ChiefOfStaffSnapshot };
