/**
 * Builder for consistent curriculum index rows.
 */

import type { InstitutePillarId } from "@/lib/sparkCompetencyFramework/types";
import type {
  BusinessStageId,
  InstituteRelevanceLevel,
  KnowledgeDifficultyLevel,
} from "@/lib/sparkMomentumInstitute/types";
import type {
  CurriculumExperienceKind,
  CurriculumMasterIndexEntry,
} from "./types";

export type BuildCurriculumEntryInput = {
  pillarId: InstitutePillarId;
  departmentId: string;
  departmentTitle: string;
  drawerSlug: string;
  drawerTitle: string;
  slug: string;
  title: string;
  shortDescription: string;
  capabilityFocus: string;
  primaryCompetencies: string[];
  businessStages: BusinessStageId[];
  adhdRelevance: InstituteRelevanceLevel;
  aiRelevance: InstituteRelevanceLevel;
  difficulty: KnowledgeDifficultyLevel;
  estimatedMinutes: number;
  relatedTopicSlugs?: string[];
  futureLearningExperiences: CurriculumExperienceKind[];
  sortOrder: number;
  status?: CurriculumMasterIndexEntry["status"];
};

export function buildCurriculumEntry(
  input: BuildCurriculumEntryInput,
): CurriculumMasterIndexEntry {
  const drawerId = `drawer-${input.departmentId.replace(/^dept-/, "")}-${input.drawerSlug}`;
  return {
    id: `cmi-${input.departmentId.replace(/^dept-/, "")}-${input.drawerSlug}-${input.slug}`,
    pillarId: input.pillarId,
    departmentId: input.departmentId,
    departmentTitle: input.departmentTitle,
    drawerId,
    drawerSlug: input.drawerSlug,
    drawerTitle: input.drawerTitle,
    slug: input.slug,
    title: input.title,
    shortDescription: input.shortDescription,
    capabilityFocus: input.capabilityFocus,
    primaryCompetencies: input.primaryCompetencies,
    businessStages: input.businessStages,
    adhdRelevance: input.adhdRelevance,
    aiRelevance: input.aiRelevance,
    difficulty: input.difficulty,
    estimatedMinutes: input.estimatedMinutes,
    relatedTopicSlugs: input.relatedTopicSlugs ?? [],
    futureLearningExperiences: input.futureLearningExperiences,
    sortOrder: input.sortOrder,
    status: input.status ?? "planned",
  };
}

/** Standard experience bundles by topic depth */
export const EXPERIENCE_BUNDLES = {
  foundational: [
    "knowledge_card",
    "business_mastery_minute",
    "reflection",
    "worksheet",
  ] as CurriculumExperienceKind[],
  core: [
    "knowledge_card",
    "business_mastery_minute",
    "deep_lesson",
    "strategy_collection",
    "reflection",
    "apply_to_my_business",
    "coaching_session",
  ] as CurriculumExperienceKind[],
  practice: [
    "knowledge_card",
    "business_mastery_minute",
    "deep_lesson",
    "business_lab",
    "simulation",
    "challenge",
    "reflection",
    "apply_to_my_business",
  ] as CurriculumExperienceKind[],
  mastery: [
    "knowledge_card",
    "business_mastery_minute",
    "deep_lesson",
    "strategy_collection",
    "business_lab",
    "simulation",
    "challenge",
    "apprenticeship",
    "thinking_gym",
    "reflection",
    "worksheet",
    "coaching_session",
    "apply_to_my_business",
  ] as CurriculumExperienceKind[],
  adhd: [
    "knowledge_card",
    "business_mastery_minute",
    "deep_lesson",
    "thinking_gym",
    "reflection",
    "worksheet",
    "coaching_session",
    "apply_to_my_business",
  ] as CurriculumExperienceKind[],
  legacy: [
    "knowledge_card",
    "business_mastery_minute",
    "deep_lesson",
    "strategy_collection",
    "business_lab",
    "challenge",
    "apprenticeship",
    "reflection",
    "coaching_session",
    "apply_to_my_business",
  ] as CurriculumExperienceKind[],
};
