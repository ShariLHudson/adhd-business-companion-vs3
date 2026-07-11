/**
 * Spark Business Brain — canonical knowledge OS types.
 * Institutional knowledge architecture — not member business memory (Spec 003).
 *
 * @see docs/SPARK_BUSINESS_BRAIN.md
 */

import type { InstitutePillarId } from "@/lib/sparkCompetencyFramework/types";
import type {
  BusinessStageId,
  InstituteRelevanceLevel,
  KnowledgeDifficultyLevel,
} from "@/lib/sparkMomentumInstitute/types";

export const BUSINESS_BRAIN_VERSION = "1.1.0" as const;

/** Internal only — never surfaced to members */
export type BrainVisibility = "internal" | "synthesis_only";

import type { KnowledgeCardContentLayers } from "./sourceIntegrity/types";
import { EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS } from "./sourceIntegrity/types";
import type {
  KnowledgeSourceType,
  SourceConfidenceLevel,
  SourceVerificationStatus,
} from "./sourceIntegrity/types";

export type {
  KnowledgeSourceType,
  SourceVerificationStatus,
  SourceConfidenceLevel,
  KnowledgeClaimKind,
  KnowledgeContentClaim,
  KnowledgeCardContentLayers,
  SourceIntegrityChecklistId,
  SourceIntegrityChecklistAnswers,
  SourceIntegrityChecklistResult,
} from "./sourceIntegrity/types";

// ── Knowledge Council ──────────────────────────────────────────────────────

/** Research discipline — academic or practical field informing Spark */
export type ResearchDiscipline = {
  id: string;
  slug: string;
  title: string;
  description: string;
  visibility: BrainVisibility;
};

/**
 * Knowledge Source — citable reference for internal curation.
 * No source may be invented. Unverified candidates cannot teach final lessons.
 * INTERNAL: author/org used for curation — never shown as expert panel to members.
 */
export type KnowledgeSource = {
  id: string;
  slug: string;
  /** Display title of the work or publication */
  sourceTitle: string;
  /** Author name or publishing organization — required when verified */
  authorOrOrganization: string | null;
  sourceType: KnowledgeSourceType;
  /** ISO date when known — undefined if unknown */
  publicationDate?: string;
  /** URL or internal file reference when available */
  reference?: string;
  referenceKind?: "url" | "file" | "isbn" | "doi" | "internal_ref";
  confidenceLevel: SourceConfidenceLevel;
  verificationStatus: SourceVerificationStatus;
  /** Known limitations, gaps, or scope boundaries */
  limitationNotes: string;
  description: string;
  disciplineIds: string[];
  curationKey?: string;
  visibility: BrainVisibility;
  /** @deprecated use sourceTitle */
  title?: string;
};

/**
 * School of Thought — how Spark synthesizes a perspective into one voice.
 * Users experience Spark's teaching — not a council of experts.
 */
export type SchoolOfThought = {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** How this school informs synthesis — internal editorial note key */
  synthesisKey?: string;
  sourceIds: string[];
  disciplineIds: string[];
  visibility: BrainVisibility;
};

/** Spark Knowledge Council — permanent internal reference */
export type KnowledgeCouncil = {
  version: typeof BUSINESS_BRAIN_VERSION;
  title: string;
  mission: string;
  researchDisciplines: ResearchDiscipline[];
  knowledgeSources: KnowledgeSource[];
  schoolsOfThought: SchoolOfThought[];
  departmentIds: string[];
};

// ── Institute hierarchy (Brain OS layer) ────────────────────────────────────

export type BrainPillar = {
  id: InstitutePillarId;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  departmentIds: string[];
  sortOrder: number;
};

export type BrainDepartment = {
  id: string;
  pillarId: InstitutePillarId;
  slug: string;
  name: string;
  purpose: string;
  knowledgeSourceIds: string[];
  schoolOfThoughtIds: string[];
  researchDisciplineIds: string[];
  coreCompetencyIds: string[];
  drawerIds: string[];
  topicIds: string[];
  sortOrder: number;
};

export type BrainDrawer = {
  id: string;
  departmentId: string;
  pillarId: InstitutePillarId;
  slug: string;
  title: string;
  description: string;
  topicIds: string[];
  sortOrder: number;
};

// ── Competency ──────────────────────────────────────────────────────────────

export type BrainCompetency = {
  id: string;
  slug: string;
  title: string;
  description: string;
  capabilityStatement: string;
  pillarId?: InstitutePillarId;
  departmentId?: string;
  parentCompetencyId?: string;
};

