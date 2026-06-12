// Founder Ecosystem — Phase 15 Dashboard metrics view-model.
// Powers Command Center / dashboard sections for learning insights.

import type { FounderEvent } from "../events";
import type { ID, ISODateString } from "../models";
import {
  automationSuccessMetrics,
  engagementHeatmap,
  overallAutomationSuccessRate,
  pendingVsExecutedCounts,
  toolUsageFrequency,
  totalTimeSavedMinutes,
  workflowEfficiencyPatterns,
} from "./ecosystemAnalytics";
import { computeAutomationScores } from "./ecosystemLearning";
import type { LearningDashboard } from "./learningTypes";

function insightLines(events: FounderEvent[], founderId: ID): string[] {
  const insights: string[] = [];
  const scores = computeAutomationScores(events, founderId);
  const top = scores.sort((a, b) => b.score - a.score)[0];
  const low = scores.sort((a, b) => a.score - b.score)[0];
  const saved = totalTimeSavedMinutes(events, founderId);
  const pending = pendingVsExecutedCounts(events, founderId);

  if (saved > 0) {
    insights.push(`You've saved about ${saved} minutes through automations and assisted actions.`);
  }
  if (top && top.score >= 70) {
    insights.push(`${top.title} is your strongest automation (${top.executionRate}% executed).`);
  }
  if (low && low.ignoreRate > 40) {
    insights.push(`Consider pausing "${low.title}" — it is often skipped.`);
  }
  if (pending.pending > pending.executed) {
    insights.push(`${pending.pending} actions are still pending — pick one small win to execute.`);
  }
  if (insights.length === 0) {
    insights.push("Keep using suggested automations — the system learns from each approval.");
  }
  return insights;
}

export function buildLearningDashboard(
  events: FounderEvent[],
  founderId: ID,
  now: Date = new Date(),
): LearningDashboard {
  return {
    founderId,
    generatedAt: now.toISOString() as ISODateString,
    automationSuccess: automationSuccessMetrics(events, founderId),
    pendingVsExecuted: pendingVsExecutedCounts(events, founderId),
    timeSavedPerTool: toolUsageFrequency(events, founderId),
    engagementHeatmap: engagementHeatmap(events, founderId),
    workflowEfficiency: workflowEfficiencyPatterns(events, founderId),
    totalTimeSavedMinutes: totalTimeSavedMinutes(events, founderId),
    overallSuccessRate: overallAutomationSuccessRate(events, founderId),
    insights: insightLines(events, founderId),
  };
}

/** Section labels for UI panels. */
export const LEARNING_DASHBOARD_SECTIONS = [
  { id: "automation-success", title: "Automation Success Metrics" },
  { id: "pending-executed", title: "Pending vs. Executed Actions" },
  { id: "time-saved-tools", title: "Time Saved Per Tool" },
  { id: "engagement-heatmap", title: "Founder Engagement Heatmap" },
  { id: "workflow-efficiency", title: "Workflow Efficiency" },
] as const;
