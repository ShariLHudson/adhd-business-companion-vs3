/**
 * Momentum Institute — Entrepreneur Development Center of the Spark Estate
 * Framework types (T-spec). Data-driven catalog definitions — not lesson content.
 *
 * One master Knowledge Card per concept. Every experience references it.
 * No duplicate lessons, journals, or evidence — relationships only.
 *
 * @see docs/MOMENTUM_INSTITUTE_ARCHITECTURE.md
 */

import type { IntelligenceReadyHooks } from "@/lib/intelligence/intelligenceReadyTypes";
import type {
  GrowthCompetencyLevel,
  InstitutePillarId,
  KnowledgePerspectiveDefinition,
  LearningTimeSlotId,
  PersonalLearningEcosystemDestination,
  SparkCompetencyFrameworkV1,
} from "@/lib/sparkCompetencyFramework/types";

export type { GrowthCompetencyLevel } from "@/lib/sparkCompetencyFramework/types";

// ── Institute hierarchy (catalog) ───────────────────────────────────────────

/** Root catalog record — the Institute as a place, not a room. */
export type MomentumInstituteDefinition = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  /** Entrepreneur Development Center positioning */
  tagline: string;
  pillarIds: InstitutePillarId[];
  departmentIds: string[];
  version: string;
  publishedAt?: string;
};

/** Department — e.g. Marketing, Leadership, Finance (20+ supported). */
export type InstituteDepartmentDefinition = {
  id: string;
  instituteId: string;
  pillarId: InstitutePillarId;
  slug: string;
  title: string;
  description: string;
  drawerIds: string[];
  sortOrder: number;
  iconKey?: string;
  competencyIds: string[];
};

/** Drawer — filing cabinet within a department (500+ supported). */
export type InstituteDrawerDefinition = {
  id: string;
  departmentId: string;
  pillarId: InstitutePillarId;
  slug: string;
  title: string;
  description: string;
  topicIds: string[];
  sortOrder: number;
};

/** Topic — thematic grouping inside a drawer. */
export type InstituteTopicDefinition = {
  id: string;
  drawerId: string;
  departmentId: string;
  slug: string;
  title: string;
  summary: string;
  knowledgeCardIds: string[];
  /** Which experience types this topic supports — engine resolves availability */
  supportedExperienceTypes: LearningExperienceTypeId[];
  competencyIds: string[];
  /** Spark Knowledge Perspectives — discipline ids informing this topic */
  perspectiveIds: string[];
  sortOrder: number;
};

// ── Knowledge Card metadata & relationships (Phase 3) ─────────────────────

export const KNOWLEDGE_DIFFICULTY_IDS = [
  "foundational",
  "intermediate",
  "advanced",
  "expert",
] as const;

export type KnowledgeDifficultyLevel =
  (typeof KNOWLEDGE_DIFFICULTY_IDS)[number];

export const BUSINESS_STAGE_IDS = [
  "idea",
  "launch",
  "growth",
  "scale",
  "mature",
  "all",
] as const;

export type BusinessStageId = (typeof BUSINESS_STAGE_IDS)[number];

export const INSTITUTE_RELEVANCE_LEVELS = [
  "none",
  "low",
  "medium",
  "high",
] as const;

export type InstituteRelevanceLevel =
  (typeof INSTITUTE_RELEVANCE_LEVELS)[number];

export type KnowledgeCardMetadata = {
  difficulty: KnowledgeDifficultyLevel;
  estimatedMinutes?: number;
  businessStages: BusinessStageId[];
  adhdRelevance: InstituteRelevanceLevel;
  aiRelevance: InstituteRelevanceLevel;
};

export const KNOWLEDGE_RELATIONSHIP_KINDS = [
  "related",
  "prerequisite",
  "advanced",
  "recommended_next",
] as const;

export type KnowledgeRelationshipKind =
  (typeof KNOWLEDGE_RELATIONSHIP_KINDS)[number];

export type KnowledgeRelationshipDefinition = {
  id: string;
  fromKnowledgeCardId: string;
  toKnowledgeCardId: string;
  kind: KnowledgeRelationshipKind;
  strength?: number;
  reasonKey?: string;
};

export type SuggestedLearningPathDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  pillarId?: InstitutePillarId;
  departmentId?: string;
  drawerId?: string;
  competencyIds: string[];
  knowledgeCardIds: string[];
  sortOrder: number;
  publishedAt?: string;
};

// ── Master knowledge object ─────────────────────────────────────────────────

/**
 * Knowledge Card — the single canonical knowledge object.
 * All experiences, cabinet items, journal links, and evidence reference this id.
 */
