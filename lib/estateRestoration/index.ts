/**
 * Intentional Restoration — Estate Guide integration.
 * @see docs/estate/ESTATE_RESTORATION_GUIDE.md
 */

export type {
  EstateGuideStoryPick,
  RestorationDeliveryMode,
  RestorationEvaluation,
  RestorationInput,
  RestorationOfferResult,
  RestorationReturnResult,
  RestorationSessionStore,
  RestorationTrigger,
} from "./types";

export {
  bestRestorationTrigger,
  detectRestorationTriggers,
  shouldBlockRestorationOffer,
} from "./detection";

export {
  ESTATE_GUIDE_STORY_CHAINS,
  STORY_COMPANION_CHAINS,
  storyContextFromInput,
} from "./storyRegistry";

export {
  buildStoryPick,
  listAvailableSpreadIds,
  storyTitle,
} from "./storySnippets";

export {
  canOfferRestorationNow,
  clearPendingReturn,
  loadRestorationStore,
  recordRestorationDeclined,
  recordRestorationOffer,
  recordStoryRead,
  saveRestorationStore,
  setPendingReturn,
} from "./store";

export {
  acceptRestorationStory,
  buildRestorationOffer,
  evaluateRestorationOpportunity,
  formatInlineStoryReply,
  formatRestorationOfferReply,
  isRestorationAcceptance,
  isRestorationDecline,
  isRestorationOfferMessage,
  isRestorationReturnReady,
  resolveRestorationReturn,
  restorationHint,
} from "./engine";
