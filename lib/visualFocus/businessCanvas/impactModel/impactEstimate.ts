import { affectedSectionsForChange } from "../changeExploration";
import type { BusinessCanvasSectionId } from "../types";
import { guidanceForSection } from "../guidance";
import {
  BUSINESS_CANVAS_RELATIONSHIP_MATRIX,
  relationshipWeightNumeric,
} from "./relationshipMatrix";
import type {
  CanvasImpactStateMap,
  CanvasImpactVisualState,
  ChangeImpactEstimate,
  ImpactLevel,
  SectionImpactEstimate,
} from "./types";
import { IMPACT_LEVEL_PERCENT } from "./types";

function levelFromWeight(weight: number): ImpactLevel {
  if (weight >= 70) return "high";
  if (weight >= 45) return "medium";
  return "low";
}

function directionForSection(
  sectionId: BusinessCanvasSectionId,
  change: string,
): SectionImpactEstimate["direction"] {
  const c = change.toLowerCase();
  if (/risk|worried|lose|cost|strain/i.test(c) && /cost|revenue|relationship/i.test(sectionId)) {
    return "risk";
  }
  if (/growth|opportunity|expand|new|add/i.test(c)) {
    return "opportunity";
  }
  if (/membership|revenue|channel/i.test(sectionId) && /add|new|launch/i.test(c)) {
    return "opportunity";
  }
  return "neutral";
}

/** Directional impact estimate — not financial guarantees. */
export function estimateChangeImpact(changeText: string): ChangeImpactEstimate {
  const primary = affectedSectionsForChange(changeText);
  const secondary = new Set<BusinessCanvasSectionId>();

  for (const id of primary) {
    for (const rel of BUSINESS_CANVAS_RELATIONSHIP_MATRIX[id]) {
      if (!primary.includes(rel.target)) {
        secondary.add(rel.target);
      }
    }
  }

  const affectedSections: SectionImpactEstimate[] = [];

  for (const sectionId of primary) {
    const relWeight = BUSINESS_CANVAS_RELATIONSHIP_MATRIX[sectionId]
      .reduce((max, r) => Math.max(max, relationshipWeightNumeric(r.weight)), 50);
    const level = levelFromWeight(Math.min(100, relWeight + 15));
    affectedSections.push({
      sectionId,
      level,
      percent: IMPACT_LEVEL_PERCENT[level],
      direction: directionForSection(sectionId, changeText),
    });
  }

  for (const sectionId of secondary) {
    if (affectedSections.some((a) => a.sectionId === sectionId)) continue;
    affectedSections.push({
      sectionId,
      level: "medium",
      percent: IMPACT_LEVEL_PERCENT.medium,
      direction: directionForSection(sectionId, changeText),
    });
  }

  return {
    changeText: changeText.trim(),
    computedAt: new Date().toISOString(),
    affectedSections: affectedSections.sort((a, b) => b.percent - a.percent),
  };
}

export function impactStatesFromEstimate(
  estimate: ChangeImpactEstimate,
): CanvasImpactStateMap {
  const map: CanvasImpactStateMap = {};
  for (const item of estimate.affectedSections) {
    if (item.level === "high") {
      map[item.sectionId] =
        item.direction === "risk"
          ? "risk"
          : item.direction === "opportunity"
            ? "opportunity"
            : "high";
    } else if (item.level === "medium") {
      map[item.sectionId] = item.direction === "opportunity" ? "opportunity" : "medium";
    } else {
      map[item.sectionId] = "low";
    }
  }
  return map;
}

export function impactLabelForLevel(level: ImpactLevel): string {
  switch (level) {
    case "high":
      return "Likely high impact";
    case "medium":
      return "Likely medium impact";
    case "low":
      return "Likely low impact";
  }
}

export function sectionImpactSummary(estimate: ChangeImpactEstimate): string {
  const top = estimate.affectedSections.slice(0, 3);
  return top
    .map(
      (t) =>
        `${guidanceForSection(t.sectionId).title} — ${impactLabelForLevel(t.level)} (${t.percent}%)`,
    )
    .join("; ");
}

export const IMPACT_STATE_RING: Record<
  CanvasImpactVisualState,
  { ring: string; label: string }
> = {
  none: { ring: "transparent", label: "" },
  low: { ring: "#94a3b8", label: "Likely low impact" },
  medium: { ring: "#f59e0b", label: "Likely medium impact" },
  high: { ring: "#dc2626", label: "Likely high impact" },
  positive: { ring: "#16a34a", label: "Positive shift" },
  risk: { ring: "#dc2626", label: "Risk area" },
  opportunity: { ring: "#16a34a", label: "Opportunity" },
  future: { ring: "#6366f1", label: "Future change" },
};
