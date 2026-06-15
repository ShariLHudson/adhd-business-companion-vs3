/**
 * Founder-facing activation reporting — where users commonly get stuck.
 */

import { getActivationStore } from "./activationStore";
import type { ActivationBlockerType, FounderActivationReport } from "./types";

const BLOCKER_LABELS: Record<ActivationBlockerType, string> = {
  overwhelm: "Overwhelm",
  clarity: "Clarity",
  fear_rsd: "Fear / RSD",
  perfectionism: "Perfectionism",
  energy: "Energy",
  decision: "Decision",
  task_friction: "Task friction",
};

export function buildFounderActivationReport(
  now = new Date(),
): FounderActivationReport {
  const store = getActivationStore();
  const since7d = now.getTime() - 7 * 86_400_000;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const stuckOrFrozenCount = recent.filter(
    (s) => s.state === "stuck" || s.state === "frozen",
  ).length;

  const blockerCounts = new Map<ActivationBlockerType, number>();
  const recCounts = new Map<string, number>();

  for (const sample of recent) {
    if (sample.primaryBlocker) {
      blockerCounts.set(
        sample.primaryBlocker,
        (blockerCounts.get(sample.primaryBlocker) ?? 0) + 1,
      );
    }
    const recId = stepToRecId(sample.suggestedNextStep);
    recCounts.set(recId, (recCounts.get(recId) ?? 0) + 1);
  }

  const commonBlockers = [...blockerCounts.entries()]
    .map(([type, count]) => ({
      type,
      label: BLOCKER_LABELS[type],
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const commonRecommendations = [...recCounts.entries()]
    .map(([id, count]) => ({ id, label: recIdLabel(id), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topBlocker = commonBlockers[0]?.type;
  const recommendedFounderAction = founderActionFor(topBlocker);

  return {
    generatedAt: now.toISOString(),
    stuckOrFrozenCount,
    sampleSize: recent.length,
    commonBlockers,
    commonRecommendations,
    loadTrend: "stable",
    recommendedFounderAction,
    notes:
      "Local preview — connect anonymized aggregates for org-wide activation trends.",
  };
}

function stepToRecId(step: string): string {
  const s = step.toLowerCase();
  if (s.includes("park") || s.includes("priority")) return "reduce_scope";
  if (s.includes("5-minute") || s.includes("shrink")) return "shrink_task";
  if (s.includes("recovery")) return "recovery_step";
  if (s.includes("narrow") || s.includes("two options")) return "narrow_decision";
  if (s.includes("good-enough") || s.includes("finish line")) {
    return "good_enough";
  }
  return "small_next_step";
}

function recIdLabel(id: string): string {
  const labels: Record<string, string> = {
    reduce_scope: "Reduce scope / park ideas",
    shrink_task: "Shrink to 5-minute step",
    recovery_step: "Recovery step first",
    narrow_decision: "Narrow decisions",
    good_enough: "Good-enough version",
    small_next_step: "Small next step",
  };
  return labels[id] ?? id;
}

function founderActionFor(
  blocker: ActivationBlockerType | undefined,
): string {
  switch (blocker) {
    case "overwhelm":
      return "Review onboarding for load-reduction tools (brain dump, park list).";
    case "clarity":
      return "Ensure next-action prompts are visible on project home.";
    case "energy":
      return "Surface recovery options before productivity nudges.";
    case "fear_rsd":
      return "Add more safe-draft / private-first workflows.";
    case "perfectionism":
      return "Highlight good-enough shipping examples in content.";
    case "decision":
      return "Offer decision-narrowing templates in companion.";
    case "task_friction":
      return "Promote timer / body-doubling pairing for hard tasks.";
    default:
      return "Monitor stuck patterns — no product change suggested yet.";
  }
}
