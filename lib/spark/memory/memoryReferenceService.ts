import type { SparkMemoryReference } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class SparkMemoryReferenceService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listReferences(): SparkMemoryReference[] {
    return this.repo.memoryRefs();
  }

  referencesForProduct(
    product: SparkMemoryReference["productScope"],
  ): SparkMemoryReference[] {
    return this.repo.memoryRefs().filter((r) => r.productScope === product);
  }
}

export const sparkMemoryReferenceService = new SparkMemoryReferenceService();

/** @deprecated Use sparkMemoryReferenceService */
export const memoryReferenceService = sparkMemoryReferenceService;
