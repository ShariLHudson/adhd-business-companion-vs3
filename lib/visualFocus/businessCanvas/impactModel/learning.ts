import { emitCompanionSignal } from "@/lib/intelligence-layer/signalBus";
import type { BusinessCanvasSectionId } from "../types";
import type { BusinessCanvasHealthOverview, ChangeImpactEstimate } from "./types";

const EMITTER = "business_canvas_impact_model";

export type BusinessCanvasLearningEvent =
  | "business_canvas_generated"
  | "business_canvas_section_strength_changed"
  | "business_canvas_change_explored"
  | "business_canvas_impact_estimated"
  | "business_canvas_version_saved";

export function emitBusinessCanvasLearningEvent(
  event: BusinessCanvasLearningEvent,
  meta: Record<string, string | number | boolean>,
): void {
  emitCompanionSignal({
    domain: "workspace",
    category: "tool_used",
    action: "observed",
    source: `business_canvas:${event}`,
    emitter: EMITTER,
    meta: {
      learning_event: event,
      ...meta,
    },
  });
}

export function emitCanvasGenerated(mapId: string, sectionCount: number): void {
  emitBusinessCanvasLearningEvent("business_canvas_generated", {
    map_id: mapId,
    filled_sections: sectionCount,
  });
}

export function emitSectionStrengthChanged(
  mapId: string,
  sectionId: BusinessCanvasSectionId,
  overall: number,
): void {
  emitBusinessCanvasLearningEvent("business_canvas_section_strength_changed", {
    map_id: mapId,
    section_id: sectionId,
    strength_overall: overall,
  });
}

export function emitChangeExplored(mapId: string, changeCategory: string): void {
  emitBusinessCanvasLearningEvent("business_canvas_change_explored", {
    map_id: mapId,
    change_category: changeCategory,
  });
}

export function emitImpactEstimated(
  mapId: string,
  estimate: ChangeImpactEstimate,
): void {
  emitBusinessCanvasLearningEvent("business_canvas_impact_estimated", {
    map_id: mapId,
    affected_section_count: estimate.affectedSections.length,
    high_impact_count: estimate.affectedSections.filter((s) => s.level === "high")
      .length,
  });
}

export function emitCanvasVersionSaved(
  mapId: string,
  versionId: string,
  createdFrom: string,
): void {
  emitBusinessCanvasLearningEvent("business_canvas_version_saved", {
    map_id: mapId,
    version_id: versionId,
    created_from: createdFrom,
  });
}

export function emitHealthOverviewComputed(
  mapId: string,
  health: BusinessCanvasHealthOverview,
): void {
  emitBusinessCanvasLearningEvent("business_canvas_section_strength_changed", {
    map_id: mapId,
    strong_sections: health.strongCount,
    needs_detail_sections: health.needsDetailCount,
    overall_confidence: health.overallConfidence,
  });
}
