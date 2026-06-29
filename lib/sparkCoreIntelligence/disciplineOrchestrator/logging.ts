/**
 * Discipline activation logging and performance scoring.
 */

import { DISCIPLINE_LATENCY_BUDGET_MS } from "./execution";
import { weightContribution } from "./weighting";
import type {
  ActivationLogEntry,
  DisciplineContribution,
  DisciplinePerformanceScore,
  ExecutiveDisciplineId,
  OrchestrationScenario,
  SupportMode,
} from "./types";

const ALL_EXECUTIVE: ExecutiveDisciplineId[] = [
  "marketing",
  "sales",
  "business-strategy",
  "wordsmith",
  "research",
  "finance",
  "operations",
  "leadership",
  "creative-direction",
  "customer-experience",
  "ai-automation",
  "product-development",
  "learning-coach",
];

const activationLog: ActivationLogEntry[] = [];

export function logActivation(entry: ActivationLogEntry): void {
  activationLog.push(entry);
}

export function getActivationLog(threadId?: string): ActivationLogEntry[] {
  if (!threadId) return [...activationLog];
  return activationLog.filter((e) => e.turnId.startsWith(threadId));
}

export function scoreDisciplinePerformance(
  contributions: DisciplineContribution[],
  scenario: OrchestrationScenario,
): DisciplinePerformanceScore[] {
  return contributions.map((c) => {
    const relevanceBoost =
      scenario === "pricing_decision" && c.disciplineId === "finance" ? 0.15 : 0;
    const relevanceScore = Math.min(
      1,
      weightContribution(c) + relevanceBoost,
    );
    return {
      disciplineId: c.disciplineId,
      relevanceScore,
      latencyMs: c.durationMs,
      withinBudget: c.durationMs <= DISCIPLINE_LATENCY_BUDGET_MS,
      contributionWeight: weightContribution(c),
    };
  });
}

export function buildActivationLog(input: {
  turnId: string;
  scenario: OrchestrationScenario;
  activated: ExecutiveDisciplineId[];
  supportModes: SupportMode[];
  reason: string;
}): ActivationLogEntry {
  const skipped = ALL_EXECUTIVE.filter((id) => !input.activated.includes(id));
  return {
    turnId: input.turnId,
    scenario: input.scenario,
    activated: input.activated,
    skipped,
    supportModes: input.supportModes,
    reason: input.reason,
    timestamp: new Date().toISOString(),
  };
}

/** Test helper */
export function clearActivationLog(): void {
  activationLog.length = 0;
}