// ── Curriculum & cards ──────────────────────────────────────────────────────

export type BrainCurriculumTopic = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  capabilityFocus: string;
  pillarId: InstitutePillarId;
  departmentId: string;
  drawerId: string;
  competencyIds: string[];
  businessStages: BusinessStageId[];
  adhdRelevance: InstituteRelevanceLevel;
  aiRelevance: InstituteRelevanceLevel;
  difficulty: KnowledgeDifficultyLevel;
  estimatedMinutes: number;
  relatedTopicIds: string[];
  experienceKindIds: BrainExperienceKind[];
  status: "planned" | "in_production" | "published";
  sortOrder: number;
};

/**
 * Knowledge Card — master canonical knowledge object in the Brain OS.
 * Lesson bodies live elsewhere; this is structure + metadata.
 */
export type BrainKnowledgeCard = {
  id: string;
  curriculumTopicId: string;
  slug: string;
  title: string;
  summary: string;
  description?: string;
  pillarId: InstitutePillarId;
  departmentId: string;
  drawerId: string;
  competencyIds: string[];
  schoolOfThoughtIds: string[];
  sourceIds: string[];
  disciplineIds: string[];
  metadata: {
    difficulty: KnowledgeDifficultyLevel;
    estimatedMinutes?: number;
    businessStages: BusinessStageId[];
    adhdRelevance: InstituteRelevanceLevel;
    aiRelevance: InstituteRelevanceLevel;
  };
  experienceIds: string[];
  /** Separated content layers — facts never mixed with synthesis */
  contentLayers: KnowledgeCardContentLayers;
  version: string;
  status: "planned" | "in_production" | "published";
};

export { EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS };

// ── Learning experience kinds ───────────────────────────────────────────────

export const BRAIN_EXPERIENCE_KINDS = [
  "business_mastery_minute",
  "deep_lesson",
  "strategy_collection",
  "business_lab",
  "simulation",
  "challenge",
  "apprenticeship",
  "reflection",
  "worksheet",
  "thinking_gym",
  "coaching_session",
  "apply_to_my_business",
  "guided_lesson",
  "deep_workshop",
] as const;

export type BrainExperienceKind = (typeof BRAIN_EXPERIENCE_KINDS)[number];

export type BrainLearningExperienceBase = {
  id: string;
  kind: BrainExperienceKind;
  knowledgeCardId: string;
  curriculumTopicId: string;
  title: string;
  summary: string;
  estimatedMinutes?: number;
  competencyIds: string[];
  version: string;
  status: "planned" | "in_production" | "published";
};

export type BusinessMasteryMinute = BrainLearningExperienceBase & {
  kind: "business_mastery_minute";
};

export type BusinessLab = BrainLearningExperienceBase & {
  kind: "business_lab";
};

export type Simulation = BrainLearningExperienceBase & {
  kind: "simulation";
};

export type Challenge = BrainLearningExperienceBase & {
  kind: "challenge";
};

export type Apprenticeship = BrainLearningExperienceBase & {
  kind: "apprenticeship";
  weekCount?: number;
};

export type BrainLearningExperience =
  | BusinessMasteryMinute
  | BusinessLab
  | Simulation
  | Challenge
  | Apprenticeship
  | BrainLearningExperienceBase;

// ── Full Brain catalog bundle ─────────────────────────────────────────────────

export type BusinessBrainCatalog = {
  version: typeof BUSINESS_BRAIN_VERSION;
  knowledgeCouncil: KnowledgeCouncil;
  pillars: BrainPillar[];
  departments: BrainDepartment[];
  drawers: BrainDrawer[];
  competencies: BrainCompetency[];
  curriculumTopics: BrainCurriculumTopic[];
  knowledgeCards: BrainKnowledgeCard[];
  learningExperiences: BrainLearningExperience[];
};

export type BusinessBrainCatalogIndex = {
  version: string;
  byDepartmentId: Map<string, BrainDepartment>;
  byDrawerId: Map<string, BrainDrawer>;
  byTopicId: Map<string, BrainCurriculumTopic>;
  byKnowledgeCardId: Map<string, BrainKnowledgeCard>;
  byCompetencyId: Map<string, BrainCompetency>;
  bySourceId: Map<string, KnowledgeSource>;
  bySchoolId: Map<string, SchoolOfThought>;
  byDisciplineId: Map<string, ResearchDiscipline>;
  topicsByDepartmentId: Map<string, string[]>;
  cardsByDrawerId: Map<string, string[]>;
};
