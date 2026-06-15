/**
 * Founder-facing decision intelligence reporting.
 */

import { blockerLabel } from "./decisionInsights";
import { getDecisionStore } from "./decisionStore";
import type {
  DecisionBlocker,
  DecisionType,
  FounderDecisionReport,
} from "./types";

const MS_DAY = 86_400_000;

const TYPE_LABELS: Record<DecisionType, string> = {
  priority_decision: "Priority",
  business_decision: "Business",
  project_decision: "Project",
  content_decision: "Content",
  relationship_decision: "Relationship",
  time_decision: "Time",
  money_decision: "Money",
  personal_decision: "Personal",
  custom: "Custom",
};

const STUCK_STATES = new Set(["stuck", "overloaded", "avoiding"]);

export function decisionTypeLabel(type: DecisionType): string {
  return TYPE_LABELS[type];
}

export function buildFounderDecisionReport(
  now = new Date(),
): FounderDecisionReport {
  const store = getDecisionStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const blockerCounts = new Map<DecisionBlocker, number>();
  const typeCounts = new Map<DecisionType, number>();
  let stuckInLoopCount = 0;

  for (const s of recent) {
    const type = s.type as DecisionType;
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    if (STUCK_STATES.has(s.state)) stuckInLoopCount += 1;
    for (const b of s.blockers) {
      blockerCounts.set(b, (blockerCounts.get(b) ?? 0) + 1);
    }
  }

  const commonBlockers = [...blockerCounts.entries()]
    .map(([blocker, count]) => ({
      blocker,
      label: blockerLabel(blocker),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const commonTypes = [...typeCounts.entries()]
    .map(([type, count]) => ({
      type,
      label: decisionTypeLabel(type),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const top = commonBlockers[0]?.blocker;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    commonBlockers,
    commonTypes,
    stuckInLoopCount,
    parkedCount: store.parked.length,
    resolvedCount: store.resolvedCount,
    recommendedFounderAction: founderActionFor(top),
    notes:
      "Local preview — improve decision support flows, never pressure indecision.",
  };
}

function founderActionFor(blocker: DecisionBlocker | undefined): string {
  switch (blocker) {
    case "too_many_options":
      return "Promote “narrow to two” flows before comparison frameworks.";
    case "fear_of_wrong_choice":
      return "Emphasize reversible small tests — reduce permanence anxiety.";
    case "high_cognitive_load":
      return "Default to park-it when load is high — avoid complex decision trees.";
    case "too_much_information":
      return "Research/planning loops are common — good-enough test beats more reading.";
    case "perfectionism":
      return "Surface good-enough framing in decision copy.";
    case "low_energy":
      return "Energy-match recommendations before impact matrices.";
    default:
      return "Monitor where users stall — keep support explainable and optional.";
  }
}
