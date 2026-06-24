import type { BusinessCanvasData } from "../types";
import type { VisualFocusMap } from "../../types";
import type { BusinessCanvasVersionRecord } from "./types";
import { buildBusinessCanvasHealthOverview } from "./sectionStrength";

export function createBusinessCanvasVersionRecord(input: {
  map: VisualFocusMap;
  versionName: string;
  createdFrom?: BusinessCanvasVersionRecord["createdFrom"];
  changeSummary?: string;
  impactSummary?: string;
  restoredFromVersionId?: string;
  canvasData?: BusinessCanvasData;
}): BusinessCanvasVersionRecord | null {
  const data = input.canvasData ?? input.map.businessCanvas;
  if (!data) return null;

  return {
    versionId: `bcv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    canvasId: input.map.id,
    versionName: input.versionName,
    createdAt: new Date().toISOString(),
    createdFrom: input.createdFrom ?? "manual",
    sectionSnapshot: JSON.parse(JSON.stringify(data)) as BusinessCanvasData,
    changeSummary: input.changeSummary,
    impactSummary: input.impactSummary,
    restoredFromVersionId: input.restoredFromVersionId,
    healthSnapshot: buildBusinessCanvasHealthOverview(data),
  };
}

export function appendBusinessCanvasVersionRecord(
  map: VisualFocusMap,
  record: BusinessCanvasVersionRecord,
): VisualFocusMap {
  const existing = map.businessCanvasVersionRecords ?? [];
  return {
    ...map,
    businessCanvasVersionRecords: [record, ...existing].slice(0, 20),
  };
}
