/**
 * Sprint 5 — Trust, Confidence & Adaptive User Intelligence facade.
 */

import type { OutcomeThread } from "./companionOutcomeThread";
import type { MultiTurnPatternAnalysis } from "./adhdMultiTurnPatterns";
import {
  adaptiveUserIntelligenceSprint5HintForChat,
  syncRelationshipMemoryFromThread,
} from "./companionAdaptiveUserEngine";
import {
  confidenceEngineHintForChat,
  getRecentConfidenceWins,
} from "./companionConfidenceEngine";
import {
  buildTrustSnapshot,
  explainRecommendationHint,
  trustEngineHintForChat,
  type TrustSnapshot,
} from "./companionTrustEngine";

export type Sprint5IntelligenceBundle = {
  trust: TrustSnapshot;
  trustHint: string;
  confidenceHint: string;
  adaptiveHint: string;
};

export function buildSprint5Intelligence(input: {
  outcomeThread?: OutcomeThread | null;
  multiTurn?: MultiTurnPatternAnalysis | null;
  featureLabel?: string | null;
  frictionLabel?: string | null;
}): Sprint5IntelligenceBundle {
  if (input.outcomeThread) {
    syncRelationshipMemoryFromThread(input.outcomeThread);
  }

  const trust = buildTrustSnapshot();
  const recommendationExplanation =
    input.featureLabel && input.frictionLabel
      ? explainRecommendationHint({
          featureLabel: input.featureLabel,
          friction: input.frictionLabel,
        })
      : input.featureLabel
        ? explainRecommendationHint({ featureLabel: input.featureLabel })
        : null;

  return {
    trust,
    trustHint: trustEngineHintForChat({
      snapshot: trust,
      outcomeThread: input.outcomeThread,
      recommendationExplanation,
    }),
    confidenceHint: confidenceEngineHintForChat(getRecentConfidenceWins()),
    adaptiveHint: adaptiveUserIntelligenceSprint5HintForChat({
      outcomeThread: input.outcomeThread,
      multiTurn: input.multiTurn,
    }),
  };
}

export function sprint5HintsForChat(bundle: Sprint5IntelligenceBundle): string {
  return [bundle.trustHint, bundle.confidenceHint, bundle.adaptiveHint].join(
    "\n\n",
  );
}

export {
  recordConfidenceWin,
  type ConfidenceWinKind,
} from "./companionConfidenceEngine";
export { syncRelationshipMemoryFromThread, getRelationshipMemory } from "./companionAdaptiveUserEngine";
