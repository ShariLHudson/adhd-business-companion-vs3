// Founder Ecosystem — Phase 14 Automation dashboard view-model.
// Sections: Automation Opportunities, Pending Approvals, Recent Automations,
// Time Saved, Connected Apps. Pure — no rendering.

import type { FounderEvent, ID } from "../events";
import { getFounderOperatingState } from "../fos/founderOperatingState";
import { orchestrateIntent, toAutomationCard, type AutomationCard } from "./automationOrchestrator";
import {
  buildAutomationHistory,
  computeAutomationStats,
  formatTimeSaved,
} from "./automationHistory";
import {
  defaultConnectedApps,
  summarizeConnectedApps,
} from "./connectedAppsManager";
import {
  pendingApproval,
  type AutomationQueue,
  initQueue,
} from "./automationQueue";
import type {
  AutomationAction,
  ConnectedApp,
  AutomationHistoryRecord,
} from "./automationTypes";

export type AutomationDashboard = {
  founderId: ID;
  generatedAt: string;
  automationOpportunities: AutomationCard[];
  pendingApprovals: AutomationCard[];
  recentAutomations: AutomationHistoryRecord[];
  timeSaved: { totalMinutes: number; display: string; byTool: { tool: string; timeSaved: number }[] };
  connectedApps: ReturnType<typeof summarizeConnectedApps>;
};

export type AutomationDashboardInput = {
  events: FounderEvent[];
  founderId?: ID;
  queue?: AutomationQueue;
  apps?: ConnectedApp[];
  now?: Date;
};

/**
 * Surface automation OPPORTUNITIES from the operating state's next actions —
 * each next action is run through the router to become a prepared automation.
 */
export function buildAutomationDashboard(
  input: AutomationDashboardInput,
): AutomationDashboard {
  const founderId = input.founderId ?? "founder-001";
  const now = input.now ?? new Date();
  const apps = input.apps ?? defaultConnectedApps(now);
  const queue = input.queue ?? initQueue();
  const mine = input.events.filter((e) => e.founderId === founderId);

  const os = getFounderOperatingState(mine, founderId, { now });

  // Opportunities: top priorities + the recommended next action → routed.
  const intents = [
    ...(os.nextAction ? [os.nextAction.action] : []),
    ...os.priorities.slice(0, 4).map((p) => p.recommendedAction),
  ];
  const seen = new Set<string>();
  const automationOpportunities: AutomationCard[] = [];
  for (const intent of intents) {
    const key = intent.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    const { action } = orchestrateIntent(intent, { apps, now });
    automationOpportunities.push(toAutomationCard(action));
  }

  const completedItems: AutomationAction[] = queue.items;
  const history = buildAutomationHistory(completedItems);
  const stats = computeAutomationStats(completedItems);

  return {
    founderId,
    generatedAt: now.toISOString(),
    automationOpportunities,
    pendingApprovals: pendingApproval(queue).map(toAutomationCard),
    recentAutomations: history.slice(0, 10),
    timeSaved: {
      totalMinutes: stats.totalTimeSavedMinutes,
      display: formatTimeSaved(stats.totalTimeSavedMinutes),
      byTool: stats.byTool.map((t) => ({ tool: t.tool, timeSaved: t.timeSaved })),
    },
    connectedApps: summarizeConnectedApps(apps),
  };
}
