export type {
  KnowledgeHierarchyLevel,
  Phase3CoreExperienceTypeId,
  KnowledgeDifficultyLevel,
  BusinessStageId,
  InstituteRelevanceLevel,
  KnowledgeCardMetadata,
  KnowledgeRelationshipKind,
  KnowledgeRelationshipDefinition,
  SuggestedLearningPathDefinition,
  KnowledgeCardPlacement,
  ResolvedKnowledgeRelationship,
  ResolvedLearningPathStep,
  CompetencyGraphNode,
  CompetencyGraph,
  InstituteCatalogIndex,
} from "./types";

export {
  KNOWLEDGE_HIERARCHY_LEVELS,
  PHASE3_CORE_EXPERIENCE_TYPE_IDS,
  KNOWLEDGE_DIFFICULTY_IDS,
  KNOWLEDGE_DIFFICULTY_LABELS,
  BUSINESS_STAGE_IDS,
  BUSINESS_STAGE_LABELS,
  INSTITUTE_RELEVANCE_LEVELS,
  KNOWLEDGE_RELATIONSHIP_KINDS,
  KNOWLEDGE_RELATIONSHIP_LABELS,
  KNOWLEDGE_ARCHITECTURE_SCALE_TARGETS,
} from "./types";

export { buildCatalogIndex, catalogScaleFromIndex } from "./catalogIndex";

export {
  getRelatedKnowledgeCards,
  getPrerequisiteKnowledgeCards,
  getAdvancedKnowledgeCards,
  getRecommendedNextKnowledgeCards,
  getAllKnowledgeRelationships,
  canAccessKnowledgeCard,
  sparkSuggestedNextCards,
  resolveLearningPath,
  listLearningPathsForCard,
  sparkSuggestedLearningPath,
} from "./relationshipEngine";
export type { RelationshipEngineContext } from "./relationshipEngine";

export {
  buildCompetencyGraph,
  getCompetencyGraph,
  getChildCompetencies,
  getAncestorCompetencies,
  getCompetenciesForKnowledgeCard,
  findStrengtheningOpportunities,
  expandCompetencyTree,
} from "./competencyGraph";
export type {
  MemberCompetencySnapshot,
  StrengtheningOpportunity,
} from "./competencyGraph";

export {
  resolveKnowledgeCardPlacement,
  formatKnowledgeBreadcrumb,
  listKnowledgeCardsInDrawer,
  listKnowledgeCardsInDepartment,
  listKnowledgeCardsInPillar,
  getKnowledgeCardBySlug,
} from "./placement";