export type KnowledgeCardDefinition = IntelligenceReadyHooks & {
  kind: "knowledge-card";
  id: string;
  topicId: string;
  drawerId: string;
  departmentId: string;
  slug: string;
  title: string;
  summary: string;
  /** Longer description — resolved from CMS; may mirror summary in V1 */
  description?: string;
  /** Structured metadata envelope for filtering and recommendations */
  metadata?: KnowledgeCardMetadata;
  /** Competencies this card develops */
  competencyIds: string[];
  perspectiveIds: string[];
  /** Experience definition ids available for this card */
  experienceDefinitionIds: string[];
  /** Relationship shortcuts — also expressible in catalog.relationships */
  relatedKnowledgeCardIds?: string[];
  prerequisiteKnowledgeCardIds?: string[];
  advancedKnowledgeCardIds?: string[];
  suggestedNextKnowledgeCardIds?: string[];
  tags: string[];
  publishedAt?: string;
  version: string;
};

// ── Learning experience types ─────────────────────────────────────────────────

export const LEARNING_EXPERIENCE_TYPE_IDS = [
  "business_mastery_minute",
  "guided_lesson",
  "deep_lesson",
  "deep_workshop",
  "strategy_collection",
  "thinking_gym",
  "business_lab",
  "simulation",
  "apprenticeship",
  "reflection",
  "challenge",
  "coaching_session",
  "apply_to_my_business",
] as const;

export type LearningExperienceTypeId =
  (typeof LEARNING_EXPERIENCE_TYPE_IDS)[number];

export const LEARNING_EXPERIENCE_TYPE_LABELS: Record<
  LearningExperienceTypeId,
  string
> = {
  business_mastery_minute: "Business Mastery Minute",
  guided_lesson: "Guided Lesson",
  deep_lesson: "Deep Lesson",
  deep_workshop: "Deep Workshop",
  strategy_collection: "Strategy Collection",
  thinking_gym: "Thinking Gym",
  business_lab: "Business Lab",
  simulation: "Simulation",
  apprenticeship: "Apprenticeship",
  reflection: "Reflection",
  challenge: "Challenge",
  coaching_session: "Coaching Session",
  apply_to_my_business: "Apply To My Business",
};

/** Shared base for every experience definition — always references a Knowledge Card. */
export type LearningExperienceDefinitionBase = IntelligenceReadyHooks & {
  id: string;
  kind: LearningExperienceTypeId;
  knowledgeCardId: string;
  topicId: string;
  drawerId: string;
  departmentId: string;
  title: string;
  summary: string;
  /** Estimated minutes — optional guidance for scheduling */
  estimatedMinutes?: number;
  competencyIds: string[];
  /** Lifecycle stages this experience supports (subset of full flow) */
  lifecycleStages: InstituteLifecycleStageId[];
  publishedAt?: string;
  version: string;
};

export type BusinessMasteryMinuteDefinition = LearningExperienceDefinitionBase & {
  kind: "business_mastery_minute";
};

export type GuidedLessonDefinition = LearningExperienceDefinitionBase & {
  kind: "guided_lesson";
};

export type DeepLessonDefinition = LearningExperienceDefinitionBase & {
  kind: "deep_lesson";
};

export type DeepWorkshopDefinition = LearningExperienceDefinitionBase & {
  kind: "deep_workshop";
};

export type StrategyCollectionDefinition = LearningExperienceDefinitionBase & {
  kind: "strategy_collection";
};

export type ThinkingGymDefinition = LearningExperienceDefinitionBase & {
  kind: "thinking_gym";
};

export type BusinessLabDefinition = LearningExperienceDefinitionBase & {
  kind: "business_lab";
};

export type SimulationDefinition = LearningExperienceDefinitionBase & {
  kind: "simulation";
};

export type ApprenticeshipDefinition = LearningExperienceDefinitionBase & {
  kind: "apprenticeship";
};

export type ChallengeDefinition = LearningExperienceDefinitionBase & {
  kind: "challenge";
};

export type ReflectionDefinition = LearningExperienceDefinitionBase & {
  kind: "reflection";
};

export type CoachingConversationDefinition = LearningExperienceDefinitionBase & {
  kind: "coaching_session";
};

export type ApplyToMyBusinessDefinition = LearningExperienceDefinitionBase & {
  kind: "apply_to_my_business";
};

export type LearningExperienceDefinition =
  | BusinessMasteryMinuteDefinition
  | GuidedLessonDefinition
  | DeepLessonDefinition
  | DeepWorkshopDefinition
  | StrategyCollectionDefinition
  | ThinkingGymDefinition
  | BusinessLabDefinition
  | SimulationDefinition
  | ApprenticeshipDefinition
  | ChallengeDefinition
  | ReflectionDefinition
  | CoachingConversationDefinition
  | ApplyToMyBusinessDefinition;

// ── Learning lifecycle (every experience) ─────────────────────────────────

