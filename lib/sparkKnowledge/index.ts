/**
 * Shari Knowledge & Intelligence Framework™
 * @see docs/estate/SHARI_KNOWLEDGE_INTELLIGENCE_FRAMEWORK.md
 */

export type {
  EstateGuideTopic,
  EstateGuideTurnResult,
  ShariKnowledgeHintOptions,
  SparkKnowledgeEntry,
  SparkKnowledgeExplainable,
  SparkKnowledgeKind,
  SparkKnowledgeSearchMatch,
  SparkKnowledgeSearchResult,
} from "./types";

export {
  allSparkKnowledgeEntries,
  estateGuideHint,
  explainSparkKnowledge,
  searchSparkKnowledge,
  shariKnowledgeHintForChat,
  sparkKnowledgeById,
  sparkKnowledgeByKind,
} from "./shariKnowledge";

export {
  formatEstateGuideReply,
  isEstateGuideQuestion,
  isEstateOrientationQuestion,
  isEstateRoomStoryQuestion,
  resolveEstateGuideTurn,
  UNIVERSAL_DOCUMENT_LABELS,
} from "./estateGuide";

export {
  CREATION_KNOWLEDGE,
  creationKnowledgeById,
} from "./creationKnowledge";

export {
  THINKING_FRAMEWORKS,
  thinkingFrameworkById,
} from "./thinkingFrameworkRegistry";

export {
  adaptiveAnticipationLine,
  formatRecommendationsForHint,
  recommendationsForEvent,
} from "./recommendationEngine";

export type {
  CapabilityRecommendation,
  RecommendationEvent,
} from "./recommendationEngine";
