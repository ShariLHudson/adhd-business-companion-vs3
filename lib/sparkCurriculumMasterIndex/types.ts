/**
 * Spark Curriculum Master Index™ — Phase 4
 * Permanent curriculum roadmap. Structure only — no lesson content.
 *
 * @see docs/SPARK_CURRICULUM_MASTER_INDEX.md
 */

import type { InstitutePillarId } from "@/lib/sparkCompetencyFramework/types";
import type {
  BusinessStageId,
  InstituteRelevanceLevel,
  KnowledgeDifficultyLevel,
} from "@/lib/sparkMomentumInstitute/types";

export const CURRICULUM_INDEX_VERSION = "1.0.0" as const;

/** Future learning experience kinds a topic may eventually offer */
export const CURRICULUM_EXPERIENCE_KINDS = [
  "knowledge_card",
  "business_mastery_minute",
  "strategy_collection",
  "deep_lesson",
  "business_lab",
  "simulation",
  "challenge",
  "apprenticeship",
  "reflection",
  "worksheet",
  "thinking_gym",
  "coaching_session",
  "apply_to_my_business",
] as const;

export type CurriculumExperienceKind =
  (typeof CURRICULUM_EXPERIENCE_KINDS)[number];

export const CURRICULUM_EXPERIENCE_LABELS: Record<
  CurriculumExperienceKind,
  string
> = {
  knowledge_card: "Knowledge Card™",
  business_mastery_minute: "Business Mastery Minute™",
  strategy_collection: "Strategy Collection™",
  deep_lesson: "Deep Lesson™",
  business_lab: "Business Lab™",
  simulation: "Simulation™",
  challenge: "Challenge™",
  apprenticeship: "Apprenticeship™",
  reflection: "Reflection™",
  worksheet: "Worksheet™",
  thinking_gym: "Thinking Gym™",
  coaching_session: "Coaching Session™",
  apply_to_my_business: "Apply To My Business™",
};

/**
 * One row in the master curriculum — maps 1:1 to a future Knowledge Card™.
 * Every field is data-driven; bodies load later from CMS.
 */
export type CurriculumMasterIndexEntry = {
  /** Stable id — becomes Knowledge Card id in catalog */
  id: string;
  pillarId: InstitutePillarId;
  departmentId: string;
  departmentTitle: string;
  drawerId: string;
  drawerSlug: string;
  drawerTitle: string;
  slug: string;
  title: string;
  shortDescription: string;
  /** Capability this topic develops — the curriculum's north star */
  capabilityFocus: string;
  primaryCompetencies: string[];
  businessStages: BusinessStageId[];
  adhdRelevance: InstituteRelevanceLevel;
  aiRelevance: InstituteRelevanceLevel;
  difficulty: KnowledgeDifficultyLevel;
  estimatedMinutes: number;
  relatedTopicSlugs: string[];
  futureLearningExperiences: CurriculumExperienceKind[];
  sortOrder: number;
  status: "planned" | "in_production" | "published";
};

export type CurriculumMasterIndex = {
  version: typeof CURRICULUM_INDEX_VERSION;
  title: string;
  mission: string;
  entries: CurriculumMasterIndexEntry[];
  competencySlugs: string[];
  generatedAt: string;
};

export type CurriculumIndexStats = {
  totalTopics: number;
  byPillar: Record<InstitutePillarId, number>;
  byDepartment: Record<string, number>;
  byDrawer: Record<string, number>;
  experienceKindCoverage: Record<CurriculumExperienceKind, number>;
};
