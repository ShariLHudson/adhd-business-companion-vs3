// Founder Ecosystem — Phase 14 Automation History.
// Tracks what was automated, when, the outcome, the tool used, and an estimate
// of time saved. Built from completed/failed queue items. Pure.

import type {
  AutomationAction,
  AutomationActionType,
  AutomationHistoryRecord,
  AutomationHistoryStats,
  Tool,
} from "./automationTypes";

// Rough minutes-saved per action type (used when an outcome doesn't specify).
const TIME_SAVED: Partial<Record<AutomationActionType, number>> = {
  "draft-email": 12,
  "create-draft": 20,
  "create-google-doc": 18,
  "update-google-doc": 8,
  "create-google-sheet": 20,
  "update-google-sheet": 8,
  "create-google-form": 15,
  "research-topic": 25,
  "generate-prompt": 10,
  "send-context-package": 8,
  "create-internal-task": 3,
  "load-project": 2,
  "open-workspace": 2,
  "send-email": 10,
  "schedule-appointment": 6,
  "create-external-record": 6,
  "publish-content": 12,
  "trigger-workflow": 15,
};

const estimateTimeSaved = (a: AutomationAction): number =>
  a.outcome?.timeSavedMinutes ?? TIME_SAVED[a.actionType] ?? 5;

export function buildAutomationHistory(
  actions: AutomationAction[],
): AutomationHistoryRecord[] {
  return actions
    .filter((a) => a.status === "completed" || a.status === "failed")
    .map((a) => ({
      actionId: a.id,
      title: a.title,
      tool: a.tool,
      actionType: a.actionType,
      ts: a.completedAt ?? a.createdAt,
      ok: a.status === "completed" && (a.outcome?.ok ?? true),
      timeSavedMinutes: a.status === "completed" ? estimateTimeSaved(a) : 0,
    }))
    .sort((x, y) => (x.ts < y.ts ? 1 : -1));
}

export function computeAutomationStats(
  actions: AutomationAction[],
): AutomationHistoryStats {
  const history = buildAutomationHistory(actions);
  const succeeded = history.filter((h) => h.ok);
  const failed = history.filter((h) => !h.ok);
  const totalTimeSavedMinutes = succeeded.reduce((a, h) => a + h.timeSavedMinutes, 0);

  const toolMap = new Map<Tool, { count: number; timeSaved: number }>();
  for (const h of succeeded) {
    const cur = toolMap.get(h.tool) ?? { count: 0, timeSaved: 0 };
    cur.count += 1;
    cur.timeSaved += h.timeSavedMinutes;
    toolMap.set(h.tool, cur);
  }

  return {
    total: history.length,
    succeeded: succeeded.length,
    failed: failed.length,
    totalTimeSavedMinutes,
    byTool: [...toolMap.entries()]
      .map(([tool, v]) => ({ tool, count: v.count, timeSaved: v.timeSaved }))
      .sort((a, b) => b.timeSaved - a.timeSaved),
  };
}

export function formatTimeSaved(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