export const INSTITUTE_LIFECYCLE_STAGE_IDS = [
  "discover",
  "learn",
  "reflect",
  "make_it_mine",
  "coach_with_shari",
  "apply_in_my_business",
  "return_and_share",
  "evidence_vault",
  "growth_profile",
] as const;

export type InstituteLifecycleStageId =
  (typeof INSTITUTE_LIFECYCLE_STAGE_IDS)[number];

export const INSTITUTE_LIFECYCLE_ORDER: readonly InstituteLifecycleStageId[] =
  INSTITUTE_LIFECYCLE_STAGE_IDS;

export const INSTITUTE_LIFECYCLE_LABELS: Record<
  InstituteLifecycleStageId,
  string
> = {
  discover: "Discover",
  learn: "Learn",
  reflect: "Reflect",
  make_it_mine: "Make It Mine",
  coach_with_shari: "Coach With Shari",
  apply_in_my_business: "Apply In My Business",
  return_and_share: "Return & Share Results",
  evidence_vault: "Evidence Vault",
  growth_profile: "Growth Profile",
};

/** Stages that require member permission before proceeding */
export const PERMISSION_GATED_LIFECYCLE_STAGES: readonly InstituteLifecycleStageId[] =
  ["make_it_mine", "coach_with_shari", "evidence_vault"] as const;

/** Stages updated automatically — no permission prompt */
export const AUTOMATIC_LIFECYCLE_STAGES: readonly InstituteLifecycleStageId[] =
  ["growth_profile"] as const;

// ── Make It Mine ───────────────────────────────────────────────────────────

export type MakeItMineIntent =
  | "create_my_plan"
  | "improve_my_pricing"
  | "solve_my_challenge"
  | "adapt_strategy"
  | "custom";

export type MakeItMineDefinition = {
  knowledgeCardId: string;
  experienceDefinitionId: string;
  intent: MakeItMineIntent;
  /** Conversation seed — Shari adapts to member business */
  coachingPromptKey: string;
  outcomeLabel: string;
};

// ── My Institute Cabinet ───────────────────────────────────────────────────

/** Cabinet reference — never duplicates lesson content */
export type InstituteCabinetReferenceDefinition = {
  knowledgeCardId: string;
  experienceDefinitionId?: string;
  drawerId: string;
  departmentId: string;
  topicId: string;
  label: string;
};

// ── Growth Profile ─────────────────────────────────────────────────────────

export type GrowthCompetencyDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  pillarId?: InstitutePillarId;
  departmentId?: string;
  parentCompetencyId?: string;
};

// GrowthCompetencyLevel — see @/lib/sparkCompetencyFramework/types

// ── Evidence Vault ─────────────────────────────────────────────────────────

/**
 * Evidence opportunity — surfaced on Return Later, never auto-created.
 * Real-world outcome required; permission before save.
 */
export type EvidenceOpportunityDefinition = {
  knowledgeCardId: string;
  experienceDefinitionId: string;
  /** Prompt keys for Shari when member shares results */
  celebrationPromptKey: string;
  evidencePromptKey: string;
};

// ── The Return ─────────────────────────────────────────────────────────────

export type ReturnClosingDefinition = {
  id: string;
  knowledgeCardId?: string;
  experienceDefinitionId?: string;
  /** Template key — copy resolved at runtime, not hard-coded in engine */
  closingPromptKey: string;
};

export const DEFAULT_RETURN_CLOSING_KEY = "institute.return.standard";

// ── Full catalog bundle (data-driven load target) ───────────────────────────

export type MomentumInstituteCatalog = {
  institute: MomentumInstituteDefinition;
  competencyFramework: SparkCompetencyFrameworkV1;
  pillars: SparkCompetencyFrameworkV1["pillars"];
  perspectives: KnowledgePerspectiveDefinition[];
  departments: InstituteDepartmentDefinition[];
  drawers: InstituteDrawerDefinition[];
  topics: InstituteTopicDefinition[];
  knowledgeCards: KnowledgeCardDefinition[];
  experiences: LearningExperienceDefinition[];
  competencies: GrowthCompetencyDefinition[];
  relationships?: KnowledgeRelationshipDefinition[];
  learningPaths?: SuggestedLearningPathDefinition[];
  makeItMineTemplates: MakeItMineDefinition[];
  returnClosings: ReturnClosingDefinition[];
  evidenceOpportunityTemplates: EvidenceOpportunityDefinition[];
  /** Which ecosystem destinations each experience type may connect to */
  ecosystemLinks?: Partial<
    Record<LearningExperienceTypeId, PersonalLearningEcosystemDestination[]>
  >;
  /** Recommended experience types per time slot */
  timeSlotRecommendations?: Partial<
    Record<LearningTimeSlotId, LearningExperienceTypeId[]>
  >;
};
