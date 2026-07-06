export type {
  FounderObservationKind,
  FounderPatternCategory,
  FounderPatternTrend,
  FounderFrictionKind,
  FounderSuccessOutcome,
  FounderAdaptationCategory,
  FounderObservation,
  FounderPattern,
  FounderPreference,
  FounderFrictionPattern,
  FounderStrength,
  FounderRecommendation,
  FounderProfileObserveInput,
  FounderProfileLearnInput,
  FounderProfileRecommendContext,
  FounderProfileView,
} from "./types";

export {
  SAMPLE_FOUNDER_OBSERVATIONS,
  SAMPLE_FOUNDER_PATTERNS,
  SAMPLE_FOUNDER_PREFERENCES,
  SAMPLE_FOUNDER_FRICTION,
  SAMPLE_FOUNDER_STRENGTHS,
} from "./sample";

export { founderProfileSampleRepository } from "./repositories/sample";
export { isObservationalPhrase } from "./patterns/patternEngine";
export { listPreferences } from "./preferences/preferenceLearning";
export { composeAdaptationView, FOUNDER_PROFILE_PRINCIPLES } from "./adaptation/adaptationEngine";

export {
  FounderProfileService,
  founderProfileService,
  observe,
  learn,
  recommend,
  patterns,
  friction,
  strengths,
  resetRuntimeFounderProfile,
} from "./services/founderProfileService";
