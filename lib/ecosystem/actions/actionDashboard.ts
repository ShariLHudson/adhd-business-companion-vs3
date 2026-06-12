// Founder Ecosystem — Phase 11 Action Dashboard view-model.
//
// Recommended Actions, Current Action, History, Completed Today, Stalled.

import type { FounderEvent, ID } from "../events";
import { getFounderIntelligence } from "../intelligence";
import { buildExecutionPlan } from "../ops/advisorExecutionEngine";
import { detectFounderJourney } from "../journey/founderJourneyEngine";
import { getFounderOperatingState } from "../fos/founderOperatingState";
import type { FounderAction } from "./actionTypes";
import { generateFounderActions } from "./founderActionEngine";
import {
  buildActionHistory,
  computeActionHistoryStats,
  reconcileActionStatuses,
} from "./actionHistory";
import {
  selectActiveActions,
  selectCurrentAction,
  selectRecommendedActions,
  selectStalledActions,
} from "./actionSelectors";

export type ActionDashboard = {
  founderId: ID;
  generatedAt: string;
  recommendedActions: FounderAction[];
  currentAction: FounderAction | null;
  activeCount: number;
  history: ReturnType<typeof buildActionHistory>;
  stats: ReturnType<typeof computeActionHistoryStats>;
  completedToday: FounderAction[];
  stalledActions: FounderAction[];
};

export function buildActionDashboard(
  events: FounderEvent[],
  founderId: ID = "founder-001",
): ActionDashboard {
  const intel = getFounderIntelligence(events, founderId);
  const journey = detectFounderJourney(events, founderId);
  const plan = buildExecutionPlan(intel, events);
  const os = getFounderOperatingState(events, founderId);

  const raw = generateFounderActions({
    intelligence: intel,
    journeyRecommendations: journey.recommendations,
    executionSteps: plan,
    priorities: os.priorities.slice(0, 3),
    events,
    limit: 15,
  });

  const actions = reconcileActionStatuses(raw, events);
  const stats = computeActionHistoryStats(events);
  const history = buildActionHistory(events);
  const completedToday = actions.filter(
    (a) => a.status === "completed" && a.completedAt && isToday(a.completedAt),
  );

  return {
    founderId,
    generatedAt: new Date().toISOString(),
    recommendedActions: selectRecommendedActions(actions, 5),
    currentAction: selectCurrentAction(actions),
    activeCount: selectActiveActions(actions).length,
    history: history.slice(-20),
    stats,
    completedToday,
    stalledActions: selectStalledActions(actions),
  };
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}
