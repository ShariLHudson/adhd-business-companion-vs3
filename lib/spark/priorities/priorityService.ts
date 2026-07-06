import type { SparkPriority } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";
import { rankingService } from "../ranking/rankingService";

export class SparkPriorityService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listPriorities(): SparkPriority[] {
    return rankingService.rankByComposite(this.repo.priorities());
  }

  getPriority(id: string): SparkPriority | undefined {
    return this.repo.priorities().find((p) => p.id === id);
  }

  topPriorities(limit = 3): SparkPriority[] {
    return this.listPriorities().slice(0, limit);
  }
}

export const sparkPriorityService = new SparkPriorityService();

/** @deprecated Use sparkPriorityService */
export const priorityService = sparkPriorityService;
