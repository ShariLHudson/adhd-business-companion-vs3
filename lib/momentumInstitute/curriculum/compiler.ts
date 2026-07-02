/**
 * Compile curriculum documents into runtime catalog definitions.
 */

import type {
  KnowledgeCardDefinition,
  LearningExperienceDefinition,
  MomentumInstituteCatalog,
} from "@/lib/sparkMomentumInstitute/types";
import type { CurriculumKnowledgeCardDocument } from "./types";

const DIFFICULTY_LABELS = {
  foundational: "Foundational",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
} as const;

export function curriculumCardToKnowledgeCardDefinition(
  doc: CurriculumKnowledgeCardDocument,
): KnowledgeCardDefinition {
  const { metadata: m, body } = doc;
  const departmentId = slugToDepartmentId(m.department);
  const drawerId = slugToDrawerId(m.drawer, departmentId);
  const topicId = `topic-${drawerId}`;

  const relatedIds =
    m.related_cards ??
    body.relatedKnowledgeCards.map((r) => r.id);

  return {
    kind: "knowledge-card",
    id: m.id,
    topicId,
    drawerId,
    departmentId,
    slug: slugify(m.id),
    title: m.title,
    summary: body.corePrinciple || body.whyThisMatters.slice(0, 200),
    description: body.whyThisMatters,
    metadata: {
      difficulty: m.difficulty,
      estimatedMinutes: m.estimated_time,
      businessStages: ["all"],
      adhdRelevance: "medium",
      aiRelevance: "medium",
    },
    competencyIds: m.competencies,
    perspectiveIds: [],
    experienceDefinitionIds: experienceIdsForCard(m.id),
    relatedKnowledgeCardIds: relatedIds,
    suggestedNextKnowledgeCardIds: relatedIds.slice(0, 1),
    tags: [m.department, m.drawer, m.college, `author:${m.author}`].filter(
      Boolean,
    ) as string[],
    publishedAt: m.status === "published" ? m.last_updated : undefined,
    version: m.version,
  };
}

export function curriculumCardToBusinessMasteryMinuteExperience(
  doc: CurriculumKnowledgeCardDocument,
): LearningExperienceDefinition {
  const cardId = doc.metadata.id;
  const departmentId = slugToDepartmentId(doc.metadata.department);
  const drawerId = slugToDrawerId(doc.metadata.drawer, departmentId);
  const topicId = `topic-${drawerId}`;

  return {
    id: `bmm-${cardId}`,
    kind: "business_mastery_minute",
    knowledgeCardId: cardId,
    topicId,
    drawerId,
    departmentId,
    title: `${doc.metadata.title} — Business Mastery Minute™`,
    summary:
      doc.body.corePrinciple ||
      `A fast grounding on ${doc.metadata.title}.`,
    estimatedMinutes: Math.min(doc.metadata.estimated_time, 5),
    competencyIds: doc.metadata.competencies,
    lifecycleStages: ["discover", "learn", "reflect"],
    version: doc.metadata.version,
  };
}

export function mergeCurriculumIntoCatalog(
  base: MomentumInstituteCatalog,
  documents: CurriculumKnowledgeCardDocument[],
  opts?: { publishedOnly?: boolean },
): MomentumInstituteCatalog {
  const publishedOnly = opts?.publishedOnly ?? true;
  const docs = publishedOnly ?
    documents.filter((d) => d.metadata.status === "published")
  : documents;

  if (docs.length === 0) return base;

  const cardDefs = docs.map(curriculumCardToKnowledgeCardDefinition);
  const experiences = docs.map(curriculumCardToBusinessMasteryMinuteExperience);

  const cardIds = new Set(cardDefs.map((c) => c.id));
  const existingCards = base.knowledgeCards.filter((c) => !cardIds.has(c.id));
  const experienceIds = new Set(experiences.map((e) => e.id));
  const existingExperiences = base.experiences.filter(
    (e) => !experienceIds.has(e.id),
  );

  const departments = mergeDepartments(base, cardDefs);
  const drawers = mergeDrawers(base, cardDefs);
  const topics = mergeTopics(base, cardDefs);

  return {
    ...base,
    institute: {
      ...base.institute,
      version: bumpPatchVersion(base.institute.version),
    },
    departments,
    drawers,
    topics,
    knowledgeCards: [...existingCards, ...cardDefs],
    experiences: [...existingExperiences, ...experiences],
  };
}

function mergeDepartments(
  base: MomentumInstituteCatalog,
  cards: KnowledgeCardDefinition[],
) {
  const map = new Map(base.departments.map((d) => [d.id, d]));
  for (const card of cards) {
    if (map.has(card.departmentId)) continue;
    map.set(card.departmentId, {
      id: card.departmentId,
      instituteId: base.institute.id,
      pillarId: "build_your_business",
      slug: card.departmentId.replace(/^dept-/, ""),
      title: titleCase(card.departmentId.replace(/^dept-/, "").replace(/-/g, " ")),
      description: `${titleCase(card.departmentId.replace(/^dept-/, ""))} — Momentum Institute™`,
      drawerIds: [],
      sortOrder: map.size + 1,
      competencyIds: card.competencyIds,
    });
  }
  return [...map.values()];
}

function mergeDrawers(
  base: MomentumInstituteCatalog,
  cards: KnowledgeCardDefinition[],
) {
  const map = new Map(base.drawers.map((d) => [d.id, d]));
  for (const card of cards) {
    if (map.has(card.drawerId)) continue;
    map.set(card.drawerId, {
      id: card.drawerId,
      departmentId: card.departmentId,
      pillarId: "build_your_business",
      slug: card.drawerId.replace(/^drawer-/, ""),
      title: titleCase(card.drawerId.replace(/^drawer-/, "").replace(/-/g, " ")),
      description: `Knowledge collection — ${card.title}`,
      topicIds: [card.topicId],
      sortOrder: map.size + 1,
    });
  }
  return [...map.values()];
}

function mergeTopics(
  base: MomentumInstituteCatalog,
  cards: KnowledgeCardDefinition[],
) {
  const map = new Map(base.topics.map((t) => [t.id, t]));
  for (const card of cards) {
    if (map.has(card.topicId)) continue;
    map.set(card.topicId, {
      id: card.topicId,
      drawerId: card.drawerId,
      departmentId: card.departmentId,
      slug: card.drawerId.replace(/^drawer-/, ""),
      title: titleCase(card.drawerId.replace(/^drawer-/, "").replace(/-/g, " ")),
      summary: card.summary,
      knowledgeCardIds: [card.id],
      supportedExperienceTypes: ["business_mastery_minute", "apply_to_my_business"],
      competencyIds: card.competencyIds,
      perspectiveIds: [],
      sortOrder: map.size + 1,
    });
  }
  return [...map.values()];
}

function experienceIdsForCard(cardId: string): string[] {
  return [`bmm-${cardId}`];
}

function slugToDepartmentId(department: string): string {
  const slug = slugify(department);
  return slug.startsWith("dept-") ? slug : `dept-${slug}`;
}

function slugToDrawerId(drawer: string, departmentId: string): string {
  const slug = slugify(drawer);
  if (slug.startsWith("drawer-")) return slug;
  return `drawer-${slug}`;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

function bumpPatchVersion(version: string): string {
  const parts = version.split(".").map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return `${parts[0]}.${parts[1]}.${parts[2]! + 1}`;
  }
  return version;
}

export function curriculumDifficultyLabel(
  doc: CurriculumKnowledgeCardDocument,
): string {
  return DIFFICULTY_LABELS[doc.metadata.difficulty];
}
