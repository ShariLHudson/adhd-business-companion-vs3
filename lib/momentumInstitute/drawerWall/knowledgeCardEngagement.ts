/**
 * Quiet engagement when a member opens a Knowledge Card™.
 */

import { getKnowledgeCardById } from "@/lib/momentumInstitute/catalog/provider";
import {
  listLearningExperiences,
  startLearningExperience,
} from "@/lib/momentumInstitute/learningExperienceStore";

/** Start in-progress learning quietly — growth is earned through use. */
export function engageKnowledgeCard(knowledgeCardId: string): void {
  if (typeof window === "undefined") return;

  const alreadyActive = listLearningExperiences().some(
    (exp) =>
      exp.knowledgeCardId === knowledgeCardId && exp.status === "in_progress",
  );
  if (alreadyActive) return;

  const card = getKnowledgeCardById(knowledgeCardId);
  const firstExperienceId = card?.experienceDefinitionIds[0];
  if (!firstExperienceId) return;

  startLearningExperience(firstExperienceId);
}
