import { orchestratorSampleRepository } from "../repositories/sample";
import type { ExecutiveInitiative } from "../types";

const runtimeInitiatives: ExecutiveInitiative[] = [];

export function mergedInitiatives(): ExecutiveInitiative[] {
  const byId = new Map<string, ExecutiveInitiative>();
  for (const i of orchestratorSampleRepository.list()) byId.set(i.id, i);
  for (const i of runtimeInitiatives) byId.set(i.id, i);
  return [...byId.values()];
}

export function captureOrchestratorSnapshot() {
  const list = mergedInitiatives();
  return {
    capturedAt: new Date().toISOString(),
    initiativeCount: list.length,
    awaitingApproval: list.filter((i) => i.status === "awaiting_approval" || i.status === "needs_founder_decision").length,
    inProgress: list.filter((i) => i.status === "in_progress").length,
  };
}

export { runtimeInitiatives };
