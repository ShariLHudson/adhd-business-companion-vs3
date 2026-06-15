/**
 * Business Operating System Intelligence — orchestration.
 */

import { gatherBusinessSignals, shouldEvaluateBusinessOS } from "./businessSignals";
import { buildBusinessOSSnapshot } from "./businessInsights";
import {
  buildBusinessSortOffer,
  businessHintForChat,
  businessSortAcceptMessage,
} from "./businessMessages";
import {
  dismissBusinessOSSortOffer,
  isBusinessOSSortDismissedToday,
  notifyBusinessOSUpdated,
  recordBusinessOSSnapshot,
} from "./businessStore";
import type {
  BusinessOSInput,
  BusinessOSSnapshot,
  BusinessOSSortOffer,
} from "./types";

export function evaluateBusinessOS(
  input: BusinessOSInput = {},
): BusinessOSSnapshot {
  const context = gatherBusinessSignals(input);
  return buildBusinessOSSnapshot(context);
}

export function evaluateAndRecordBusinessOS(
  input: BusinessOSInput = {},
): BusinessOSSnapshot {
  const snapshot = evaluateBusinessOS(input);
  recordBusinessOSSnapshot(snapshot);
  notifyBusinessOSUpdated();
  return snapshot;
}

export function evaluateBusinessOSSortOffer(
  input: BusinessOSInput = {},
): BusinessOSSortOffer | null {
  const now = input.now ?? new Date();
  if (isBusinessOSSortDismissedToday(now)) return null;

  const snapshot = evaluateBusinessOS({ ...input, now });
  const fragmented =
    snapshot.activeRisks.length >= 2 ||
    snapshot.businessHealth === "needs_attention" ||
    snapshot.businessHealth === "overloaded" ||
    snapshot.founderLoad === "high" ||
    snapshot.founderLoad === "critical";

  const textTriggered = input.text ? shouldEvaluateBusinessOS(input.text) : false;
  if (!fragmented && !textTriggered) return null;
  if (snapshot.businessHealth === "unknown" && !textTriggered) return null;

  return buildBusinessSortOffer(snapshot);
}

export function shouldSurfaceBusinessOSSortOffer(
  offer: BusinessOSSortOffer | null,
): boolean {
  return Boolean(offer?.companionOffer.trim());
}

export function acceptBusinessSort(offer: BusinessOSSortOffer): { message: string } {
  recordBusinessOSSnapshot(offer.snapshot);
  notifyBusinessOSUpdated();
  return { message: businessSortAcceptMessage(offer.snapshot) };
}

export {
  businessHintForChat,
  dismissBusinessOSSortOffer,
};

export type { BusinessOSInput, BusinessOSSnapshot, BusinessOSSortOffer };
