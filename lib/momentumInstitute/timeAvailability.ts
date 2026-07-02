/**
 * Time-respecting experience recommendations.
 * Members grow even with only a few minutes.
 */

import type { LearningExperienceTypeId } from "@/lib/sparkMomentumInstitute/types";
import {
  LEARNING_TIME_SLOT_LABELS,
  type LearningTimeSlotId,
} from "@/lib/sparkCompetencyFramework/types";
import { loadInstituteCatalog } from "./catalog/provider";
import {
  resolveExperiencesForKnowledgeCard,
  type ResolvedExperienceAvailability,
} from "./experienceResolver";

/** Default v1.0 time → experience mapping */
export const DEFAULT_TIME_SLOT_EXPERIENCE_MAP: Record<
  LearningTimeSlotId,
  LearningExperienceTypeId[]
> = {
  "5_min": ["business_mastery_minute"],
  "15_min": ["guided_lesson", "reflection"],
  "30_min": ["business_lab", "simulation", "thinking_gym"],
  "60_plus": ["deep_workshop", "coaching_session", "deep_lesson"],
  multi_week: ["apprenticeship"],
};

export function timeSlotExperienceTypes(
  slot: LearningTimeSlotId,
): LearningExperienceTypeId[] {
  const catalog = loadInstituteCatalog();
  return (
    catalog.timeSlotRecommendations?.[slot] ??
    DEFAULT_TIME_SLOT_EXPERIENCE_MAP[slot]
  );
}

export function timeSlotLabel(slot: LearningTimeSlotId): string {
  return LEARNING_TIME_SLOT_LABELS[slot];
}

export function resolveExperiencesForTimeSlot(
  knowledgeCardId: string,
  slot: LearningTimeSlotId,
): ResolvedExperienceAvailability[] {
  const allowed = new Set(timeSlotExperienceTypes(slot));
  return resolveExperiencesForKnowledgeCard(knowledgeCardId).filter(
    (r) => r.available && allowed.has(r.experience.kind),
  );
}

export function suggestTimeSlotsForTopic(
  knowledgeCardId: string,
): LearningTimeSlotId[] {
  const available = resolveExperiencesForKnowledgeCard(knowledgeCardId).filter(
    (r) => r.available,
  );
  const kinds = new Set(available.map((r) => r.experience.kind));

  return (Object.keys(DEFAULT_TIME_SLOT_EXPERIENCE_MAP) as LearningTimeSlotId[]).filter(
    (slot) =>
      DEFAULT_TIME_SLOT_EXPERIENCE_MAP[slot].some((kind) => kinds.has(kind)),
  );
}
