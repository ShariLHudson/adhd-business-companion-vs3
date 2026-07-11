/**
 * Growth Profile — automatic quiet updates. No permission prompts.
 */

import type {
  MemberCompetencyRecord,
  MemberGrowthProfile,
  MemberLearningCompletion,
  MemberLearningTimelineEntry,
  MemberSkillRecord,
} from "./types";
import type { LearningExperienceTypeId } from "@/lib/sparkMomentumInstitute/types";
import { nextCompetencyLevel, normalizeCompetencyLevel } from "@/lib/sparkCompetencyFramework/types";
import { getCompetencyById, getKnowledgeCardById } from "./catalog/provider";

const STORAGE_KEY = "companion-institute-growth-profile-v1";

export const INSTITUTE_GROWTH_PROFILE_UPDATED_EVENT =
  "companion-institute-growth-profile-updated";

function newTimelineId(): string {
  return `tl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultProfile(): MemberGrowthProfile {
  const now = new Date().toISOString();
  return {
    kind: "institute-growth-profile",
    id: "member-growth-profile",
    createdAt: now,
    updatedAt: now,
    competencies: [],
    skillsDeveloped: [],
    completedLearning: [],
    timeline: [],
  };
}

function readProfile(): MemberGrowthProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    return { ...defaultProfile(), ...(JSON.parse(raw) as MemberGrowthProfile) };
  } catch {
    return defaultProfile();
  }
}

function writeProfile(profile: MemberGrowthProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(INSTITUTE_GROWTH_PROFILE_UPDATED_EVENT));
}

export function getGrowthProfile(): MemberGrowthProfile {
  return readProfile();
}

function appendTimeline(
  profile: MemberGrowthProfile,
  entry: Omit<MemberLearningTimelineEntry, "id">,
): MemberGrowthProfile {
  return {
    ...profile,
    timeline: [
      { ...entry, id: newTimelineId() },
      ...profile.timeline,
    ].slice(0, 500),
    updatedAt: new Date().toISOString(),
  };
}

function bumpCompetency(
  competencies: MemberCompetencyRecord[],
  competencyId: string,
  knowledgeCardId: string,
  experienceId: string,
): MemberCompetencyRecord[] {
  const existing = competencies.find((c) => c.competencyId === competencyId);
  const now = new Date().toISOString();

  if (!existing) {
    return [
      ...competencies,
      {
        competencyId,
        level: "exploring",
        lastDevelopedAt: now,
        sourceKnowledgeCardIds: [knowledgeCardId],
        sourceExperienceIds: [experienceId],
      },
    ];
  }

  const currentLevel = normalizeCompetencyLevel(existing.level);
  const nextLevel = nextCompetencyLevel(currentLevel);

  return competencies.map((c) =>
    c.competencyId === competencyId
      ? {
          ...c,
          level: nextLevel,
          lastDevelopedAt: now,
          sourceKnowledgeCardIds: [
            ...new Set([...c.sourceKnowledgeCardIds, knowledgeCardId]),
          ],
          sourceExperienceIds: [
            ...new Set([...c.sourceExperienceIds, experienceId]),
          ],
        }
      : c,
  );
}

export type RecordLearningCompletionInput = {
  learningExperienceId: string;
  knowledgeCardId: string;
  experienceDefinitionId: string;
  experienceType: LearningExperienceTypeId;
  drawerId: string;
  departmentId: string;
  competencyIds?: string[];
};

/** Quiet automatic update — no permission */
export function recordLearningCompletion(
  input: RecordLearningCompletionInput,
): MemberGrowthProfile {
  let profile = readProfile();
  const now = new Date().toISOString();
  const card = getKnowledgeCardById(input.knowledgeCardId);

  const completion: MemberLearningCompletion = {
    learningExperienceId: input.learningExperienceId,
    knowledgeCardId: input.knowledgeCardId,
    experienceType: input.experienceType,
    completedAt: now,
    drawerId: input.drawerId,
    departmentId: input.departmentId,
  };

  profile = {
    ...profile,
    completedLearning: [
      completion,
      ...profile.completedLearning.filter(
        (c) => c.learningExperienceId !== input.learningExperienceId,
      ),
    ].slice(0, 1000),
  };

  const competencyIds =
    input.competencyIds ?? card?.competencyIds ?? [];

  for (const competencyId of competencyIds) {
    if (getCompetencyById(competencyId)) {
      profile = {
        ...profile,
        competencies: bumpCompetency(
          profile.competencies,
          competencyId,
          input.knowledgeCardId,
          input.experienceDefinitionId,
        ),
      };
    }
  }

  const skill: MemberSkillRecord = {
    skillId: `${input.experienceType}:${input.experienceDefinitionId}`,
    label: card?.title ?? input.experienceType,
    developedAt: now,
    knowledgeCardId: input.knowledgeCardId,
    experienceDefinitionId: input.experienceDefinitionId,
  };

  profile = {
    ...profile,
    skillsDeveloped: [
      skill,
      ...profile.skillsDeveloped.filter((s) => s.skillId !== skill.skillId),
    ].slice(0, 500),
  };

  profile = appendTimeline(profile, {
    at: now,
    event: "completed",
    knowledgeCardId: input.knowledgeCardId,
    experienceDefinitionId: input.experienceDefinitionId,
    learningExperienceId: input.learningExperienceId,
    label: card?.title ?? "Learning completed",
  });

  profile = appendTimeline(profile, {
    at: now,
    event: "competency_updated",
    knowledgeCardId: input.knowledgeCardId,
    experienceDefinitionId: input.experienceDefinitionId,
    learningExperienceId: input.learningExperienceId,
    label: "Growth Profile updated",
  });

  writeProfile(profile);
  return profile;
}

export function recordCabinetFiledInProfile(input: {
  knowledgeCardId: string;
  cabinetItemId: string;
  label: string;
}): MemberGrowthProfile {
  let profile = readProfile();
  profile = appendTimeline(profile, {
    at: new Date().toISOString(),
    event: "filed_cabinet",
    knowledgeCardId: input.knowledgeCardId,
    label: input.label,
  });
  writeProfile(profile);
  return profile;
}

export function recordEvidenceSavedInProfile(input: {
  knowledgeCardId: string;
  learningExperienceId: string;
  label: string;
}): MemberGrowthProfile {
  let profile = readProfile();
  profile = appendTimeline(profile, {
    at: new Date().toISOString(),
    event: "evidence_saved",
    knowledgeCardId: input.knowledgeCardId,
    learningExperienceId: input.learningExperienceId,
    label: input.label,
  });
  writeProfile(profile);
  return profile;
}

export function clearGrowthProfileForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
