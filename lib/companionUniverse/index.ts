export type {
  CompanionLibraryId,
  CompanionLibraryMeta,
  CompanionPlace,
  CompanionPlaceId,
  ConstitutionCheck,
  ConstitutionPrincipleId,
  HospitalityStyle,
  LibraryMaturity,
  PersonalityTrait,
  ShariPresenceLevel,
  UniverseOrchestrationInput,
  UniverseOrchestrationResult,
} from "./types";

export {
  COMPANION_HOSPITALITY_CONSTITUTION,
  constitutionPassed,
  evaluateConstitution,
  type ConstitutionContext,
  type ConstitutionPrinciple,
} from "./constitution";

export {
  HOSPITALITY_PRINCIPLE,
  PREPARATION_EXAMPLES,
  SHARI_HOME_ANCHORS,
  describePreparation,
  evaluateHospitalityPrinciple,
  findPersonalizationViolations,
  hospitalityPrinciplePassed,
  copyUsesPersonalizationVoice,
  type HospitalityPreparation,
  type HospitalityPrincipleCheck,
  type HospitalityPrincipleEvaluation,
  type HospitalityPrincipleId,
} from "./hospitalityPrinciple";

export { COMPANION_LIBRARY_CATALOG, libraryById } from "./libraryCatalog";

export {
  COMPANION_PLACE_LIBRARY,
  availablePlaces,
  placeById,
} from "./libraries/placeLibrary";

export {
  SIGNATURE_OBJECT_LIBRARY,
  signatureObjectForPlace,
  type SignatureObject,
} from "./libraries/signatureObjectLibrary";

export {
  COMPANION_OBJECT_CATEGORIES,
  COMPANION_OBJECT_CATEGORY_LABELS,
  COMPANION_OBJECT_LIBRARY,
  PRIMARY_FEATURE_OBJECT_IDS,
  companionObjectById,
  companionObjectForFeature,
  companionObjectRegistrySummary,
  companionObjectsByCategory,
  companionObjectsForRoom,
  type CompanionObjectArtworkStatus,
  type CompanionObjectCategory,
  type CompanionObjectEntry,
  type PrimaryFeatureObjectId,
} from "./libraries/objectLibrary";

export {
  COMPANION_CONVERSATION_LIBRARY,
  conversationStyleForPlace,
  type ConversationStyleEntry,
} from "./libraries/conversationLibrary";

export {
  SHARI_PERSONALITY_LIBRARY,
  SHARI_PERSONALITY_TRAITS,
  type PersonalityGuideline,
} from "./libraries/personalityLibrary";

export {
  HOSPITALITY_LIBRARY,
  hospitalityForContext,
  type HospitalityItem,
} from "./libraries/hospitalityLibrary";

export {
  LIVING_MOTION_LIBRARY,
  motionById,
  type LivingMotionEntry,
} from "./libraries/motionLibrary";

export {
  SCENE_INTEGRITY_RULES,
  type SceneIntegrityRule,
} from "./libraries/sceneIntegrityLibrary";

export { DELIGHT_LIBRARY, type DelightMoment } from "./libraries/delightLibrary";
export { COMPANION_HUMOR_LIBRARY, type HumorMoment } from "./libraries/humorLibrary";
export { ARTWORK_LIBRARY, type ArtworkPiece } from "./libraries/artworkLibrary";
export {
  SHARI_STORIES_LIBRARY,
  NGMTM_STORIES_LIBRARY,
  type ShariStory,
} from "./libraries/shariStoriesLibrary";

export { orchestrateCompanionUniverse } from "./orchestrator/companionBrainOrchestrator";

