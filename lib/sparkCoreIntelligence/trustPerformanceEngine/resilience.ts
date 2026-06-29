/**
 * Resilience: fallback, degradation, retry, health.
 */

import type {
  CoreFour,
  FallbackResponse,
  ServiceHealth,
} from "./types";

export type RetryResult<T> = {
  value?: T;
  attempts: number;
  success: boolean;
  lastError?: string;
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 2,
): Promise<RetryResult<T>> {
  let lastError: string | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const value = await fn();
      return { value, attempts: attempt, success: true };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  return { attempts: maxAttempts, success: false, lastError };
}

export function buildFallback(
  reason: string,
  partialText?: string,
): FallbackResponse {
  const base =
    partialText?.trim() ||
    "I'm having a little trouble reaching one of my tools right now.";
  return {
    text: `${base} I'll still do my best with what I have — and we can refine from here.`,
    reason,
    partial: Boolean(partialText),
  };
}

export function gracefulDegradation(
  complexityLevel: number,
  serviceHealthy: boolean,
): { degraded: boolean; maxLevel: number } {
  if (serviceHealthy) return { degraded: false, maxLevel: complexityLevel };
  return {
    degraded: true,
    maxLevel: Math.min(complexityLevel, 2),
  };
}

export function checkServiceHealth(
  services: Array<{ name: string; latencyMs: number; thresholdMs: number }>,
): ServiceHealth[] {
  const now = Date.now();
  return services.map((s) => ({
    service: s.name,
    healthy: s.latencyMs <= s.thresholdMs,
    lastCheckMs: now,
    latencyMs: s.latencyMs,
  }));
}

export function evaluateCoreFour(input: {
  draftText?: string;
  intentDetectionMs: number;
  intentBudgetMs: number;
  totalBudgetMs: number;
  elapsedMs: number;
  goldenRulePassed: boolean;
  qualityPass?: boolean;
}): CoreFour {
  return {
    correctness: input.qualityPass !== false,
    speed:
      input.intentDetectionMs <= input.intentBudgetMs &&
      input.elapsedMs <= input.totalBudgetMs,
    trust: Boolean(input.draftText && !/\b(guarantee|definitely 100%)\b/i.test(input.draftText)),
    focus: input.goldenRulePassed,
  };
}

export function slowModuleDetection(
  modules: Array<{ name: string; durationMs: number; budgetMs: number }>,
): string[] {
  return modules
    .filter((m) => m.durationMs > m.budgetMs)
    .map((m) => `${m.name}:${m.durationMs}ms`);
}
