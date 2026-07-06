import type { SparkMemoryReference } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class MemoryReferenceService {
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

export const memoryReferenceService = new MemoryReferenceService();
