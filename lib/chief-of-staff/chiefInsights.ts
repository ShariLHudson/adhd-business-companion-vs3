/**
 * Chief of Staff insights — labels and explanations.
 */

import type { ChiefAssessmentLevel, ChiefOfStaffSnapshot } from "./types";

const ASSESSMENT_LABELS: Record<ChiefAssessmentLevel, string> = {
  calm: "Calm",
  focused: "Focused",
  stretched: "Stretched",
  overloaded: "Overloaded",
  critical: "Critical",
};

export function chiefAssessmentLabel(level: ChiefAssessmentLevel): string {
  return ASSESSMENT_LABELS[level];
}

export function explainChiefSnapshot(snapshot: ChiefOfStaffSnapshot): string {
  return [
    `Assessment: ${chiefAssessmentLabel(snapshot.overallAssessment)}`,
    `Capacity: ${snapshot.founderCapacity}`,
    `Focus: ${snapshot.recommendedFocus}`,
    `Risk: ${snapshot.biggestRisk}`,
    `Opportunity: ${snapshot.biggestOpportunity}`,
    `Ignore: ${snapshot.projectsToIgnore.slice(0, 3).join("; ") || "none"}`,
  ].join(" · ");
}

export function chiefAnswersSummary(snapshot: ChiefOfStaffSnapshot): string[] {
  return [
    `What matters most: ${snapshot.recommendedFocus}`,
    `What to ignore today: ${snapshot.projectsToIgnore.slice(0, 3).join(", ")}`,
    `Unnecessary load: ${snapshot.biggestRisk}`,
    `Best opportunity: ${snapshot.biggestOpportunity}`,
    `Can wait: ${snapshot.projectsToIgnore.join(", ")}`,
    `Become a system: ${snapshot.recommendedActions.find((a) => a.id.includes("workflow"))?.label ?? "Repeated steps you've done twice"}`,
  ];
}
