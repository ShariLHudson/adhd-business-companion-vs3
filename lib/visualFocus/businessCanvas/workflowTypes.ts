import type { VisualFocusAnalysis } from "../types";
import type { BusinessCanvasImpactModelExtensions } from "./impactModel/types";

/** Business Canvas™ — current business first, then change exploration. */
export type BusinessCanvasWorkflowStage =
  | "buildCurrentCanvas"
  | "generatedCurrentCanvas"
  | "exploreChange"
  | "clarifyChange"
  | "generatedImpact";

export type BusinessCanvasChangeExploration = {
  description: string;
  followUpAnswers: Record<string, string>;
};

export type BusinessCanvasMapExtensions = {
  businessCanvasWorkflow?: BusinessCanvasWorkflowStage;
  businessCanvasChange?: BusinessCanvasChangeExploration;
  businessCanvasImpactAnalysis?: VisualFocusAnalysis;
} & BusinessCanvasImpactModelExtensions;

export const DEFAULT_BUSINESS_CANVAS_WORKFLOW: BusinessCanvasWorkflowStage =
  "buildCurrentCanvas";

export function normalizeBusinessCanvasWorkflow(
  stage?: BusinessCanvasWorkflowStage | null,
  legacyGenerated?: boolean,
): BusinessCanvasWorkflowStage {
  if (stage) return stage;
  if (legacyGenerated) return "generatedCurrentCanvas";
  return DEFAULT_BUSINESS_CANVAS_WORKFLOW;
}
