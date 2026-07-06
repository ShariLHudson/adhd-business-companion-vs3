import type { OvernightCycleHistoryRecord, OvernightCycleRun } from "../types";
import { overnightSampleRepository } from "../repositories/sample";

export function listCycleHistory(): OvernightCycleHistoryRecord[] {
  return overnightSampleRepository.listHistory();
}

export function getCycleHistory(date: string): OvernightCycleHistoryRecord | undefined {
  return listCycleHistory().find((h) => h.date === date);
}

export function getLatestCycleHistory(): OvernightCycleHistoryRecord | undefined {
  return listCycleHistory()[0];
}

export function recordFromCycleRun(run: OvernightCycleRun): OvernightCycleHistoryRecord {
  const office = run.preparedOffice;
  return {
    id: `hist-${run.date}`,
    date: run.date,
    signalsProcessed: office.morning.stats.researchItemsReviewed,
    researchProcessed: office.morning.stats.researchItemsReviewed,
    questionsPrepared: office.todaysQuestions.length,
    recommendations: office.recommendations.length,
    missionUpdates: 1,
    opportunitiesDiscovered: office.opportunities.length,
    risksDiscovered: office.risks.length,
    briefGenerated: true,
    cycleId: run.id,
  };
}
