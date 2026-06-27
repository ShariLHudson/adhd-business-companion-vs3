import type { BusinessCanvasData, BusinessCanvasSectionId } from "../types";

export type RelationshipWeightLevel = "low" | "medium" | "high";

export const RELATIONSHIP_WEIGHT_NUMERIC: Record<RelationshipWeightLevel, number> = {
  low: 25,
  medium: 50,
  high: 75,
};

export type SectionStrengthScores = {
  completeness: number;
  connectedness: number;
  confidence: number;
};

export type SectionStrengthLabel =
  | "needs_more_detail"
  | "good_starting_point"
  | "strong"
  | "ready_for_analysis";

export type SectionStrengthResult = SectionStrengthScores & {
  sectionId: BusinessCanvasSectionId;
  overall: number;
  userLabel: SectionStrengthLabel;
  userLabelText: string;
};

export type BusinessCanvasHealthOverview = {
  computedAt: string;
  sections: SectionStrengthResult[];
  strongCount: number;
  needsDetailCount: number;
  overallConfidence: number;
};

export type ImpactLevel = "low" | "medium" | "high";

export const IMPACT_LEVEL_PERCENT: Record<ImpactLevel, number> = {
  low: 25,
  medium: 50,
  high: 75,
};

export type SectionImpactEstimate = {
  sectionId: BusinessCanvasSectionId;
  level: ImpactLevel;
  percent: number;
  direction: "neutral" | "positive" | "risk" | "opportunity";
};

export type ChangeImpactEstimate = {
  changeText: string;
  computedAt: string;
  affectedSections: SectionImpactEstimate[];
};

/** Visual readiness — future Living Canvas / ripple UX. */
export type CanvasImpactVisualState =
  | "none"
  | "low"
  | "medium"
  | "high"
  | "positive"
  | "risk"
  | "opportunity"
  | "future";

export type CanvasImpactStateMap = Partial<
  Record<BusinessCanvasSectionId, CanvasImpactVisualState>
>;

/** Phase 6 — version history readiness for Business Canvas snapshots. */
export type BusinessCanvasVersionRecord = {
  versionId: string;
  canvasId: string;
  versionName: string;
  createdAt: string;
  createdFrom?: "generate" | "manual" | "restore" | "change_explore";
  sectionSnapshot: BusinessCanvasData;
  changeSummary?: string;
  impactSummary?: string;
  restoredFromVersionId?: string;
  healthSnapshot?: BusinessCanvasHealthOverview;
};

export type BusinessCanvasImpactModelExtensions = {
  businessCanvasHealth?: BusinessCanvasHealthOverview;
  businessCanvasImpactStates?: CanvasImpactStateMap;
  businessCanvasVersionRecords?: BusinessCanvasVersionRecord[];
  businessCanvasLastImpactEstimate?: ChangeImpactEstimate;
};
