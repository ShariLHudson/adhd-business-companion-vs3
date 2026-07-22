/**
 * Outline ↔ canvas sync for Cartography (Prompt 140).
 * One canonical map model: outline, canvas, and Companion Intelligence stay aligned.
 */

import { generateVisualFocusMap } from "./generateMap";
import type { VisualFocusMap, VisualFocusNode } from "./types";

export type CanvasSyncStatus =
  | "synced"
  | "updating"
  | "sync-needed"
  | "map-updated";

/** True when a map has a published visual that must track outline edits. */
export function mapHasPublishedCanvas(map: VisualFocusMap): boolean {
  return (
    map.workflowStage === "generated" ||
    Boolean(map.visualLayout) ||
    Boolean(map.generatedAt)
  );
}

/**
 * Apply a root (outline) change. When a canvas already exists, regenerate
 * layout + Companion Intelligence so nothing drifts silently.
 */
export function applyCanonicalRootChange(
  map: VisualFocusMap,
  root: VisualFocusNode,
): VisualFocusMap {
  const updated: VisualFocusMap = {
    ...map,
    root,
    updatedAt: new Date().toISOString(),
    saveStatus: "unsaved",
  };
  if (!mapHasPublishedCanvas(map)) {
    return updated;
  }
  return generateVisualFocusMap(updated);
}

/** Explicit primary control path — always refresh canvas from current outline. */
export function refreshCanvasFromOutline(map: VisualFocusMap): VisualFocusMap {
  return generateVisualFocusMap({
    ...map,
    workflowStage: "build",
    updatedAt: new Date().toISOString(),
  });
}

export function canvasSyncStatusLabel(status: CanvasSyncStatus): string {
  switch (status) {
    case "updating":
      return "Updating…";
    case "sync-needed":
      return "Changes not yet reflected";
    case "map-updated":
      return "Map updated";
    default:
      return "Map updated";
  }
}
