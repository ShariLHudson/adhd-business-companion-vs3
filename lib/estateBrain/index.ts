/**
 * Estate Brain™ — public API
 */

export type {
  EstateBrainSearchMatch,
  EstateBrainSearchResult,
  EstateKnowledgeEntry,
  EstateKnowledgeKind,
  EstateKnowledgeUserNeed,
} from "./types";

export {
  ESTATE_BRAIN_ENTRIES,
  allEstateBrainEntries,
  estateBrainEntryById,
  estateBrainEntryBySpaceId,
  estateBrainExperiences,
  estateBrainSpaces,
} from "./knowledgeRegistry";

export {
  searchEstateBrain,
  searchEstateBrainByNeed,
  searchEstateBrainFromNaturalQuestion,
  resolveExperienceFromBrain,
  whatCanIDoHere,
  relatedSpacesFor,
  betterPlaceFor,
  defaultGreetingForSpace,
  defaultGreetingForExperience,
  nextSuggestionsFor,
  buildEstateBrainTriggerIndex,
} from "./search";

export {
  brainEntryToExperienceDefinition,
  experiencesFromBrain,
  brainEntryToRegistryEntry,
  registryEntriesFromBrain,
} from "./adapters";

export {
  ESTATE_CAPABILITIES,
  estateCapabilityById,
  estateCapabilitiesByCategory,
} from "./capabilityRegistry";

export {
  ESTATE_EXPERTS,
  estateExpertById,
  estateExpertNames,
} from "./expertRegistry";

export {
  isResearchIntent,
  detectResearchLevel,
  researchCapabilityIdForLevel,
} from "./researchRouting";

export {
  resolveEstateIntelligenceRoute,
  resolveImmediateResearchOpen,
  resolveEstateIntelligenceImmediateAction,
  formatEstateIntelligenceHint,
} from "./routeEstateIntelligence";

export {
  ESTATE_INTENT_DEFINITIONS,
  detectEstateIntent,
  capabilityCategoryForIntent,
} from "./intentCategories";

export {
  ESTATE_ENVIRONMENTS,
  estateEnvironmentById,
  estateEnvironmentBySpaceId,
  environmentsForIntent,
} from "./environmentRegistry";

export {
  resolveIntentFirstRoute,
  formatEnvironmentChoiceIntro,
  parseEnvironmentChoiceReply,
} from "./routeIntentFirstNavigation";

export {
  detectEstateCoachingSituation,
  detectCoachingGoal,
  shouldCoachBeforeNavigate,
  resolveEstateCoachingMenu,
  focusCoachingMenuForObstacle,
  formatEstateCoachingMenu,
  parseEstateCoachingChoice,
  resolveEstateCoachingContinuation,
  buildCoachingOpenPayload,
  estateCoachingHint,
  isEstateCoachingMenuMessage,
} from "./estateCoaching";

export {
  prescriptionsForSituation,
  ESTATE_COACHING_PRESCRIPTIONS,
} from "./estateCoachingRegistry";

export {
  detectDiscoveryTopic,
  shouldEnterDiscoveryMode,
  isDiscoveryMessage,
  startDiscoveryTurn,
  advanceDiscoverySession,
  resolveDiscoveryTurn,
  formatDiscoveryQuestion,
  discoveryHint,
  saveDiscoverySession,
  loadDiscoverySession,
  clearDiscoverySession,
  hasSufficientDiscoveryContext,
} from "./discoveryMode";

export { DISCOVERY_QUESTIONS, DISCOVERY_INTROS } from "./discoveryRegistry";
export { preparationLineForSession } from "./discoveryPreparation";

export {
  confidenceTier,
  getAdaptivePreference,
  recordAdaptiveSignal,
  recordSignalsFromCoachingChoice,
  recordSignalsFromDiscoveryAnswer,
  recordSignalsFromCreateCompletion,
  anticipateNextStep,
  adaptiveEstateHintForChat,
  adaptiveCoachingOpener,
  prefillDiscoveryFromAdaptiveMemory,
  memberFacingPreferenceLine,
} from "./adaptiveIntelligence";

export type {
  AdaptivePreferenceId,
  AdaptiveConfidenceTier,
  AnticipationEvent,
  AnticipationSuggestion,
} from "./adaptiveIntelligence";

export type { EstateIntentCategory } from "./intentCategories";
export type { EstateEnvironment } from "./environmentRegistry";
export type {
  EstateCoachingSituation,
  EstateCoachingMenu,
  EstateCoachingPrescription,
  EstateCoachingGoal,
  ImmediateEstateCoachingOpenPayload,
} from "./estateCoachingTypes";
export type {
  DiscoveryTopic,
  DiscoverySession,
  DiscoveryTurnResult,
  DiscoveryConfidence,
  EstateDiscoveryReadyAction,
} from "./discoveryTypes";

export type {
  EstateResearchLevel,
  EstateCapability,
  EstateCapabilityCategory,
  EstateExpert,
  EstateIntelligenceRoute,
  EstateIntelligenceConfidence,
  ImmediateResearchOpenPayload,
  EstateEnvironmentChoice,
} from "./intelligenceTypes";
