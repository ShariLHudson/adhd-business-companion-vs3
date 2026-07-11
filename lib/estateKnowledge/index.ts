/**
 * Estate Knowledge Registry — Phase 1 read-only layer + legacy room hints.
 *
 * @see docs/ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md
 * @see docs/estate/LAW_4_PHASE_0_MIGRATION_REPORT.md
 */

export type {
  EstateKnowledgeAnswer,
  EstateKnowledgeAnswerIntent,
  EstateKnowledgeAuditReport,
  EstateKnowledgeFeatureEntry,
  EstateKnowledgeGuidebookRef,
  EstateKnowledgeMediaAssets,
  EstateKnowledgePlaceEntry,
  EstateKnowledgePlaceQuery,
  EstateKnowledgePlaceStatus,
  EstateKnowledgeRouteDestination,
} from "./types";

export {
  ESTATE_KNOWLEDGE_READING_PLACE_IDS,
  ESTATE_KNOWLEDGE_SEMANTIC_GROUPS,
  ESTATE_KNOWLEDGE_TREEHOUSE_PLACE_IDS,
  ESTATE_KNOWLEDGE_WATER_PLACE_IDS,
} from "./semanticGroups";

export {
  ESTATE_KNOWLEDGE_REGISTRY_VERSION,
  buildEstateKnowledgeRegistry,
  canonicalPlaceIdsMissingMedia,
  mediaBackgroundKeysWithoutCanonicalPlace,
} from "./compileRegistry";

export {
  answerEstateKnowledgeQuery,
  formatEstateKnowledgeAuditReport,
  getEstateKnowledgeRegistry,
  getFeatureCatalog,
  getLivePlaces,
  getPlaceByAlias,
  getPlaceById,
  getPlacesByGroup,
  getPlannedPlaces,
  listEstateKnowledgeSemanticGroups,
  queryPlaces,
  resetEstateKnowledgeRegistryCache,
  runEstateKnowledgeAudit,
} from "./estateKnowledgeRegistry";

import {
  MOMENTUM_INSTITUTE_CHAT_KNOWLEDGE,
  MOMENTUM_INSTITUTE_REGISTRY_ID,
} from "./momentumInstitute";

const ROOM_KNOWLEDGE_BY_REGISTRY_ID: Readonly<Record<string, string>> = {
  [MOMENTUM_INSTITUTE_REGISTRY_ID]: MOMENTUM_INSTITUTE_CHAT_KNOWLEDGE,
};

/** Legacy per-room hint — Momentum Institute today; Wave 3 expands from registry. */
export function estateRoomKnowledgeHintForChat(
  registryEntryId: string,
): string | null {
  return ROOM_KNOWLEDGE_BY_REGISTRY_ID[registryEntryId] ?? null;
}

export {
  MOMENTUM_INSTITUTE_CHAT_KNOWLEDGE,
  MOMENTUM_INSTITUTE_REGISTRY_ID,
} from "./momentumInstitute";
