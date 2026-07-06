import type { SparkSignal } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class SparkSignalService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listSignals(): SparkSignal[] {
    return this.repo.signals();
  }

  getSignal(id: string): SparkSignal | undefined {
    return this.repo.signals().find((s) => s.id === id);
  }

  signalsByCategory(category: SparkSignal["category"]): SparkSignal[] {
    return this.repo.signals().filter((s) => s.category === category);
  }
}

export const sparkSignalService = new SparkSignalService();

/** @deprecated Use sparkSignalService */
export const signalService = sparkSignalService;
