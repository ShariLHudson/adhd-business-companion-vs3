export type {
  AwarenessDomain,
  ChangeKind,
  AwarenessConfidence,
  AwarenessSignal,
  AwarenessObservation,
  AwarenessPattern,
  AwarenessException,
  AwarenessChange,
  AwarenessOpportunity,
  AwarenessRisk,
  AwarenessRelationship,
  AwarenessOutputChannel,
  AwarenessRecommendation,
  AwarenessContext,
  AwarenessView,
} from "./types";

export {
  AWARENESS_PRINCIPLE,
  AWARENESS_VISION,
  EXECUTIVE_AWARENESS_QUESTIONS,
  AWARENESS_NOTICES,
  SAMPLE_PRIOR_SIGNALS,
} from "./sample";

export { awarenessSampleRepository } from "./repositories/sample";
export { collectAwarenessSignals, signalsByDomain } from "./signals/signalCollector";
export { observeSignal, observeSignals } from "./observers/domainObservers";
export { detectChange, detectChanges, isUnexpectedChange } from "./detectors/changeDetector";
export {
  surfaceOpportunities,
  surfaceRisks,
  surfaceRecommendations,
} from "./detectors/significanceFilter";
export { compareToBaseline, detectPatterns } from "./comparisons/trendComparison";
export { findRelationships, detectExceptions } from "./relationships/relationshipFinder";
export {
  composeAwareness,
  significantAwareness,
  AwarenessService,
  awarenessService,
} from "./services/awarenessService";
