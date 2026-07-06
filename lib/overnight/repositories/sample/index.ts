import {
  SAMPLE_COLLECTED_SIGNALS,
  SAMPLE_OVERNIGHT_CYCLE_RUN,
  SAMPLE_OVERNIGHT_HISTORY,
  SAMPLE_PREPARED_OFFICE,
  getSampleCycleRun,
  getSamplePreparedOffice,
  listSampleCycleHistory,
} from "../../sample";

export const overnightSampleRepository = {
  listSignals: () => [...SAMPLE_COLLECTED_SIGNALS],
  getPreparedOffice: (date?: string) => getSamplePreparedOffice(date),
  getCycleRun: (id?: string) => getSampleCycleRun(id),
  listHistory: () => listSampleCycleHistory(),
  getLatestCycle: () => SAMPLE_OVERNIGHT_CYCLE_RUN,
  getLatestOffice: () => SAMPLE_PREPARED_OFFICE,
};

export type OvernightSampleRepository = typeof overnightSampleRepository;
