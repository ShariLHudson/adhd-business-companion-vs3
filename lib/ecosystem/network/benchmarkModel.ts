// Founder Ecosystem — Phase 17 Benchmark Model.
// Stage-aware benchmarks — only when minimum cohort size is met.

import type {
  AnonymizedFounderSnapshot,
  FounderBenchmarkComparison,
  StageBenchmark,
} from "./networkTypes";
import type { BusinessStage } from "../journey/journeyTypes";
import { COHORT_TOO_SMALL_MESSAGE, MINIMUM_COHORT_SIZE } from "./multiFounderConfig";

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function percentile(nums: number[], p: number): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx] ?? 0;
}

function band(value: number, med: number, spread: number): "below" | "near" | "above" {
  if (value < med - spread) return "below";
  if (value > med + spread) return "above";
  return "near";
}

function coachingForDeviation(
  metric: string,
  deviation: "below" | "near" | "above",
  stage: BusinessStage,
): string {
  if (deviation === "near") {
    return `Your ${metric} is in a typical range for founders at the ${stage} stage (trend, not a rule).`;
  }
  if (deviation === "below") {
    return `Your ${metric} trends below similar-stage founders — a small weekly target may help close the gap.`;
  }
  return `Your ${metric} trends above similar-stage founders — consider protecting what's working.`;
}

export function isCohortReady(cohortSize: number): boolean {
  return cohortSize >= MINIMUM_COHORT_SIZE;
}

export function buildStageBenchmarks(
  snapshots: AnonymizedFounderSnapshot[],
  totalCohortSize?: number,
): StageBenchmark[] {
  const cohortSize = totalCohortSize ?? snapshots.length;
  if (!isCohortReady(cohortSize)) return [];

  const byStage = new Map<BusinessStage, AnonymizedFounderSnapshot[]>();
  for (const s of snapshots) {
    const list = byStage.get(s.stage) ?? [];
    list.push(s);
    byStage.set(s.stage, list);
  }

  const benchmarks: StageBenchmark[] = [];
  for (const [stage, cohort] of byStage) {
    const tasks = cohort.map((s) => s.tasksCompletedPerWeek);
    const focus = cohort.map((s) => s.focusSessionsPerWeek);
    const advanced = cohort.map((s) => s.projectsAdvancedPerWeek);
    const timeBlocks = cohort.map((s) => s.timeBlocksCompletedPerWeek);
    const acceptance = cohort.map((s) => s.recommendationAcceptanceRate);
    const docRate = cohort.map((s) => s.documentCompletionRate);
    const stall = cohort.map((s) => s.projectStallRate);
    const automation = cohort.map((s) => s.automationExecutionRate);

    benchmarks.push({
      stage,
      sampleSize: cohort.length,
      tasksCompletedPerWeek: {
        median: median(tasks),
        average: average(tasks),
        p25: percentile(tasks, 25),
        p75: percentile(tasks, 75),
      },
      focusSessionsPerWeek: {
        median: median(focus),
        average: average(focus),
        p25: percentile(focus, 25),
        p75: percentile(focus, 75),
      },
      projectsAdvancedPerWeek: {
        median: median(advanced),
        average: average(advanced),
      },
      timeBlocksCompletedPerWeek: {
        median: median(timeBlocks),
        average: average(timeBlocks),
      },
      recommendationAcceptanceRate: { median: median(acceptance) },
      documentCompletionRate: { median: median(docRate) },
      projectStallRate: { median: median(stall) },
      automationExecutionRate: { median: median(automation) },
    });
  }

  return benchmarks.sort((a, b) => a.sampleSize - b.sampleSize);
}

export function compareFounderToBenchmarks(
  snapshot: AnonymizedFounderSnapshot,
  benchmarks: StageBenchmark[],
  cohortReady: boolean,
): FounderBenchmarkComparison[] {
  if (!cohortReady) return [];
  const bench = benchmarks.find((b) => b.stage === snapshot.stage);
  if (!bench) return [];

  const comparisons: FounderBenchmarkComparison[] = [];
  const add = (metric: string, founderValue: number, benchmarkMedian: number, spread: number) => {
    const deviation = band(founderValue, benchmarkMedian, spread);
    comparisons.push({
      stage: snapshot.stage,
      metric,
      founderValue,
      benchmarkMedian,
      deviation,
      coachingNote: coachingForDeviation(metric, deviation, snapshot.stage),
    });
  };

  add(
    "tasks completed per week",
    snapshot.tasksCompletedPerWeek,
    bench.tasksCompletedPerWeek.median,
    Math.max(1, bench.tasksCompletedPerWeek.p75 - bench.tasksCompletedPerWeek.p25),
  );
  add(
    "focus sessions per week",
    snapshot.focusSessionsPerWeek,
    bench.focusSessionsPerWeek.median,
    Math.max(1, bench.focusSessionsPerWeek.p75 - bench.focusSessionsPerWeek.p25),
  );
  add(
    "recommendation acceptance rate",
    snapshot.recommendationAcceptanceRate,
    bench.recommendationAcceptanceRate.median,
    15,
  );

  return comparisons;
}

export function benchmarkSummaryLine(
  snapshot: AnonymizedFounderSnapshot,
  benchmarks: StageBenchmark[],
  cohortReady: boolean,
): string | null {
  if (!cohortReady) return COHORT_TOO_SMALL_MESSAGE;
  const bench = benchmarks.find((b) => b.stage === snapshot.stage);
  if (!bench) return COHORT_TOO_SMALL_MESSAGE;
  return `Founders in the ${snapshot.stage} stage complete an average of ${bench.tasksCompletedPerWeek.average} tasks per week (trend, not a fact).`;
}

export function benchmarkLines(benchmarks: StageBenchmark[]): { label: string; value: string }[] {
  return benchmarks.flatMap((b) => [
    {
      label: `${b.stage} — tasks/week`,
      value: `~${b.tasksCompletedPerWeek.average} avg (median ${b.tasksCompletedPerWeek.median})`,
    },
    {
      label: `${b.stage} — focus sessions/week`,
      value: `~${b.focusSessionsPerWeek.average} avg`,
    },
    {
      label: `${b.stage} — launch follow-up`,
      value: "Founders in launching stage often benefit from scheduled sales follow-up blocks (trend).",
    },
  ]);
}
