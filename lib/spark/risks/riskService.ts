import type { SparkRisk } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

const SEVERITY_ORDER: Record<SparkRisk["severity"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export class RiskService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listRisks(): SparkRisk[] {
    return [...this.repo.risks()].sort(
      (a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity],
    );
  }
}

export const riskService = new RiskService();
