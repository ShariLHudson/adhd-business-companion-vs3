/**
 * Stage completion derived from existing saved fields + optional drafts.
 * No new persistence layer.
 */

import { getPrimaryAvatar } from "@/lib/companionStore";
import {
  getApprovedFieldValue,
  getBusinessEstateEnvelope,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import { sectionStorageKey } from "@/lib/profile/businessEstateSectionFields";
import {
  getGuidedAreaStages,
  getGuidedStageById,
} from "@/lib/profile/guidedStageRegistry";
import type {
  GuidedStageAreaId,
  GuidedStageDefinition,
  GuidedStageStatus,
} from "@/lib/profile/guidedStageTypes";
import { GUIDED_STAGE_STATUS_LABEL } from "@/lib/profile/guidedStageTypes";

const ENOUGH_FOR_NOW_KEY = "companion-guided-stage-enough-v1";

function parsePath(path: string): { sectionId: string; fieldKey: string } | null {
  if (path === "people-i-help.link") return null;
  const dot = path.indexOf(".");
  if (dot < 0) return null;
  return {
    sectionId: path.slice(0, dot),
    fieldKey: path.slice(dot + 1),
  };
}

function readSavedEstateValue(path: string): string {
  const parsed = parsePath(path);
  if (!parsed) return "";
  if (parsed.sectionId === "people-i-help") {
    const avatar = getPrimaryAvatar();
    if (!avatar) return "";
    const key = parsed.fieldKey as keyof typeof avatar;
    const raw = avatar[key];
    if (typeof raw === "string") return raw.trim();
    if (Array.isArray(raw)) return raw.join(", ").trim();
    return "";
  }
  return (
    getApprovedFieldValue(path) ||
    (() => {
      const envelope = getBusinessEstateEnvelope();
      const storageKey = sectionStorageKey(
        parsed.sectionId as BusinessEstateSectionId,
      );
      const section = envelope.sections[storageKey] as
        | Record<string, string>
        | undefined;
      return (section?.[parsed.fieldKey] ?? "").trim();
    })()
  );
}

function peopleLinkFilled(): boolean {
  const avatar = getPrimaryAvatar();
  if (!avatar) return false;
  return Boolean(avatar.who?.trim() || avatar.name?.trim());
}

/** Session-only "Enough for Now" markers — not profile storage. */
export function markStageEnoughForNow(stageId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(ENOUGH_FOR_NOW_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    map[stageId] = true;
    sessionStorage.setItem(ENOUGH_FOR_NOW_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function isStageMarkedEnoughForNow(stageId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(ENOUGH_FOR_NOW_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw) as Record<string, boolean>;
    return Boolean(map[stageId]);
  } catch {
    return false;
  }
}

export function clearStageEnoughForNowMarkers(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ENOUGH_FOR_NOW_KEY);
  } catch {
    /* ignore */
  }
}

export function fieldPathHasValue(
  path: string,
  draftValues?: Record<string, string>,
): boolean {
  if (path === "people-i-help.link") return peopleLinkFilled();

  const parsed = parsePath(path);
  if (!parsed) return false;

  if (draftValues) {
    // draft values use field keys for estate sections, or full path for people
    const draft =
      draftValues[path] ??
      draftValues[parsed.fieldKey] ??
      "";
    if (draft.trim()) return true;
  }

  return Boolean(readSavedEstateValue(path));
}

export function countFilledPrimaryFields(
  stage: GuidedStageDefinition,
  draftValues?: Record<string, string>,
): { filled: number; total: number } {
  const total = stage.fieldPaths.length;
  const filled = stage.fieldPaths.filter((p) =>
    fieldPathHasValue(p, draftValues),
  ).length;
  return { filled, total };
}

export function deriveStageStatus(
  stage: GuidedStageDefinition,
  draftValues?: Record<string, string>,
  options?: { savedThisSession?: boolean },
): GuidedStageStatus {
  if (isStageMarkedEnoughForNow(stage.id)) return "enough_for_now";

  const { filled, total } = countFilledPrimaryFields(stage, draftValues);

  if (filled === 0) {
    return stage.optional ? "ready_when_you_are" : "ready_to_begin";
  }

  if (filled >= total) {
    return options?.savedThisSession ? "saved" : "explored";
  }

  if (filled >= Math.ceil(total / 2)) return "explored";
  return "started";
}

export function formatStageStatusLabel(status: GuidedStageStatus): string {
  return GUIDED_STAGE_STATUS_LABEL[status];
}

export function listAreaStageStatuses(
  areaId: GuidedStageAreaId,
  draftValues?: Record<string, string>,
): { stage: GuidedStageDefinition; status: GuidedStageStatus; label: string }[] {
  const area = getGuidedAreaStages(areaId);
  return area.stages.map((stage) => {
    const status = deriveStageStatus(stage, draftValues);
    return { stage, status, label: formatStageStatusLabel(status) };
  });
}

export function isQuickStartSatisfied(
  areaId: GuidedStageAreaId,
  draftValues?: Record<string, string>,
): boolean {
  const area = getGuidedAreaStages(areaId);
  return area.quickStartFieldPaths.every((path) =>
    fieldPathHasValue(path, draftValues),
  );
}

export function stageHasUsefulSupport(
  stageId: string,
  draftValues?: Record<string, string>,
): boolean {
  const stage = getGuidedStageById(stageId);
  if (!stage) return false;
  const { filled } = countFilledPrimaryFields(stage, draftValues);
  return filled > 0 || isStageMarkedEnoughForNow(stageId);
}
