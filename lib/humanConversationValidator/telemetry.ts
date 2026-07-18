/**
 * Package 209 — HCV telemetry (no sensitive conversation bodies).
 */

import type { HumanConversationFailureCode } from "./types";

export type HcvTelemetryEvent = {
  experienceId: string;
  turnId: string;
  passed: boolean;
  overallScore: number;
  criticalFailure: boolean;
  regenerated: boolean;
  usedFallback: boolean;
  failureCodes: HumanConversationFailureCode[];
  at: string;
};

const buffer: HcvTelemetryEvent[] = [];
const MAX = 200;

export function recordHcvTelemetry(event: HcvTelemetryEvent): void {
  buffer.push(event);
  if (buffer.length > MAX) buffer.splice(0, buffer.length - MAX);
}

export function getHcvTelemetryBuffer(): readonly HcvTelemetryEvent[] {
  return buffer;
}

export function resetHcvTelemetryForTests(): void {
  buffer.length = 0;
}

export function summarizeHcvTelemetry(): {
  passRate: number;
  regenerationRate: number;
  fallbackRate: number;
  topFailureCodes: { code: string; count: number }[];
} {
  if (buffer.length === 0) {
    return {
      passRate: 1,
      regenerationRate: 0,
      fallbackRate: 0,
      topFailureCodes: [],
    };
  }
  const passed = buffer.filter((e) => e.passed).length;
  const regen = buffer.filter((e) => e.regenerated).length;
  const fallback = buffer.filter((e) => e.usedFallback).length;
  const counts = new Map<string, number>();
  for (const e of buffer) {
    for (const c of e.failureCodes) {
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
  }
  const topFailureCodes = [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  return {
    passRate: passed / buffer.length,
    regenerationRate: regen / buffer.length,
    fallbackRate: fallback / buffer.length,
    topFailureCodes,
  };
}
