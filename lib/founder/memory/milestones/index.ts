import { sampleMemoryRepository } from "../repositories/sample";
import type { FounderMilestone } from "../types";

export function listCompanyMilestones(): FounderMilestone[] {
  return sampleMemoryRepository.listMilestones();
}
