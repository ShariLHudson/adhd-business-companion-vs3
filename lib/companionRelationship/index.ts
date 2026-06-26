export type {
  CheckInFrequency,
  CompanionRelationshipInput,
  CompanionRelationshipLearningState,
  CompanionRelationshipPreference,
  CompanionRelationshipRhythm,
  CompanionRelationshipStyle,
  CompanionRelationshipStyleMeta,
  CompanionRelationshipVerdict,
  ConversationLinger,
  GreetingLength,
  PersonalStoryFrequency,
  SpeedToWork,
  StorytellingDensity,
  VisitIntent,
} from "./types";

export {
  COMPANION_RELATIONSHIP_CONSTITUTIONAL_RULE,
  COMPANION_RELATIONSHIP_STYLES,
  DEFAULT_COMPANION_RELATIONSHIP_STYLE,
  VISIT_INTENTS,
} from "./types";

export {
  COMPANION_RELATIONSHIP_STYLES_CATALOG,
  rhythmForStyle,
  styleMetaById,
} from "./styles";

export {
  applyVisitIntentToRhythm,
  resolveVisitIntent,
} from "./visitAwareness";

export {
  acceptLearningOfferSuggestion,
  LEARNING_OFFER_FRONT_PORCH,
  LEARNING_OFFER_QUIET,
  resolveLearningOffer,
} from "./learning";

export {
  clearCompanionRelationshipStoreForTests,
  getCompanionRelationshipLearning,
  getCompanionRelationshipStyle,
  markCompanionRelationshipOfferShown,
  recordCompanionRelationshipVisitPattern,
  setCompanionRelationshipStyle,
} from "./preferenceStore";

export {
  evaluateCompanionRelationship,
  isEverydayLifeVisitEligible,
  isMemoryTriggerVisitEligible,
  shouldShowEnvironmentalStorytelling,
} from "./evaluateCompanionRelationship";
