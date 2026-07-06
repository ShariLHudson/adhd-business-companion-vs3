import type { ExecutiveInitiative, ExecutiveReview, OrchestratorStep } from "../types";

export const ORCHESTRATOR_STEPS: OrchestratorStep[] = [
  "discover",
  "understand",
  "options",
  "decision",
  "plan",
  "prepare",
  "approve",
  "orchestrate",
  "monitor",
  "adapt",
  "learn",
  "remember",
];

export function orchestratorProgress(initiative: ExecutiveInitiative) {
  const idx = ORCHESTRATOR_STEPS.indexOf(initiative.currentStep);
  return {
    currentStep: initiative.currentStep,
    completedSteps: initiative.completedSteps,
    percentComplete: Math.round(((idx + 1) / ORCHESTRATOR_STEPS.length) * 100),
  };
}

export function adaptInitiative(
  initiative: ExecutiveInitiative,
  changes: { scopeNote?: string; priorityShift?: string; newRisk?: string },
) {
  return {
    initiativeId: initiative.id,
    adaptedAt: new Date().toISOString(),
    changes,
    narrative: [
      changes.scopeNote ? `Scope: ${changes.scopeNote}` : null,
      changes.priorityShift ? `Priority: ${changes.priorityShift}` : null,
      changes.newRisk ? `Risk: ${changes.newRisk}` : null,
    ].filter(Boolean) as string[],
    status: "adapt" as const,
  };
}
