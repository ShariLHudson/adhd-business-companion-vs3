/**
 * Spark Knowledge Architecture™ — Phase 3 runtime types.
 * Catalog contracts live in @/lib/sparkMomentumInstitute/types.
 *
 * @see docs/MOMENTUM_INSTITUTE_ARCHITECTURE.md
 */

import type { InstitutePillarId } from "@/lib/sparkCompetencyFramework/types";
import type {
  GrowthCompetencyDefinition,
  InstituteDepartmentDefinition,
  InstituteDrawerDefinition,
  InstituteTopicDefinition,
  KnowledgeCardDefinition,
  KnowledgeRelationshipDefinition,
  KnowledgeRelationshipKind,
  LearningExperienceDefinition,
  LearningExperienceTypeId,
  MomentumInstituteDefinition,
  SuggestedLearningPathDefinition,
} from "@/lib/sparkMomentumInstitute/types";

export type {
  KnowledgeDifficultyLevel,
  BusinessStageId,
  InstituteRelevanceLevel,
  KnowledgeCardMetadata,
  KnowledgeRelationshipKind,
  KnowledgeRelationshipDefinition,
  SuggestedLearningPathDefinition,
} from "@/lib/sparkMomentumInstitute/types";

export {
  KNOWLEDGE_DIFFICULTY_IDS,
  BUSINESS_STAGE_IDS,
  INSTITUTE_RELEVANCE_LEVELS,
  KNOWLEDGE_RELATIONSHIP_KINDS,
} from "@/lib/sparkMomentumInstitute/types";

/** Canonical hierarchy depth — Institute → Pillar → Department → Drawer → Knowledge Card → Experience */
export const KNOWLEDGE_HIERARCHY_LEVELS = [
  "institute",
  "pillar",
  "department",
  "drawer",
  "knowledge_card",
  "learning_experience",
] as const;

export type KnowledgeHierarchyLevel =
  (typeof KNOWLEDGE_HIERARCHY_LEVELS)[number];

/** Phase 3 core experience types — not every card offers every type */
export const PHASE3_CORE_EXPERIENCE_TYPE_IDS = [
  "business_mastery_minute",
  "deep_lesson",
  "business_lab",
  "simulation",
  "apprenticeship",
  "challenge",
  "strategy_collection",
  "reflection",
  "coaching_session",
  "apply_to_my_business",
] as const satisfies readonly LearningExperienceTypeId[];

export type Phase3CoreExperienceTypeId =
  (typeof PHASE3_CORE_EXPERIENCE_TYPE_IDS)[number];

export const KNOWLEDGE_DIFFICULTY_LABELS: Record<string, string> = {
  foundational: "Foundational",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export const BUSINESS_STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  launch: "Launch",
  growth: "Growth",
  scale: "Scale",
  mature: "Mature",
  all: "All stages",
};

export const KNOWLEDGE_RELATIONSHIP_LABELS: Record<
  KnowledgeRelationshipKind,
  string
> = {
  related: "Related Topic",
  prerequisite: "Prerequisite",
  advanced: "Advanced Topic",
  recommended_next: "Recommended Next",
};

/** Resolved breadcrumb from Institute root to a Knowledge Card */
export type KnowledgeCardPlacement = {
  institute: MomentumInstituteDefinition;
  pillarId: InstitutePillarId;
  department: InstituteDepartmentDefinition;
  drawer: InstituteDrawerDefinition;
  topic: InstituteTopicDefinition | null;
  knowledgeCard: KnowledgeCardDefinition;
};

export type ResolvedKnowledgeRelationship = {
  relationship: KnowledgeRelationshipDefinition;
  targetCard: KnowledgeCardDefinition;
  kind: KnowledgeRelationshipKind;
  accessible: boolean;
  blockedByPrerequisiteIds?: string[];
};

export type ResolvedLearningPathStep = {
  path: SuggestedLearningPathDefinition;
  knowledgeCard: KnowledgeCardDefinition;
  stepIndex: number;
  completed: boolean;
  accessible: boolean;
  blockedByPrerequisiteIds?: string[];
};

export type CompetencyGraphNode = GrowthCompetencyDefinition & {
  childIds: string[];
  depth: number;
};

export type CompetencyGraph = {
  nodes: Map<string, CompetencyGraphNode>;
  roots: string[];
};

export type InstituteCatalogIndex = {
  version: string;
  instituteId: string;
  byKnowledgeCardId: Map<string, KnowledgeCardDefinition>;
  byKnowledgeCardSlug: Map<string, KnowledgeCardDefinition>;
  byDrawerId: Map<string, InstituteDrawerDefinition>;
  byDepartmentId: Map<string, InstituteDepartmentDefinition>;
  byTopicId: Map<string, InstituteTopicDefinition>;
  byExperienceId: Map<string, LearningExperienceDefinition>;
  byCompetencyId: Map<string, GrowthCompetencyDefinition>;
  cardsByDrawerId: Map<string, string[]>;
  cardsByDepartmentId: Map<string, string[]>;
  cardsByPillarId: Map<string, string[]>;
  experiencesByCardId: Map<string, string[]>;
  relationshipsFromCard: Map<string, KnowledgeRelationshipDefinition[]>;
  relationshipsToCard: Map<string, KnowledgeRelationshipDefinition[]>;
  learningPathsByCardId: Map<string, string[]>;
};

export const KNOWLEDGE_ARCHITECTURE_SCALE_TARGETS = {
  drawers: 500,
  knowledgeCards: 5_000,
  learningAssets: 10_000,
} as const;

/** Legacy experience type ids — normalize at catalog load */
export const LEGACY_EXPERIENCE_TYPE_ALIASES: Record<string, LearningExperienceTypeId> =
  {
    strategy_vault: "strategy_collection",
  };

export function normalizeExperienceTypeId(
  kind: string,
): LearningExperienceTypeId {
  const aliased = LEGACY_EXPERIENCE_TYPE_ALIASES[kind] ?? kind;
  return aliased as LearningExperienceTypeId;
}
