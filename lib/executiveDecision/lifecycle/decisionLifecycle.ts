import type { DecisionLifecycleStep, ExecutiveDecision } from "../types";

export const LIFECYCLE_STEPS: DecisionLifecycleStep[] = [
  "discover",
  "understand",
  "generate_options",
  "compare",
  "recommend",
  "plan",
  "prepare",
  "approval",
  "implement",
  "monitor",
  "review",
  "remember",
];

export function lifecycleProgress(decision: ExecutiveDecision) {
  const index = LIFECYCLE_STEPS.indexOf(decision.currentStep);
  return {
    currentStep: decision.currentStep,
    completedSteps: decision.completedSteps,
    stepIndex: index,
    totalSteps: LIFECYCLE_STEPS.length,
    percentComplete: Math.round(((index + 1) / LIFECYCLE_STEPS.length) * 100),
  };
}

export function advanceLifecycle(
  decision: ExecutiveDecision,
  nextStep: DecisionLifecycleStep,
): ExecutiveDecision {
  const completed = new Set(decision.completedSteps);
  completed.add(decision.currentStep);
  completed.add(nextStep);
  return {
    ...decision,
    currentStep: nextStep,
    completedSteps: LIFECYCLE_STEPS.filter((s) => completed.has(s)),
    updatedAt: new Date().toISOString(),
  };
}

export function canAdvanceTo(decision: ExecutiveDecision, target: DecisionLifecycleStep): boolean {
  const currentIdx = LIFECYCLE_STEPS.indexOf(decision.currentStep);
  const targetIdx = LIFECYCLE_STEPS.indexOf(target);
  return targetIdx >= currentIdx;
}

export function lifecycleNarrative(decision: ExecutiveDecision): string[] {
  const progress = lifecycleProgress(decision);
  return [
    `Decision: ${decision.title}`,
    `Question: ${decision.question}`,
    `Current step: ${progress.currentStep} (${progress.percentComplete}% through lifecycle)`,
    `Opportunity: ${decision.opportunity}`,
    `Why it matters: ${decision.whyItMatters}`,
  ];
}
