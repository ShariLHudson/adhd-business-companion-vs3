// Founder Ecosystem — Phase 8 OS selectors (dashboard preparation).
// Thin, named accessors over a FounderOperatingState so UI panels can pull
// exactly the slice they render. Pure.

import type {
  AttentionState,
  CapacityState,
  FounderOperatingState,
  MomentumState,
  NextAction,
  OpportunitySummary,
  PriorityItem,
  ProjectHealth,
  RiskSummary,
} from "./fosTypes";

export const selectCurrentFocus = (s: FounderOperatingState) => s.currentFocus;

export const selectTodaysPriorities = (
  s: FounderOperatingState,
  limit = 3,
): PriorityItem[] => s.priorities.slice(0, limit);

export const selectCurrentRisks = (s: FounderOperatingState): RiskSummary[] => s.risks;

export const selectCurrentOpportunities = (
  s: FounderOperatingState,
): OpportunitySummary[] => s.opportunities;

export const selectNextAction = (s: FounderOperatingState): NextAction | null =>
  s.nextAction;

export const selectProjectHealth = (s: FounderOperatingState): ProjectHealth[] =>
  s.projectHealth.slice().sort((a, b) => a.healthScore - b.healthScore); // worst first

export const selectMomentum = (s: FounderOperatingState): MomentumState => s.momentum;

export const selectCapacity = (s: FounderOperatingState): CapacityState => s.capacity;

export const selectAttention = (s: FounderOperatingState): AttentionState => s.attention;

/** One-line operating headline for a status bar. */
export function operatingHeadline(s: FounderOperatingState): string {
  const focus = s.currentFocus ? s.currentFocus.action : "No pressing focus";
  return `${focus} · capacity ${s.capacity.level} · momentum ${s.momentum.direction} · attention ${s.attention.level}`;
}
