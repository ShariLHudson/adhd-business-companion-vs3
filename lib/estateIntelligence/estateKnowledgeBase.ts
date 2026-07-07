/**
 * Estate Intelligence™ — bridge to Estate Knowledge Base™.
 */

export {
  getKnowledgeRegistry,
  getKnowledgeItem,
  getLiveKnowledgeItems,
  getEstateVocabulary,
  officialNameFor,
  canRecommendKnowledgeItem,
  searchKnowledgeItems,
  discoveriesForEntity,
  momentumActivitiesForEntity,
  sparkCardsForEntity,
} from "@/lib/estateKnowledgeBase";

export type {
  EstateKnowledgeItem,
  EstateKnowledgeStatus,
  EstateKnowledgeRegistryId,
} from "@/lib/estateKnowledgeBase/types";
