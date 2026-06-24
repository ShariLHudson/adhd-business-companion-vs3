import type { BusinessCanvasData, BusinessCanvasSectionId } from "../types";
import { guidanceForSection } from "../guidance";
import { BUSINESS_CANVAS_SECTION_ORDER } from "../types";
import {
  BUSINESS_CANVAS_RELATIONSHIP_MATRIX,
  relationshipWeightNumeric,
} from "./relationshipMatrix";
import type {
  BusinessCanvasHealthOverview,
  SectionStrengthLabel,
  SectionStrengthResult,
} from "./types";

function scoreCompleteness(items: string[]): number {
  const filled = items.map((i) => i.trim()).filter(Boolean);
  if (filled.length === 0) return 0;
  if (filled.length === 1) {
    const len = filled[0]!.length;
    if (len < 12) return 30;
    if (len < 28) return 60;
    return 75;
  }
  const avgLen =
    filled.reduce((sum, i) => sum + i.length, 0) / filled.length;
  if (avgLen < 15) return 65;
  if (avgLen < 35) return 85;
  return 100;
}

function scoreConnectedness(
  sectionId: BusinessCanvasSectionId,
  data: BusinessCanvasData,
): number {
  const relations = BUSINESS_CANVAS_RELATIONSHIP_MATRIX[sectionId];
  if (!relations.length) return 0;

  let weighted = 0;
  let totalWeight = 0;
  for (const rel of relations) {
    const w = relationshipWeightNumeric(rel.weight);
    totalWeight += w;
    const targetItems = data.sections[rel.target].items.filter((i) => i.trim());
    if (targetItems.length > 0) {
      weighted += w * Math.min(100, 40 + targetItems.length * 20);
    }
  }
  return totalWeight > 0 ? Math.round(weighted / totalWeight) : 0;
}

function scoreConfidence(
  completeness: number,
  connectedness: number,
  items: string[],
): number {
  const specificity =
    items.some((i) => i.trim().length >= 24) ? 15 : items.some((i) => i.trim()) ? 8 : 0;
  const raw = completeness * 0.45 + connectedness * 0.4 + specificity;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function userLabelForScore(score: number): {
  label: SectionStrengthLabel;
  text: string;
} {
  if (score >= 85) return { label: "ready_for_analysis", text: "Ready for analysis" };
  if (score >= 66) return { label: "strong", text: "Strong" };
  if (score >= 36) return { label: "good_starting_point", text: "Good starting point" };
  return { label: "needs_more_detail", text: "Needs more detail" };
}

export function scoreSectionStrength(
  sectionId: BusinessCanvasSectionId,
  data: BusinessCanvasData,
): SectionStrengthResult {
  const items = data.sections[sectionId].items;
  const completeness = scoreCompleteness(items);
  const connectedness = scoreConnectedness(sectionId, data);
  const confidence = scoreConfidence(completeness, connectedness, items);
  const overall = Math.round(
    completeness * 0.35 + connectedness * 0.3 + confidence * 0.35,
  );
  const { label, text } = userLabelForScore(overall);

  return {
    sectionId,
    completeness,
    connectedness,
    confidence,
    overall,
    userLabel: label,
    userLabelText: text,
  };
}

export function buildBusinessCanvasHealthOverview(
  data: BusinessCanvasData,
): BusinessCanvasHealthOverview {
  const sections = BUSINESS_CANVAS_SECTION_ORDER.map((id) =>
    scoreSectionStrength(id, data),
  );
  const strongCount = sections.filter((s) => s.overall >= 66).length;
  const needsDetailCount = sections.filter((s) => s.overall < 36).length;
  const overallConfidence = Math.round(
    sections.reduce((sum, s) => sum + s.confidence, 0) / sections.length,
  );

  return {
    computedAt: new Date().toISOString(),
    sections,
    strongCount,
    needsDetailCount,
    overallConfidence,
  };
}

export function sectionTitleForHealth(sectionId: BusinessCanvasSectionId): string {
  return guidanceForSection(sectionId).title;
}
