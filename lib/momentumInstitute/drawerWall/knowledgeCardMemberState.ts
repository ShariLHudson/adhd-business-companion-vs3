/**
 * Member progress on Knowledge Cards™ — cabinet, learning sessions, completions.
 */

import { isKnowledgeCardInCabinet } from "@/lib/momentumInstitute/cabinetStore";
import { getGrowthProfile } from "@/lib/momentumInstitute/growthProfileStore";
import { listLearningExperiences } from "@/lib/momentumInstitute/learningExperienceStore";

export const KNOWLEDGE_CARD_MEMBER_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "saved",
] as const;

export type KnowledgeCardMemberStatusId =
  (typeof KNOWLEDGE_CARD_MEMBER_STATUSES)[number];

export const KNOWLEDGE_CARD_STATUS_LABELS: Record<
  KnowledgeCardMemberStatusId,
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  saved: "Saved",
};

export function resolveKnowledgeCardMemberStatus(
  knowledgeCardId: string,
): KnowledgeCardMemberStatusId {
  const active = listLearningExperiences().some(
    (exp) =>
      exp.knowledgeCardId === knowledgeCardId && exp.status === "in_progress",
  );
  if (active) {
    return "in_progress";
  }

  const profile = getGrowthProfile();
  if (
    profile.completedLearning.some(
      (entry) => entry.knowledgeCardId === knowledgeCardId,
    )
  ) {
    return "completed";
  }

  if (isKnowledgeCardInCabinet(knowledgeCardId)) {
    return "saved";
  }

  return "not_started";
}