export {
  COMPANION_EXPERIENCE_PRINCIPLES,
  COMPANION_NEEDS_CATALOG,
  COMPANION_NEEDS_FLOW,
  companionNeedById,
  evaluateAdhdDesignFilter,
  evaluateCompanionNeedsIntelligence,
  needDefinition,
  primaryPlaceForNeed,
  type AdhdDesignFilterEvaluation,
  type CompanionNeedDefinition,
  type CompanionNeedId,
  type CompanionNeedsInput,
  type CompanionNeedsIntelligence,
  type RestorationOutcome,
} from "@/lib/companionNeedsIntelligence";
export {
  resolveHospitalityLayers,
  type HospitalityLayers,
  type Layer1Foundation,
  type Layer2Hospitality,
  type Layer3Conversation,
  type Layer4Traditions,
  type Layer5GuestHospitality,
} from "./resolveHospitalityLayers";

export {
  EMPTY_HOSPITALITY_PROFILE,
  EXAMPLE_HOSPITALITY_PROFILES,
  FORBIDDEN_FOUNDATION_CHANGES,
  ALLOWED_PROFILE_INFLUENCE,
  mergeHospitalityProfile,
  type CompanionHospitalityProfile,
  type FavoriteDrink,
} from "./libraries/hospitalityProfileLibrary";

export {
  HOME_TRADITIONS_LIBRARY,
  activeTraditions,
  type HomeTradition,
} from "./libraries/traditionsLibrary";

export {
  COMPANION_LAYOUT_SYSTEM,
  COMPANION_TOOLBELT,
  HOUSE_MAP_NAV,
  LAYOUT_LAYERS,
  ROOM_IMMERSION_BY_PLACE,
  evaluateLayoutSeparation,
  houseMapForPlace,
  layoutSeparationPassed,
  placeForSection,
  resolveCompanionLayout,
  type ToolbeltItem,
  type ToolbeltItemId,
  type HouseMapNavId,
} from "./companionLayoutSystem";

export {
  EXPERIENCE_PRESENCE_MAP,
  PRESENCE_LEVEL_META,
  evaluateCompanionPresenceEngine,
  experienceForPlace,
  experienceForSection,
  legacyPresenceMatchesEngine,
  presenceLevelFromLegacy,
  type CompanionExperienceId,
  type CompanionPresenceLevel,
  type PresenceActivityModifier,
  type ResolvedCompanionPresence,
} from "./companionPresenceEngine";

// Re-export existing production libraries for single import surface
export {
  COMPANION_PRESENCE_SCENE_CATALOG,
  COMPANION_PRESENCE_WELCOME_IMAGE_ID,
} from "@/lib/companionPresenceLibrary/sceneCatalog";
export {
  DEFAULT_DIRECTOR_BRIEF,
  DEFAULT_DIRECTOR_STATE,
  DIRECTOR_COMPARE_A_KEY,
  DIRECTOR_COMPARE_B_KEY,
  DIRECTOR_STORAGE_KEY,
  HOSPITALITY_SCENE_PRESETS,
  evaluateSceneValidation,
  exportSceneJson,
  loadCompareSlot,
  loadSavedDirectorState,
  prepareHomeFromBrief,
  presetById,
  presetToDirectorState,
  productionSurpriseBrief,
  saveCompareSlot,
  saveDirectorState,
  saveFavoriteBrief,
  saveSceneToLibrary,
  startAmbientHospitalityAudio,
  surpriseDirectorState,
  type DirectorBrief,
  type DirectorSceneState,
  type ResolvedHospitalityScene,
  type SceneValidationScore,
  resolveSceneIntegrity,
} from "@/lib/companionHospitalityPrototype";
export { SAFE_COMPOSITION_REGISTRY } from "@/lib/companionHospitalityPrototype/safeCompositionRegistry";
export {
  WELCOME_GREETING_LIBRARY,
  WELCOME_INVITE_LIBRARY,
} from "@/lib/welcomePresenceIntelligence/greetingLibrary";
export {
  getHospitalityProfile,
  saveHospitalityProfile,
  clearHospitalityProfile,
  resolveGuestPreparation,
  resolveVisitEnergy,
  type GuestPreparation,
  type VisitEnergy,
} from "@/lib/companionHospitalityProfile";
