/**
 * Member learning experience persistence — runtime session state.
 */

import type { MemberLearningExperience } from "./types";
import type { InstituteLifecycleStageId } from "@/lib/sparkMomentumInstitute/types";
import { resolveExperienceById } from "./experienceResolver";
import {
  canAdvanceLifecycle,
  isAutomaticStage,
  nextLifecycleStage,
} from "./lifecycle";
import { recordLearningCompletion } from "./growthProfileStore";
import { createEvidenceOpportunity } from "./evidenceBridge";

const STORAGE_KEY = "companion-institute-learning-experiences-v1";

export const INSTITUTE_LEARNING_UPDATED_EVENT =
  "companion-institute-learning-updated";

function newId(): string {
  return `ile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): MemberLearningExperience[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MemberLearningExperience[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: MemberLearningExperience[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(INSTITUTE_LEARNING_UPDATED_EVENT));
}

export function listLearningExperiences(): MemberLearningExperience[] {
  return readAll();
}

export function getLearningExperienceById(
  id: string,
): MemberLearningExperience | null {
  return readAll().find((e) => e.id === id) ?? null;
}

export function startLearningExperience(
  experienceDefinitionId: string,
): MemberLearningExperience | null {
  const resolved = resolveExperienceById(experienceDefinitionId);
  if (!resolved || !resolved.available) return null;

  const now = new Date().toISOString();
  const experience: MemberLearningExperience = {
    kind: "institute-learning-experience",
    id: newId(),
    createdAt: now,
    updatedAt: now,
    experienceDefinitionId: resolved.experience.id,
    experienceType: resolved.experience.kind,
    knowledgeCardId: resolved.knowledgeCard.id,
    topicId: resolved.knowledgeCard.topicId,
    drawerId: resolved.knowledgeCard.drawerId,
    departmentId: resolved.knowledgeCard.departmentId,
    lifecycleStage: "discover",
    startedAt: now,
    status: "in_progress",
    originatedFromId: resolved.knowledgeCard.id,
    originatedFromKind: "knowledge-card",
  };

  writeAll([experience, ...readAll()]);
  return experience;
}

export function advanceLearningExperience(
  learningExperienceId: string,
  toStage?: InstituteLifecycleStageId,
): MemberLearningExperience | null {
  const items = readAll();
  const idx = items.findIndex((e) => e.id === learningExperienceId);
  if (idx < 0) return null;

  const current = items[idx]!;
  const resolved = resolveExperienceById(current.experienceDefinitionId);
  if (!resolved) return null;

  const supported = resolved.lifecycleStages;
  const targetStage =
    toStage ?? nextLifecycleStage(current.lifecycleStage, supported);
  if (!targetStage) return current;

  if (
    !canAdvanceLifecycle(current.lifecycleStage, targetStage, supported)
  ) {
    return current;
  }

  const now = new Date().toISOString();
  let updated: MemberLearningExperience = {
    ...current,
    lifecycleStage: targetStage,
    updatedAt: now,
  };

  if (targetStage === "return_and_share") {
    updated = { ...updated, status: "returned" };
    createEvidenceOpportunity({
      learningExperienceId: updated.id,
      knowledgeCardId: updated.knowledgeCardId,
      experienceDefinitionId: updated.experienceDefinitionId,
    });
  }

  if (targetStage === "growth_profile" || isAutomaticStage(targetStage)) {
    recordLearningCompletion({
      learningExperienceId: updated.id,
      knowledgeCardId: updated.knowledgeCardId,
      experienceDefinitionId: updated.experienceDefinitionId,
      experienceType: updated.experienceType,
      drawerId: updated.drawerId,
      departmentId: updated.departmentId,
      competencyIds: resolved.knowledgeCard.competencyIds,
    });
    updated = {
      ...updated,
      status: "completed",
      completedAt: now,
    };
  }

  items[idx] = updated;
  writeAll(items);
  return updated;
}

export function linkCabinetToLearningExperience(
  learningExperienceId: string,
  cabinetReferenceId: string,
): MemberLearningExperience | null {
  const items = readAll();
  const idx = items.findIndex((e) => e.id === learningExperienceId);
  if (idx < 0) return null;
  items[idx] = {
    ...items[idx]!,
    cabinetReferenceId,
    updatedAt: new Date().toISOString(),
  };
  writeAll(items);
  return items[idx]!;
}

export function clearLearningExperiencesForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
