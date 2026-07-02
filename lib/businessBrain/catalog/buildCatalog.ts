/**
 * Bridge Spark Curriculum Master Index™ → Business Brain OS models.
 */

import { SPARK_COMPETENCY_FRAMEWORK_V1 } from "@/lib/sparkCompetencyFramework/competencyFrameworkV1";
import { SPARK_CURRICULUM_MASTER_INDEX } from "@/lib/sparkCurriculumMasterIndex/masterIndex";
import type { CurriculumMasterIndexEntry } from "@/lib/sparkCurriculumMasterIndex/types";
import { DEPARTMENT_COUNCIL_SEEDS } from "../knowledgeCouncil/departmentCouncil";
import type {
  BrainCompetency,
  BrainCurriculumTopic,
  BrainDrawer,
  BrainKnowledgeCard,
  BrainLearningExperience,
  BrainPillar,
  BrainDepartment,
  BusinessBrainCatalog,
} from "../types";
import { BUSINESS_BRAIN_VERSION } from "../types";
import { EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS } from "../sourceIntegrity/types";
import { filterSourcesEligibleForTeaching } from "../sourceIntegrity/validators";
import { buildKnowledgeCouncil } from "../knowledgeCouncil";

function curriculumToTopic(
  entry: CurriculumMasterIndexEntry,
): BrainCurriculumTopic {
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    shortDescription: entry.shortDescription,
    capabilityFocus: entry.capabilityFocus,
    pillarId: entry.pillarId,
    departmentId: entry.departmentId,
    drawerId: entry.drawerId,
    competencyIds: entry.primaryCompetencies.map((s) => `comp-${s}`),
    businessStages: entry.businessStages,
    adhdRelevance: entry.adhdRelevance,
    aiRelevance: entry.aiRelevance,
    difficulty: entry.difficulty,
    estimatedMinutes: entry.estimatedMinutes,
    relatedTopicIds: entry.relatedTopicSlugs,
    experienceKindIds: entry.futureLearningExperiences.filter(
      (k) => k !== "knowledge_card",
    ),
    status: entry.status,
    sortOrder: entry.sortOrder,
  };
}

function curriculumToKnowledgeCard(
  entry: CurriculumMasterIndexEntry,
  department: BrainDepartment,
  allSources: ReturnType<typeof buildKnowledgeCouncil>["knowledgeSources"],
): BrainKnowledgeCard {
  const schoolIds = department.schoolOfThoughtIds;
  const teachingSources = filterSourcesEligibleForTeaching(
    allSources.filter((s) => department.knowledgeSourceIds.includes(s.id)),
  );
  const disciplineIds = department.researchDisciplineIds;

  return {
    id: entry.id,
    curriculumTopicId: entry.id,
    slug: entry.slug,
    title: entry.title,
    summary: entry.shortDescription,
    description: entry.shortDescription,
    pillarId: entry.pillarId,
    departmentId: entry.departmentId,
    drawerId: entry.drawerId,
    competencyIds: entry.primaryCompetencies.map((s) => `comp-${s}`),
    schoolOfThoughtIds: schoolIds,
    sourceIds: teachingSources.map((s) => s.id),
    disciplineIds,
    metadata: {
      difficulty: entry.difficulty,
      estimatedMinutes: entry.estimatedMinutes,
      businessStages: entry.businessStages,
      adhdRelevance: entry.adhdRelevance,
      aiRelevance: entry.aiRelevance,
    },
    experienceIds: entry.futureLearningExperiences
      .filter((k) => k !== "knowledge_card")
      .map((k) => `exp-${entry.id}-${k}`),
    contentLayers: { ...EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS },
    version: BUSINESS_BRAIN_VERSION,
    status: entry.status,
  };
}

function plannedExperiencesForCard(
  card: BrainKnowledgeCard,
  topic: BrainCurriculumTopic,
): BrainLearningExperience[] {
  return topic.experienceKindIds.map((kind) => ({
    id: `exp-${card.id}-${kind}`,
    kind,
    knowledgeCardId: card.id,
    curriculumTopicId: topic.id,
    title: `${card.title} — ${kind.replace(/_/g, " ")}`,
    summary: `Planned ${kind} for ${card.title}. No lesson body yet.`,
    estimatedMinutes: card.metadata.estimatedMinutes,
    competencyIds: card.competencyIds,
    version: BUSINESS_BRAIN_VERSION,
    status: "planned" as const,
    ...(kind === "apprenticeship" ? { weekCount: 4 } : {}),
  }));
}

