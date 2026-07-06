import type { SparkObservation } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class ObservationService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  listObservations(): SparkObservation[] {
    return this.repo.observations();
  }

  observationsForSignal(signalId: string): SparkObservation[] {
    return this.repo.observations().filter((o) => o.signalId === signalId);
  }
}

export const observationService = new ObservationService();
