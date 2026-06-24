/**
 * Outcome thread sync — keep pending decisions and offers aligned with intelligence.
 */

import {
  patchOutcomeThread,
  type OutcomeThread,
} from "../companionOutcomeThread";
import type { CompanionDecisionIntelligence } from "./types";

export function pendingDecisionLabelForIntelligence(
  intel: CompanionDecisionIntelligence,
): string | undefined {
  if (intel.situation.decisionType === "business_expansion") {
    return "keep current, replace, or offer both";
  }
  if (
    intel.complexity.level !== "low" &&
    intel.situation.decisionType !== "general"
  ) {
    return intel.situation.actualSituation.slice(0, 120);
  }
  return undefined;
}

/** Persist decision context so acceptance never resets the thread. */
export function syncOutcomeThreadFromDecisionIntelligence(
  intel: CompanionDecisionIntelligence,
  userText: string,
): OutcomeThread | null {
  const patch: Partial<OutcomeThread> = {};
  const pendingDecision = pendingDecisionLabelForIntelligence(intel);

  if (pendingDecision) {
    patch.pendingDecision = pendingDecision;
  }

  if (intel.situation.decisionType === "business_expansion" && userText.trim()) {
    patch.currentProblem = userText.trim().slice(0, 200);
  }

  if (
    intel.shouldOfferTopResource &&
    intel.topResource?.id === "decision_compass"
  ) {
    patch.pendingAction = `Open ${intel.topResource.label}`;
    patch.activeFeature = "decision-compass";
    patch.workflowKind = "open_decision_compass";
  }

  if (!Object.keys(patch).length) return null;
  return patchOutcomeThread(patch);
}
