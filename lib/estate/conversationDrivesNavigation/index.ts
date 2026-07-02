/**
 * Conversation Drives Navigation™
 *
 * User expresses a need → Spark recommends an environment → Estate transforms around them.
 * Source of truth: Estate Directory. Spec 108: invitation, never forced move.
 *
 * @see docs/estate/07 - Estate Navigation.md
 * @see lib/estate/directory/
 */

export type {
  ConversationEnvironmentEvaluation,
  EnvironmentNeedDefinition,
  EnvironmentNeedId,
} from "./types";
export {
  ENVIRONMENT_NEED_MAX_SUGGESTIONS,
  ENVIRONMENT_NEED_OFFER_CONFIDENCE,
} from "./types";

export {
  ENVIRONMENT_NEED_LEXICON,
  getEnvironmentNeedDefinition,
} from "./environmentNeeds";

export {
  evaluateConversationEnvironmentNeed,
  isConversationEnvironmentOffer,
} from "./evaluateEnvironmentNeed";

export {
  ENVIRONMENT_OFFER_CLOSER,
  formatEnvironmentPlaceOffer,
} from "./formatEnvironmentOffer";
