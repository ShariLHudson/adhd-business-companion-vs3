import type { OvernightCycleRun } from "../types";
import {
  runCollectPhase,
  runNormalizePhase,
  runObservePhase,
  runPreparePhase,
  runPrioritizePhase,
  runReasonPhase,
  runRecommendPhase,
} from "../phases";
import { recordFromCycleRun } from "../history/cycleHistory";
import { overnightSampleRepository } from "../repositories/sample";
import { OVERNIGHT_PHASE_TIMELINE } from "../timeline/cycleTimeline";

export function runOvernightCycle(): OvernightCycleRun {
  const startedAt = new Date().toISOString();
  const date = startedAt.slice(0, 10);

  const collected = runCollectPhase();
  const normalized = runNormalizePhase(collected);
  const observed = runObservePhase(normalized);
  const reasoned = runReasonPhase(observed);
  const recommended = runRecommendPhase(reasoned);
  const prioritized = runPrioritizePhase(recommended);
  const preparedOffice = runPreparePhase(prioritized);

  const completedAt = new Date().toISOString();

  const run: OvernightCycleRun = {
    id: `cycle-${date}`,
    date,
    startedAt,
    completedAt,
    phases: OVERNIGHT_PHASE_TIMELINE.map((p) => p.id),
    preparedOffice,
  };

  recordFromCycleRun(run);
  return run;
}

export function runOvernightCycleSample(): OvernightCycleRun {
  return overnightSampleRepository.getLatestCycle();
}
