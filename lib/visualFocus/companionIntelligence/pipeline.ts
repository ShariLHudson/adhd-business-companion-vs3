import { normalizeBusinessCanvasWorkflow } from "../businessCanvas/workflowTypes";
import type { VisualFocusAnalysis, VisualFocusMap } from "../types";
import {
  captureVisualThinkingSession,
  feedFounderIntelligenceFromVisualThinking,
} from "./learning";
import type { VisualThinkingFrameworkId, VisualThinkingPipelineStage } from "./types";
import { VISUAL_THINKING_PIPELINE_ORDER } from "./types";

export function pipelineStageIndex(stage: VisualThinkingPipelineStage): number {
  return VISUAL_THINKING_PIPELINE_ORDER.indexOf(stage);
}

/** Intelligence layer must not skip ahead without prior stages (except clarify, optional). */
export function isValidPipelineAdvance(
  from: VisualThinkingPipelineStage,
  to: VisualThinkingPipelineStage,
): boolean {
  if (from === to) return true;
  if (to === "clarify") return true;
  const fromIdx = pipelineStageIndex(from);
  const toIdx = pipelineStageIndex(to);
  if (fromIdx < 0 || toIdx < 0) return false;
  return toIdx >= fromIdx;
}

export function frameworkIdForMap(map: VisualFocusMap): VisualThinkingFrameworkId {
  if (
    map.mode === "business-canvas" &&
    map.businessCanvasWorkflow === "generatedImpact"
  ) {
    return "what-if-analysis";
  }
  return map.mode;
}

/** Resolve current pipeline stage from map state — intelligence owns the experience. */
export function resolvePipelineStageForMap(map: VisualFocusMap): VisualThinkingPipelineStage {
  if (map.mode === "business-canvas") {
    const workflow = normalizeBusinessCanvasWorkflow(
      map.businessCanvasWorkflow,
      map.workflowStage === "generated",
    );
    switch (workflow) {
      case "buildCurrentCanvas":
        return map.purposeAnchor?.userAnswer?.trim() ? "structure" : "understand";
      case "generatedCurrentCanvas":
        return map.analysis ? "insights" : "visualize";
      case "exploreChange":
      case "clarifyChange":
        return "clarify";
      case "generatedImpact":
        return "recommendations";
      default:
        return "structure";
    }
  }

  if (map.workflowStage === "generated" && map.analysis) {
    return "recommendations";
  }
  if (map.generatedAt && map.visualLayout) {
    return "insights";
  }
  if (map.purposeAnchor?.userAnswer?.trim()) {
    return "structure";
  }
  return "understand";
}

export function pipelineStagesCompletedForMap(
  map: VisualFocusMap,
): VisualThinkingPipelineStage[] {
  const current = resolvePipelineStageForMap(map);
  const idx = pipelineStageIndex(current);
  return VISUAL_THINKING_PIPELINE_ORDER.slice(0, idx + 1);
}

function analysisMeta(analysis?: VisualFocusAnalysis): Record<string, number> {
  if (!analysis) {
    return {
      has_analysis: 0,
      recommendation_count: 0,
      risk_count: 0,
      opportunity_count: 0,
    };
  }
  return {
    has_analysis: 1,
    recommendation_count: analysis.recommendations.length,
    risk_count: analysis.risks.length,
    opportunity_count: analysis.opportunities.length,
  };
}

/**
 * End-of-cycle hook: capture learning signals and feed Founder Intelligence™.
 * Called after visual output + insights are materialized on the map.
 */
export function completeVisualThinkingIntelligenceCycle(map: VisualFocusMap): void {
  const frameworkId = frameworkIdForMap(map);
  const pipelineStage = resolvePipelineStageForMap(map);
  const analysis = map.businessCanvasImpactAnalysis ?? map.analysis;
  const meta = {
    ...analysisMeta(analysis),
    pipeline_stage: pipelineStage,
    generated: map.workflowStage === "generated" ? 1 : 0,
  };

  captureVisualThinkingSession({
    mapId: map.id,
    frameworkId,
    stage: "learn",
    meta,
  });

  feedFounderIntelligenceFromVisualThinking({
    mapId: map.id,
    frameworkId,
    stage: "feed_founder",
    meta,
  });
}

/** Session start — understanding before structure. */
export function beginVisualThinkingSession(map: VisualFocusMap): void {
  captureVisualThinkingSession({
    mapId: map.id,
    frameworkId: map.mode,
    stage: "understand",
    meta: {
      has_purpose: map.purposeAnchor?.userAnswer?.trim() ? 1 : 0,
      predefined_structure: frameworkIdForMap(map) === "business-canvas" ? 1 : 0,
    },
  });
}

