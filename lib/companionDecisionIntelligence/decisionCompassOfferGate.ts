/**
 * Decision Compass offer gate — resource escalation only after discovery.
 */

import {
  isDecisionCompassOfferDismissedForSession,
  shouldOfferDecisionCompass,
} from "../decisionCompassRouting";
import { isOrdinaryDailyTasks } from "../ordinaryTaskList";
import type { CompanionDecisionIntelligence } from "./types";

export function shouldOfferDecisionCompassForTurn(input: {
  text: string;
  decisionIntelligence: CompanionDecisionIntelligence;
}): boolean {
  if (isDecisionCompassOfferDismissedForSession()) return false;
  // Ordinary daily task lists / day-planning must not escalate to Decision
  // Compass. isOrdinaryDailyTasks already rejects explicit decision intent
  // ("decide between…", "should I launch…"), so genuine decisions still offer it.
  if (isOrdinaryDailyTasks(input.text)) return false;

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
