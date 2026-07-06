import { executiveDecisionSampleRepository } from "../repositories/sample";
import type { ExecutiveDecision } from "../types";

const runtimeDecisions: ExecutiveDecision[] = [];

export function mergedDecisions(): ExecutiveDecision[] {
  const byId = new Map<string, ExecutiveDecision>();
  for (const d of executiveDecisionSampleRepository.list()) byId.set(d.id, d);
  for (const d of runtimeDecisions) byId.set(d.id, d);
  return [...byId.values()];
}

export function captureDecisionHistorySnapshot() {
  const decisions = mergedDecisions();
  return {
    capturedAt: new Date().toISOString(),
    decisionCount: decisions.length,
    byStep: decisions.reduce(
      (acc, d) => {
        acc[d.currentStep] = (acc[d.currentStep] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    awaitingApproval: decisions.filter((d) =>
      d.approvalStages.some((s) => s.requiresExplicitApproval && s.status === "pending"),
    ).length,
  };
}

export { runtimeDecisions };
