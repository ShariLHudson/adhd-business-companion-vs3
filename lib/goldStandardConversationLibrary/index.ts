/**
 * Talk It Out™ Gold Standard Conversation Library (package 194).
 *
 * Rules explain what not to do. Examples demonstrate excellent conversation.
 * Runtime may retrieve structure — never copy full conversations verbatim.
 */

export type {
  GoldStandardConversation,
  GscCategory,
  GscConversationalMove,
  GscQualityCert,
  GscRetrievalInput,
  GscRetrievalHit,
  GscRetrievalResult,
  GscTurn,
} from "./types";
export { ALL_QUALITY_PASS } from "./types";

export { certifyConversation, isFullyCertified } from "./qualityCert";
export {
  getGoldStandardById,
  listGoldStandardConversations,
  BATCH1_BUSINESS_DECISIONS,
  BATCH2_COVERAGE,
  FEATURED_SAMPLES,
  TIO_GSC_BIZ_HIRING_001,
  TIO_GSC_CORRECTION_001,
  TIO_GSC_REPAIR_001,
} from "./catalog";
export { retrieveGoldStandardGuidance } from "./retrieval";
export {
  draftMatchesBlockedPattern,
  getTalkItOutGoldGuidance,
  replaceBlockedDraft,
  suggestedGroundedQuestion,
} from "./applyGuidance";
