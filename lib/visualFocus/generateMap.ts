import { buildMapAnalysis } from "./analysis";
import { buildVisualLayout } from "./visualLayout";
import type { VisualFocusMap } from "./types";
import { studioCardTitleForMode } from "./studioCards";
import { BUSINESS_CANVAS_GENERATE_LABEL } from "./businessCanvas/copy";
import {
  buildBusinessCanvasImpactAnalysis,
  hasEnoughChangeDetail,
} from "./businessCanvas/changeExploration";
import {
  buildBusinessCanvasHealthOverview,
} from "./businessCanvas/impactModel/sectionStrength";
import {
  estimateChangeImpact,
  impactStatesFromEstimate,
  sectionImpactSummary,
} from "./businessCanvas/impactModel/impactEstimate";
import {
  appendBusinessCanvasVersionRecord,
  createBusinessCanvasVersionRecord,
} from "./businessCanvas/impactModel/versionReadiness";
import {
  emitCanvasGenerated,
  emitCanvasVersionSaved,
  emitHealthOverviewComputed,
  emitImpactEstimated,
} from "./businessCanvas/impactModel/learning";
import { filledBusinessCanvasSectionCount } from "./businessCanvas/factory";
import {
  completeVisualThinkingIntelligenceCycle,
} from "./companionIntelligence";

function enrichBusinessCanvasMap(
  map: VisualFocusMap,
  options?: { versionLabel?: string; createdFrom?: "generate" | "manual" },
): VisualFocusMap {
  if (!map.businessCanvas) return map;
  const health = buildBusinessCanvasHealthOverview(map.businessCanvas);
  emitHealthOverviewComputed(map.id, health);
  emitCanvasGenerated(map.id, filledBusinessCanvasSectionCount(map.businessCanvas));

  let enriched: VisualFocusMap = {
    ...map,
    businessCanvasHealth: health,
  };

  const versionRecord = createBusinessCanvasVersionRecord({
    map: enriched,
    versionName:
      options?.versionLabel ??
      `${new Date().toISOString().slice(0, 10)} Generated Canvas`,
    createdFrom: options?.createdFrom ?? "generate",
  });
  if (versionRecord) {
    enriched = appendBusinessCanvasVersionRecord(enriched, versionRecord);
    emitCanvasVersionSaved(map.id, versionRecord.versionId, versionRecord.createdFrom ?? "generate");
  }

  return enriched;
}

export function generateMapLabelForMode(mode: VisualFocusMap["mode"]): string {
  if (mode === "business-canvas") return BUSINESS_CANVAS_GENERATE_LABEL;
  const title = studioCardTitleForMode(mode);
  return `Generate ${title}`;
}

export function generateVisualFocusMap(map: VisualFocusMap): VisualFocusMap {
  const analysis = buildMapAnalysis(map);
  const visualLayout = buildVisualLayout(map);
  const now = new Date().toISOString();
  const isBusinessCanvas = map.mode === "business-canvas";
  let result: VisualFocusMap = {
    ...map,
    workflowStage: "generated" as const,
    businessCanvasWorkflow: isBusinessCanvas
      ? "generatedCurrentCanvas"
      : map.businessCanvasWorkflow,
    generatedAt: now,
    visualLayout,
    analysis,
    summary: analysis.summary,
    saveStatus: "saved" as const,
    lastSavedAt: now,
    updatedAt: now,
  };
  if (isBusinessCanvas && map.businessCanvas) {
    result = enrichBusinessCanvasMap(result, {
      versionLabel: `${now.slice(0, 10)} Initial Version`,
      createdFrom: "generate",
    });
  }
  completeVisualThinkingIntelligenceCycle(result);
  return result;
}

export function generateBusinessCanvasImpact(map: VisualFocusMap): VisualFocusMap | null {
  if (map.mode !== "business-canvas" || !map.businessCanvas || !map.businessCanvasChange) {
    return null;
  }
  const { description, followUpAnswers } = map.businessCanvasChange;
  if (!hasEnoughChangeDetail(description, followUpAnswers)) return null;

  const impact = buildBusinessCanvasImpactAnalysis(
    map.businessCanvas,
    map.title,
    description,
    followUpAnswers,
  );
  const now = new Date().toISOString();
  const changeEstimate = estimateChangeImpact(description);
  emitImpactEstimated(map.id, changeEstimate);
  const impactStates = impactStatesFromEstimate(changeEstimate);
  const versionRecord = createBusinessCanvasVersionRecord({
    map,
    versionName: `${now.slice(0, 10)} Impact Analysis`,
    createdFrom: "change_explore",
    changeSummary: description.slice(0, 120),
    impactSummary: sectionImpactSummary(changeEstimate),
    canvasData: map.businessCanvas,
  });
  let result: VisualFocusMap = {
    ...map,
    businessCanvasWorkflow: "generatedImpact" as const,
    businessCanvasImpactAnalysis: impact,
    businessCanvasLastImpactEstimate: changeEstimate,
    businessCanvasImpactStates: impactStates,
    analysis: impact,
    summary: impact.summary,
    updatedAt: now,
  };
  if (versionRecord) {
    result = appendBusinessCanvasVersionRecord(result, versionRecord);
    emitCanvasVersionSaved(map.id, versionRecord.versionId, "change_explore");
  }
  completeVisualThinkingIntelligenceCycle(result);
  return result;
}
