import type { SparkFinding } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class SparkFindingService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listFindings(): SparkFinding[] {
    return this.repo.findings();
  }

  findingsForSignal(signalId: string): SparkFinding[] {
    return this.repo.findings().filter((f) => f.signalId === signalId);
  }
}

export const sparkFindingService = new SparkFindingService();
