/**
 * Resolves which learning experiences are available for a topic or knowledge card.
 * Data-driven — reads catalog, never hard-codes content.
 */

import type {
  InstituteTopicDefinition,
  KnowledgeCardDefinition,
  LearningExperienceDefinition,
  LearningExperienceTypeId,
} from "@/lib/sparkMomentumInstitute/types";
import {
  getExperienceDefinitionById,
  getKnowledgeCardById,
  getTopicById,
  listExperiencesForKnowledgeCard,
  loadInstituteCatalog,
} from "./catalog/provider";
import { defaultLifecycleStagesForExperienceType } from "./lifecycle";

export type ResolvedExperienceAvailability = {
  experience: LearningExperienceDefinition;
  knowledgeCard: KnowledgeCardDefinition;
  topic: InstituteTopicDefinition | null;
  lifecycleStages: LearningExperienceDefinition["lifecycleStages"];
  available: boolean;
  unavailableReason?: string;
};

export type ExperienceResolverInput = {
  topicId?: string;
  knowledgeCardId?: string;
  /** Member context for future personalization gates */
  completedExperienceIds?: string[];
  memberCompetencyLevels?: Record<string, string>;
};

function experienceSupportedByTopic(
  topic: InstituteTopicDefinition,
  experienceType: LearningExperienceTypeId,
): boolean {
  return topic.supportedExperienceTypes.includes(experienceType);
}

export function resolveExperiencesForKnowledgeCard(
  knowledgeCardId: string,
  input: ExperienceResolverInput = {},
): ResolvedExperienceAvailability[] {
  const card = getKnowledgeCardById(knowledgeCardId);
  if (!card) return [];

  const topic = getTopicById(card.topicId);
  const experiences = listExperiencesForKnowledgeCard(knowledgeCardId);

  return experiences.map((experience) => {
    const topicSupports = topic
      ? experienceSupportedByTopic(topic, experience.kind)
      : true;
    const lifecycleStages =
      experience.lifecycleStages.length > 0
        ? experience.lifecycleStages
        : defaultLifecycleStagesForExperienceType(experience.kind);

    let available = topicSupports;
    let unavailableReason: string | undefined;

    if (!topicSupports) {
      unavailableReason = "This topic does not offer that experience type yet.";
    }

    if (
      input.completedExperienceIds?.includes(experience.id) &&
      experience.kind !== "reflection"
    ) {
      // Reflection and return flows may repeat; others typically don't block
    }

    return {
      experience,
      knowledgeCard: card,
      topic,
      lifecycleStages,
      available,
      unavailableReason,
    };
  });
}

export function resolveExperiencesForTopic(
  topicId: string,
  input: ExperienceResolverInput = {},
): ResolvedExperienceAvailability[] {
  const topic = getTopicById(topicId);
  if (!topic) return [];

  const results: ResolvedExperienceAvailability[] = [];
  for (const cardId of topic.knowledgeCardIds) {
    results.push(...resolveExperiencesForKnowledgeCard(cardId, input));
  }
  return results.filter((r) => r.available);
}

export function resolveExperienceById(
  experienceDefinitionId: string,
): ResolvedExperienceAvailability | null {
  const experience = getExperienceDefinitionById(experienceDefinitionId);
  if (!experience) return null;

  const card = getKnowledgeCardById(experience.knowledgeCardId);
  if (!card) return null;

  const topic = getTopicById(card.topicId);
  const topicSupports = topic
    ? experienceSupportedByTopic(topic, experience.kind)
    : true;

  return {
    experience,
    knowledgeCard: card,
    topic,
    lifecycleStages:
      experience.lifecycleStages.length > 0
        ? experience.lifecycleStages
        : defaultLifecycleStagesForExperienceType(experience.kind),
    available: topicSupports,
    unavailableReason: topicSupports
      ? undefined
      : "This topic does not offer that experience type yet.",
  };
}

export function listAvailableExperienceTypesForTopic(
  topicId: string,
): LearningExperienceTypeId[] {
  const topic = getTopicById(topicId);
  if (!topic) return [];
  return [...topic.supportedExperienceTypes];
}

export function countCatalogScale(): {
  departments: number;
  drawers: number;
  topics: number;
  knowledgeCards: number;
  experiences: number;
  competencies: number;
} {
  const catalog = loadInstituteCatalog();
  return {
    departments: catalog.departments.length,
    drawers: catalog.drawers.length,
    topics: catalog.topics.length,
    knowledgeCards: catalog.knowledgeCards.length,
    experiences: catalog.experiences.length,
    competencies: catalog.competencies.length,
  };
}
