/**
 * Estate Knowledge Judgment Layer — Phase 2.
 * Sits above Estate Knowledge Registry; does not replace legacy routing yet.
 */

export {
  describeEstatePlace,
  evaluateEstateJudgment,
  extractEstateContextSignals,
  getAllPurposeProfiles,
  getPurposeProfile,
  isEstateJudgmentQuery,
} from "./evaluateEstateJudgment";

export {
  ESTATE_DISCOVERY_CATEGORIES,
  ESTATE_DISCOVERY_GROUP_PLACE_IDS,
} from "./discoveryCategories";

export {
  ESTATE_INTENT_FAMILIES,
  featureIdsForIntentFamilies,
  placeIdsForIntentFamilies,
} from "./intentFamilies";

export { GENTLE_GUIDANCE_FORBIDDEN_RE, GENTLE_GUIDANCE_HINT } from "./gentleGuidance";

export type {
  EstateActivityMode,
  EstateContextSignals,
  EstateDiscoveryLevel,
  EstateEmotionalSignal,
  EstateEnergyLevel,
  EstateJudgmentInput,
  EstateJudgmentResult,
  EstateIntentFamily,
  EstatePurposeProfile,
  EstateRecommendation,
  EstateRecommendationKind,
} from "./types";
