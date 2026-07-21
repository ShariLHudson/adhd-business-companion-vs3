/**
 * Resolve Workshop Map presentation for a Create workflow (099).
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import {
  getWorkTypePackage,
  resolveWorkTypeIdFromMemberLabel,
} from "../registry/universalWorkTypeRegistry";
import { getBlueprint } from "./registry";
import {
  buildWorkshopMapGroups,
  DEFAULT_GROUP_MAP_THRESHOLD,
  resolveInitiallyOpenGroupIds,
  type WorkshopMapGroupView,
} from "./mapGrouping";
import type { BlueprintGroup } from "./types";

export function resolveWorkshopMapForWorkflow(
  workflow: CreateWorkflowState,
  options?: {
    activeSectionId?: string | null;
    pinnedOpenGroupIds?: readonly string[];
    blueprintId?: string | null;
  },
): {
  mode: "flat" | "grouped";
  groups: WorkshopMapGroupView[];
  flatSectionIds: string[];
  initiallyOpenGroupIds: string[];
  threshold: number;
} {
  const sections = workspaceV2Sections(workflow).map((s) => ({
    id: s.id,
    label: s.label,
    content: s.content,
    skipped: s.skipped,
  }));

  const resolvedWorkTypeId =
    resolveWorkTypeIdFromMemberLabel(workflow.selectedTypeLabel) ??
    (workflow.creationWorkspaceKind === "event" ? "event_plan" : null);

  const pkg = resolvedWorkTypeId
    ? getWorkTypePackage(resolvedWorkTypeId)
    : null;

  let groups: readonly BlueprintGroup[] | null =
    (pkg?.mapGroups as BlueprintGroup[] | undefined) ?? null;

  const blueprintId = options?.blueprintId?.trim();
  if (blueprintId) {
    const bp = getBlueprint(blueprintId);
    if (bp?.groups?.length) groups = bp.groups;
  }

  const threshold = pkg?.groupMapThreshold ?? DEFAULT_GROUP_MAP_THRESHOLD;
  const built = buildWorkshopMapGroups({
    sections,
    groups,
    completedSectionIds: workflow.completedSectionIds,
    threshold,
  });

  const activeSectionId =
    options?.activeSectionId ?? workflow.activeSectionId ?? null;

  return {
    ...built,
    threshold,
    initiallyOpenGroupIds: resolveInitiallyOpenGroupIds({
      groups: built.groups,
      activeSectionId,
      pinnedOpenGroupIds: options?.pinnedOpenGroupIds,
    }),
  };
}
