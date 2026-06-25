export {
  clamp01,
  confident,
  decayConfidence,
  effectiveConfidence,
  isActionableConfidence,
  reinforce,
  type ConfidentValue,
} from "./confidenceInference";

export {
  loadNarrativeContext,
  refreshNarrativeContextOnArrival,
  type EmotionalTrajectory,
  type MomentumLevel,
  type NarrativeContext,
} from "./narrativeContext";

export {
  getFirstRelationshipSignals,
  recordFirstRelationshipSignals,
  type FirstRelationshipSignals,
} from "./firstConversationGraph";

export {
  getLivingIntelligenceGraph,
  hoursSinceLastArrival,
  recordArrival,
  recordArrivalFirstAction,
  timeOfDayBucket,
  type ArrivalGraphRecord,
  type LivingIntelligenceGraph,
} from "./livingIntelligenceGraph";

export {
  arrivalContinueOptions,
  evaluateArrivalIntelligence,
  homeChromeForState,
  homeStateDataAttr,
  resolveCompanionHomeState,
  type ArrivalIntelligence,
  type ArrivalConversationalTone,
  type ArrivalGreetingStrategy,
  type ArrivalSuggestedAction,
  type ArrivalUiEmphasis,
  type ArrivalVisitorKind,
  type CompanionHomeState,
  type HomeChromeConfig,
  type HomeNavVisibility,
} from "./arrivalIntelligence";
