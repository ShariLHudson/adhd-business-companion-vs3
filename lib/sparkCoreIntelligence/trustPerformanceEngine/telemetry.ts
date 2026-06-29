/**
 * Performance telemetry recording (in-memory v1).
 */

import type { PerformanceTelemetry } from "./types";

const telemetryLog: PerformanceTelemetry[] = [];

export function recordTelemetry(entry: PerformanceTelemetry): void {
  telemetryLog.push(entry);
  if (telemetryLog.length > 500) telemetryLog.shift();
}

export function getTelemetrySummary(): {
  avgIntentMs: number;
  degradedRate: number;
  slowModuleCounts: Record<string, number>;
} {
  if (telemetryLog.length === 0) {
    return { avgIntentMs: 0, degradedRate: 0, slowModuleCounts: {} };
  }

  const avgIntentMs =
    telemetryLog.reduce((s, t) => s + t.intentDetectionMs, 0) / telemetryLog.length;
  const degradedRate =
    telemetryLog.filter((t) => t.degraded).length / telemetryLog.length;

  const slowModuleCounts: Record<string, number> = {};
  for (const t of telemetryLog) {
    for (const m of t.slowModules) {
      slowModuleCounts[m] = (slowModuleCounts[m] ?? 0) + 1;
    }
  }

  return { avgIntentMs, degradedRate, slowModuleCounts };
}

export function createTelemetry(
  turnId: string,
  partial: Partial<PerformanceTelemetry>,
): PerformanceTelemetry {
  return {
    turnId,
    intentDetectionMs: partial.intentDetectionMs ?? 0,
    cacheHits: partial.cacheHits ?? [],
    cacheMisses: partial.cacheMisses ?? [],
    slowModules: partial.slowModules ?? [],
    totalBudgetMs: partial.totalBudgetMs ?? 3000,
    degraded: partial.degraded ?? false,
    retried: partial.retried ?? false,
  };
}

/** Test helper */
export function clearTelemetry(): void {
  telemetryLog.length = 0;
}
