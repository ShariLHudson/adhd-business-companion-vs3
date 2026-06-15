/**
 * Environment Intelligence — reduce friction, not shame.
 */

import { shouldEvaluateEnvironment } from "./environmentSignals";
import { scoreEnvironment } from "./environmentScoring";
import {
  buildEnvironmentOffer,
  environmentAdjustPrompt,
  environmentHintForChat,
} from "./environmentMessages";
import {
  dismissEnvironmentOffer,
  isEnvironmentOfferDismissedToday,
  notifyEnvironmentUpdated,
  recordEnvironmentSnapshot,
  recordHelpfulAdjustment,
} from "./environmentStore";
import type {
  EnvironmentInput,
  EnvironmentOffer,
  EnvironmentSnapshot,
} from "./types";

export function evaluateEnvironment(
  input: EnvironmentInput = {},
): EnvironmentSnapshot | null {
  return scoreEnvironment(input, input.now ?? new Date());
}

export function evaluateAndRecordEnvironment(
  input: EnvironmentInput = {},
): EnvironmentSnapshot | null {
  const snapshot = evaluateEnvironment(input);
  if (snapshot) {
    recordEnvironmentSnapshot(snapshot);
    notifyEnvironmentUpdated();
  }
  return snapshot;
}

export function evaluateEnvironmentOffer(
  input: EnvironmentInput = {},
): EnvironmentOffer | null {
  const now = input.now ?? new Date();
  if (isEnvironmentOfferDismissedToday(now)) return null;

  const snapshot = evaluateEnvironment({ ...input, now });
  if (!snapshot) return null;

  const hasTextSignal = input.text
    ? shouldEvaluateEnvironment(input.text)
    : false;
  if (!hasTextSignal && !input.dayEnvironment && snapshot.focusFit !== "poor") {
    return null;
  }

  return buildEnvironmentOffer(snapshot);
}

export function shouldSurfaceEnvironmentOffer(
  offer: EnvironmentOffer | null,
): boolean {
  return Boolean(offer?.companionOffer.trim());
}

export function acceptEnvironmentAdjust(
  offer: EnvironmentOffer,
): { message: string } {
  recordHelpfulAdjustment(offer.snapshot.recommendedAdjustment);
  notifyEnvironmentUpdated();
  return { message: environmentAdjustPrompt(offer.snapshot) };
}

export {
  environmentHintForChat,
} from "./environmentMessages";
export { dismissEnvironmentOffer } from "./environmentStore";
export { environmentTipForPlan } from "./environmentInsights";

export type { EnvironmentInput, EnvironmentOffer, EnvironmentSnapshot };