function buildCompetencies(): BrainCompetency[] {
  const slugs = SPARK_CURRICULUM_MASTER_INDEX.competencySlugs;
  return slugs.map((slug) => ({
    id: `comp-${slug}`,
    slug,
    title: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: `Capability: ${slug.replace(/-/g, " ")}.`,
    capabilityStatement: `Develop ${slug.replace(/-/g, " ")} capability in real business contexts.`,
  }));
}

function buildDrawers(
  topics: BrainCurriculumTopic[],
): BrainDrawer[] {
  const drawerMap = new Map<string, BrainDrawer>();

  for (const topic of topics) {
    const existing = drawerMap.get(topic.drawerId);
    if (existing) {
      existing.topicIds.push(topic.id);
      continue;
    }
    const curriculumEntry = SPARK_CURRICULUM_MASTER_INDEX.entries.find(
      (e) => e.drawerId === topic.drawerId,
    );
    drawerMap.set(topic.drawerId, {
      id: topic.drawerId,
      departmentId: topic.departmentId,
      pillarId: topic.pillarId,
      slug: curriculumEntry?.drawerSlug ?? topic.drawerId,
      title: curriculumEntry?.drawerTitle ?? topic.drawerId,
      description: `Drawer for ${curriculumEntry?.drawerTitle ?? topic.drawerId}.`,
      topicIds: [topic.id],
      sortOrder: curriculumEntry?.sortOrder ?? 0,
    });
  }

  return [...drawerMap.values()];
}

function buildDepartments(
  topics: BrainCurriculumTopic[],
  drawers: BrainDrawer[],
): BrainDepartment[] {
  return DEPARTMENT_COUNCIL_SEEDS.map((seed) => {
    const deptTopics = topics.filter((t) => t.departmentId === seed.id);
    const deptDrawers = drawers.filter((d) => d.departmentId === seed.id);
    return {
      ...seed,
      drawerIds: deptDrawers.map((d) => d.id),
      topicIds: deptTopics.map((t) => t.id),
    };
  });
}

function buildPillars(departments: BrainDepartment[]): BrainPillar[] {
  return SPARK_COMPETENCY_FRAMEWORK_V1.pillars.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    description: p.description,
    departmentIds: departments
      .filter((d) => d.pillarId === p.id)
      .map((d) => d.id),
    sortOrder: p.sortOrder,
  }));
}

/** Assemble full Business Brain catalog from curriculum + council data */
export function buildBusinessBrainCatalog(): BusinessBrainCatalog {
  const council = buildKnowledgeCouncil();
  const topics = SPARK_CURRICULUM_MASTER_INDEX.entries.map(curriculumToTopic);

  const drawers = buildDrawers(topics);
  const departments = buildDepartments(topics, drawers);
  const pillars = buildPillars(departments);
  const competencies = buildCompetencies();

  const knowledgeCards = SPARK_CURRICULUM_MASTER_INDEX.entries.map((entry) => {
    const dept =
      departments.find((d) => d.id === entry.departmentId) ??
      ({
        ...DEPARTMENT_COUNCIL_SEEDS.find((s) => s.id === entry.departmentId)!,
        drawerIds: [],
        topicIds: [],
      } as BrainDepartment);
    return curriculumToKnowledgeCard(entry, dept, council.knowledgeSources);
  });

  const topicById = new Map(topics.map((t) => [t.id, t]));
  const learningExperiences = knowledgeCards.flatMap((card) => {
    const topic = topicById.get(card.curriculumTopicId);
    if (!topic) return [];
    return plannedExperiencesForCard(card, topic);
  });

  return {
    version: BUSINESS_BRAIN_VERSION,
    knowledgeCouncil: council,
    pillars,
    departments,
    drawers,
    competencies,
    curriculumTopics: topics,
    knowledgeCards,
    learningExperiences,
  };
}
