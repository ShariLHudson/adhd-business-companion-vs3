/**
 * Spark Curriculum Master Index — merged curriculum.
 */

import type { InstitutePillarId } from "@/lib/sparkCompetencyFramework/types";
import { BUILD_YOURSELF_CURRICULUM } from "./curriculum/buildYourself";
import { BUILD_YOUR_BUSINESS_CURRICULUM } from "./curriculum/buildYourBusiness";
import { BUILD_YOUR_THINKING_CURRICULUM } from "./curriculum/buildYourThinking";
import { BUILD_YOUR_LEGACY_CURRICULUM } from "./curriculum/buildYourLegacy";
import { CURRICULUM_COMPETENCY_SLUGS } from "./competencies";
import type {
  CurriculumExperienceKind,
  CurriculumIndexStats,
  CurriculumMasterIndex,
  CurriculumMasterIndexEntry,
} from "./types";
import { CURRICULUM_INDEX_VERSION } from "./types";

export const SPARK_CURRICULUM_MASTER_INDEX: CurriculumMasterIndex = {
  version: CURRICULUM_INDEX_VERSION,
  title: "Spark Curriculum Master Index",
  mission: "Help every member become a better entrepreneur.",
  entries: [
    ...BUILD_YOURSELF_CURRICULUM,
    ...BUILD_YOUR_BUSINESS_CURRICULUM,
    ...BUILD_YOUR_THINKING_CURRICULUM,
    ...BUILD_YOUR_LEGACY_CURRICULUM,
  ],
  competencySlugs: [...CURRICULUM_COMPETENCY_SLUGS],
  generatedAt: "2026-06-30T00:00:00.000Z",
};

export function getAllCurriculumEntries(): CurriculumMasterIndexEntry[] {
  return SPARK_CURRICULUM_MASTER_INDEX.entries;
}

export function getCurriculumByPillar(
  pillarId: InstitutePillarId,
): CurriculumMasterIndexEntry[] {
  return SPARK_CURRICULUM_MASTER_INDEX.entries.filter(
    (e) => e.pillarId === pillarId,
  );
}

export function getCurriculumByDepartment(
  departmentId: string,
): CurriculumMasterIndexEntry[] {
  return SPARK_CURRICULUM_MASTER_INDEX.entries.filter(
    (e) => e.departmentId === departmentId,
  );
}

export function getCurriculumByDrawer(
  drawerId: string,
): CurriculumMasterIndexEntry[] {
  return SPARK_CURRICULUM_MASTER_INDEX.entries.filter(
    (e) => e.drawerId === drawerId,
  );
}

export function getCurriculumEntryById(
  id: string,
): CurriculumMasterIndexEntry | null {
  return SPARK_CURRICULUM_MASTER_INDEX.entries.find((e) => e.id === id) ?? null;
}

export function getCurriculumEntryBySlug(
  slug: string,
): CurriculumMasterIndexEntry | null {
  return (
    SPARK_CURRICULUM_MASTER_INDEX.entries.find((e) => e.slug === slug) ?? null
  );
}

export function computeCurriculumStats(
  entries: CurriculumMasterIndexEntry[] = SPARK_CURRICULUM_MASTER_INDEX.entries,
): CurriculumIndexStats {
  const byPillar: Record<InstitutePillarId, number> = {
    build_yourself: 0,
    build_your_business: 0,
    build_your_thinking: 0,
    build_your_legacy: 0,
  };
  const byDepartment: Record<string, number> = {};
  const byDrawer: Record<string, number> = {};
  const experienceKindCoverage = {} as Record<CurriculumExperienceKind, number>;

  for (const entry of entries) {
    byPillar[entry.pillarId]++;
    byDepartment[entry.departmentId] =
      (byDepartment[entry.departmentId] ?? 0) + 1;
    byDrawer[entry.drawerId] = (byDrawer[entry.drawerId] ?? 0) + 1;
    for (const kind of entry.futureLearningExperiences) {
      experienceKindCoverage[kind] = (experienceKindCoverage[kind] ?? 0) + 1;
    }
  }

  return {
    totalTopics: entries.length,
    byPillar,
    byDepartment,
    byDrawer,
    experienceKindCoverage,
  };
}

/** Serialize for JSON export / CMS import */
export function curriculumMasterIndexToJson(): string {
  return JSON.stringify(SPARK_CURRICULUM_MASTER_INDEX, null, 2);
}

/** Convert curriculum row to Knowledge Card catalog seed shape (still no lesson body) */
export function curriculumEntryToKnowledgeCardSeed(
  entry: CurriculumMasterIndexEntry,
) {
  return {
    kind: "knowledge-card" as const,
    id: entry.id,
    topicId: `topic-${entry.drawerId}-${entry.slug}`,
    drawerId: entry.drawerId,
    departmentId: entry.departmentId,
    slug: entry.slug,
    title: entry.title,
    summary: entry.shortDescription,
    description: entry.shortDescription,
    metadata: {
      difficulty: entry.difficulty,
      estimatedMinutes: entry.estimatedMinutes,
      businessStages: entry.businessStages,
      adhdRelevance: entry.adhdRelevance,
      aiRelevance: entry.aiRelevance,
    },
    competencyIds: entry.primaryCompetencies.map((s) => `comp-${s}`),
    perspectiveIds: [],
    experienceDefinitionIds: [],
    relatedKnowledgeCardIds: [],
    prerequisiteKnowledgeCardIds: [],
    suggestedNextKnowledgeCardIds: entry.relatedTopicSlugs.map(
      (s) => `cmi-${s}`,
    ),
    tags: [entry.drawerSlug, entry.departmentId.replace(/^dept-/, "")],
    version: CURRICULUM_INDEX_VERSION,
    capabilityFocus: entry.capabilityFocus,
    futureLearningExperiences: entry.futureLearningExperiences,
    status: entry.status,
  };
}
