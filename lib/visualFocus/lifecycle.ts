/**
 * Visual Thinking lifecycle helpers — status, versions, snapshots.
 */

import type {
  VisualFocusLifecycleStatus,
  VisualFocusMap,
  VisualFocusMapSnapshot,
  VisualFocusMapVersion,
} from "./types";

export function normalizeLifecycleStatus(
  map: VisualFocusMap,
): VisualFocusLifecycleStatus {
  return map.lifecycleStatus ?? "active";
}

export function isActiveLifecycleMap(map: VisualFocusMap): boolean {
  const status = normalizeLifecycleStatus(map);
  return status === "active" || status === "draft";
}

export function isArchivedLifecycleMap(map: VisualFocusMap): boolean {
  return normalizeLifecycleStatus(map) === "archived";
}

export function isCompletedLifecycleMap(map: VisualFocusMap): boolean {
  return normalizeLifecycleStatus(map) === "completed";
}

export function isMomentumEligibleMap(map: VisualFocusMap): boolean {
  return (
    isActiveLifecycleMap(map) &&
    !map.pinned &&
    !isCompletedLifecycleMap(map)
  );
}

export function formatVersionLabel(savedAt: string, suffix?: string): string {
  const date = savedAt.slice(0, 10);
  const trimmed = suffix?.trim();
  if (!trimmed) return `${date} Version`;
  return `${date} ${trimmed}`;
}

export function createMapSnapshot(map: VisualFocusMap): VisualFocusMapSnapshot {
  return JSON.parse(
    JSON.stringify({
      title: map.title,
      mode: map.mode,
      root: map.root,
      purposeAnchor: map.purposeAnchor,
      businessCanvas: map.businessCanvas,
      kanban: map.kanban,
      workflowStage: map.workflowStage,
      generatedAt: map.generatedAt,
      visualLayout: map.visualLayout,
      analysis: map.analysis,
      summary: map.summary,
      businessCanvasWorkflow: map.businessCanvasWorkflow,
      businessCanvasChange: map.businessCanvasChange,
      businessCanvasImpactAnalysis: map.businessCanvasImpactAnalysis,
    }),
  ) as VisualFocusMapSnapshot;
}

export function applyMapSnapshot(
  map: VisualFocusMap,
  snapshot: VisualFocusMapSnapshot,
): VisualFocusMap {
  return {
    ...map,
    ...snapshot,
    id: map.id,
    createdAt: map.createdAt,
    pinned: map.pinned,
    intentionallySaved: map.intentionallySaved,
    saveDestination: map.saveDestination,
    lifecycleStatus: map.lifecycleStatus,
    archivedAt: map.archivedAt,
    versions: map.versions,
    currentVersionId: map.currentVersionId,
    saveStatus: map.saveStatus,
    lastSavedAt: map.lastSavedAt,
  };
}

export function newVersionId(): string {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function sortVersionsNewestFirst(
  versions: VisualFocusMapVersion[] | undefined,
): VisualFocusMapVersion[] {
  return [...(versions ?? [])].sort((a, b) =>
    b.savedAt.localeCompare(a.savedAt),
  );
}
