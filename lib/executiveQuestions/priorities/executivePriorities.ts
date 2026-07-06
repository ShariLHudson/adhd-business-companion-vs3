import type { ExecutivePriority, ExecutivePriorityLevel } from "../types";

const LEVEL_SCORE: Record<ExecutivePriorityLevel, number> = {
  critical: 92,
  high: 78,
  medium: 55,
  low: 32,
};

export function buildExecutivePriority(params: {
  level: ExecutivePriorityLevel;
  founderImportance?: number;
  customerImpact?: number;
  revenuePotential?: number;
  label?: string;
}): ExecutivePriority {
  const base = LEVEL_SCORE[params.level];
  const founderImportance = params.founderImportance ?? base;
  const customerImpact = params.customerImpact ?? Math.round(base * 0.9);
  const revenuePotential = params.revenuePotential ?? Math.round(base * 0.75);

  return {
    level: params.level,
    score: Math.round((founderImportance + customerImpact + revenuePotential) / 3),
    founderImportance,
    customerImpact,
    revenuePotential,
    label: params.label ?? params.level,
  };
}

export function compareExecutivePriority(a: ExecutivePriority, b: ExecutivePriority): number {
  return b.score - a.score;
}

export function meetsPriorityThreshold(
  priority: ExecutivePriority,
  minLevel?: ExecutivePriorityLevel,
): boolean {
  if (!minLevel) return true;
  const order: ExecutivePriorityLevel[] = ["low", "medium", "high", "critical"];
  return order.indexOf(priority.level) >= order.indexOf(minLevel);
}
