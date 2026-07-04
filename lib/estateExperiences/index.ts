/**
 * Spark Estate Experiences™ — intent-first navigation layer.
 */

export {
  ESTATE_NAVIGATION_GOLDEN_RULE,
  ESTATE_NAVIGATION_FEATURE_GATE_QUESTION,
  ESTATE_NAVIGATION_CONFIDENCE_LEVELS,
  ESTATE_CROSS_SUGGESTION_TONES,
} from "./navigationPhilosophy";

export {
  ESTATE_EXPERIENCES,
  estateExperienceById,
  estateExperienceArrivalPrompt,
  estateExperienceDefaultSpace,
} from "./registry";

export {
  ESTATE_SPACE_PERSONALITIES,
  estateSpaceArrivalPrompt,
  estateSpaceArrivalSuggestions,
} from "./spacePersonalities";

export {
  formatEstateNavigationChoiceMenu,
  resolveEstateNavigationDisambiguation,
  resolveEstateNavigationDiscovery,
  parseEstateNavigationChoiceReply,
} from "./resolveEstateNavigation";

export {
  ESTATE_CROSS_SUGGESTIONS_BY_SPACE,
  formatCrossSuggestionBlock,
  formatCompletionBridgeSuggestion,
  formatRestoreToMomentumBridge,
} from "./crossSuggestions";

export { resolveEstateExperienceFromIntent } from "./intentToExperience";

export {
  LEGACY_WORKSPACE_MAP,
  ESTATE_LEGACY_MIGRATION_FREEZE,
  legacyEntryForSection,
  type LegacyDisposition,
  type LegacyWorkspaceEntry,
} from "./legacyWorkspaceMap";

export {
  searchEstateBrain,
  searchEstateBrainByNeed,
  resolveExperienceFromBrain,
  whatCanIDoHere,
} from "@/lib/estateBrain/search";

export type {
  EstateExperienceId,
  EstateSpaceId,
  EstateExperienceDefinition,
  EstateExperienceRoute,
  EstateNavigationConfidence,
  EstateNavigationChoice,
  EstateNavigationDisambiguation,
  EstateNavigationDiscovery,
  EstateCrossSuggestion,
  EstateSpacePersonality,
} from "./types";
