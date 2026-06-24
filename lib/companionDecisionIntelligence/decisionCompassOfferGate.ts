/**
 * Decision Compass offer gate — resource escalation only after discovery.
 */

import {
  isDecisionCompassOfferDismissedForSession,
  shouldOfferDecisionCompass,
} from "../decisionCompassRouting";
import type { CompanionDecisionIntelligence } from "./types";

export function shouldOfferDecisionCompassForTurn(input: {
  text: string;
  decisionIntelligence: CompanionDecisionIntelligence;
}): boolean {
  if (isDecisionCompassOfferDismissedForSession()) return false;

  const intel = input.decisionIntelligence;

  if (
    intel.situation.decisionType === "business_expansion" ||
    intel.complexity.level !== "low"
  ) {
    if (intel.shouldDeferSolutions) return false;
    return (
      intel.shouldOfferTopResource &&
      intel.topResource?.id === "decision_compass"
    );
  }

  return shouldOfferDecisionCompass(input.text);
}
