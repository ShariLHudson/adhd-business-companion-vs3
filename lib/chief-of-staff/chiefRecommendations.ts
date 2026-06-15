/**
 * Chief of Staff recommendations — max 3 actions, capacity-first.
 */

import type { ChiefRecommendedAction } from "./types";
import type { ChiefSignalContext } from "./chiefSignals";

export function buildChiefRecommendations(
  context: ChiefSignalContext,
): ChiefRecommendedAction[] {
  const actions: ChiefRecommendedAction[] = [];

  for (const biz of context.businessOS.recommendedActions) {
    actions.push({
      id: `biz-${biz.id}`,
      label: biz.label,
      reason: biz.reason,
    });
  }

  if (context.recoveryStrained) {
    actions.push({
      id: "protect-energy",
      label: "Protect energy before adding features or projects",
      reason: "Recovery intelligence suggests strain",
    });
  }

  if (context.followUpCount > 0) {
    actions.push({
      id: "warm-follow-up",
      label: "Follow up with one warm partnership or client opportunity",
      reason: `${context.followUpCount} gentle follow-up(s) available`,
    });
  }

  const workflowAction = context.businessOS.recommendedActions.find((a) =>
    a.id.includes("workflow"),
  );
  if (workflowAction) {
    actions.push({
      id: "systemize-workflow",
      label: "Turn repeated setup process into a workflow",
      reason: workflowAction.reason,
    });
  }

  const activeLaunch = context.activeProjects.find(
    (p) => p.status === "active-focus" || p.status === "in-progress",
  );
  if (activeLaunch && context.newOpportunityCount >= 2) {
    actions.push({
      id: "finish-before-start",
      label: "Delay new project until current launch is complete",
      reason: `Finish "${activeLaunch.name}" may help more than starting`,
    });
  }

  if (context.briefingPriorities[0] && actions.length < 3) {
    actions.push({
      id: "briefing-priority",
      label: context.briefingPriorities[0],
      reason: "Morning briefing top priority",
    });
  }

  return dedupeActions(actions).slice(0, 3);
}

function dedupeActions(
  actions: ChiefRecommendedAction[],
): ChiefRecommendedAction[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}
