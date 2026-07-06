import { sampleMemoryRepository } from "../repositories/sample";
import type { FounderDecision } from "../types";

export function listVaultDecisions(): FounderDecision[] {
  return sampleMemoryRepository.listDecisions();
}

export function getVaultDecision(id: string): FounderDecision | undefined {
  return sampleMemoryRepository.getDecision(id);
}
