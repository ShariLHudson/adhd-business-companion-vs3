/**
 * Explainable decision insights — internal and founder-facing.
 */

import type { DecisionSnapshot, DecisionSupportMethod } from "./types";

const METHOD_LABELS: Record<DecisionSupportMethod, string> = {
  reduce_options: "Reduce options",
  clarify_goal: "Clarify goal",
  good_enough_choice: "Good-enough choice",
  future_self_lens: "Future self lens",
  energy_match: "Energy match",
  impact_effort_lens: "Impact / effort lens",
  reversible_vs_irreversible: "Reversible vs irreversible",
  park_it: "Decide later / park it",
};

const BLOCKER_LABELS: Record<DecisionSnapshot["blockers"][number], string> = {
  too_many_options: "Too many options",
  fear_of_wrong_choice: "Fear of wrong choice",
  perfectionism: "Perfectionism",
  lack_of_information: "Lack of information",
  too_much_information: "Too much information",
  low_energy: "Low energy",
  high_cognitive_load: "High cognitive load",
  rsd_or_rejection_fear: "RSD / rejection fear",
  urgency_pressure: "Urgency pressure",
  unclear_goal: "Unclear goal",
};

export function supportMethodLabel(method: DecisionSupportMethod): string {
  return METHOD_LABELS[method];
}

export function blockerLabel(
  blocker: DecisionSnapshot["blockers"][number],
): string {
  return BLOCKER_LABELS[blocker];
}

export function buildDecisionInsight(snapshot: DecisionSnapshot): string {
  const blockers =
    snapshot.blockers.length > 0
      ? snapshot.blockers.map((b) => blockerLabel(b)).join(", ")
      : "None flagged";
  return [
    `State: ${snapshot.decisionState}`,
    `Type: ${snapshot.decisionType}`,
    `Frame: ${supportMethodLabel(snapshot.recommendedFrame)}`,
    `Blockers: ${blockers}`,
    `Next: ${snapshot.suggestedNextStep}`,
  ].join(" · ");
}

export function explainDecisionSnapshot(snapshot: DecisionSnapshot): string[] {
  const lines: string[] = [];
  if (snapshot.blockers.includes("too_many_options")) {
    lines.push("Option overload detected — narrowing beats comparing everything.");
  }
  if (snapshot.blockers.includes("fear_of_wrong_choice")) {
    lines.push("Wrong-choice fear — test reversibility before committing.");
  }
  if (snapshot.blockers.includes("high_cognitive_load")) {
    lines.push("High load — big frameworks may add friction; park or shrink.");
  }
  if (
    snapshot.recommendedFrame === "good_enough_choice" ||
    snapshot.blockers.includes("perfectionism")
  ) {
    lines.push("Good-enough test may beat another research round.");
  }
  if (!lines.length) {
    lines.push("Light decision support — preserve user choice.");
  }
  return lines;
}
