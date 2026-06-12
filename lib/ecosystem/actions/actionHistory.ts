// Founder Ecosystem — Phase 11 Action History.
//
// Tracks action lifecycle from events + reconciles with generated actions.
// Derives analytics: completed, skipped, dismissed, most successful, ignored.

import type { FounderEvent, ID } from "../events";
import type { ISODateString } from "../models";
import type { FounderAction, FounderActionStatus } from "./actionTypes";

export type ActionHistoryRecord = {
  actionId: ID;
  title: string;
  status: FounderActionStatus;
  actionType?: string;
  projectId?: ID;
  ts: ISODateString;
};

export type ActionHistoryStats = {
  completed: number;
  skipped: number;
  dismissed: number;
  postponed: number;
  opened: number;
  offered: number;
  completedToday: number;
  mostSuccessful: { title: string; count: number }[];
  mostIgnored: { title: string; count: number }[];
};

const ACTION_EVENT_TYPES = new Set([
  "action.offered",
  "action.opened",
  "action.started",
  "action.completed",
  "action.dismissed",
  "action.skipped",
  "action.postponed",
]);

const STATUS_FROM_EVENT: Record<string, FounderActionStatus> = {
  "action.offered": "offered",
  "action.opened": "opened",
  "action.started": "started",
  "action.completed": "completed",
  "action.dismissed": "dismissed",
  "action.skipped": "skipped",
  "action.postponed": "postponed",
};

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

/** Build chronological history from action.* events. */
export function buildActionHistory(events: FounderEvent[]): ActionHistoryRecord[] {
  return events
    .filter((e) => ACTION_EVENT_TYPES.has(e.type))
    .map((e) => ({
      actionId: (e.data?.actionId as ID) ?? e.id,
      title: (e.data?.title as string) ?? "Action",
      status: STATUS_FROM_EVENT[e.type] ?? "offered",
      actionType: e.data?.actionType as string | undefined,
      projectId: e.refs?.projectId,
      ts: e.ts,
    }))
    .sort((a, b) => a.ts.localeCompare(b.ts));
}

/** Latest status per action id. */
export function latestActionStatuses(
  events: FounderEvent[],
): Map<ID, FounderActionStatus> {
  const map = new Map<ID, FounderActionStatus>();
  for (const rec of buildActionHistory(events)) {
    map.set(rec.actionId, rec.status);
  }
  return map;
}

/** Merge generated actions with event-derived statuses. */
export function reconcileActionStatuses(
  actions: FounderAction[],
  events: FounderEvent[],
): FounderAction[] {
  const latest = latestActionStatuses(events);
  return actions.map((a) => {
    const status = latest.get(a.id);
    if (!status) return a;
    const completedAt =
      status === "completed"
        ? [...events]
            .reverse()
            .find(
              (e) =>
                e.type === "action.completed" &&
                e.data?.actionId === a.id,
            )?.ts
        : undefined;
    return { ...a, status, completedAt };
  });
}

export function computeActionHistoryStats(
  events: FounderEvent[],
): ActionHistoryStats {
  const history = buildActionHistory(events);
  const completed = history.filter((h) => h.status === "completed");
  const skipped = history.filter((h) => h.status === "skipped");
  const dismissed = history.filter((h) => h.status === "dismissed");
  const postponed = history.filter((h) => h.status === "postponed");
  const opened = history.filter((h) => h.status === "opened");
  const offered = history.filter((h) => h.status === "offered");

  const completedToday = completed.filter((h) => isToday(h.ts)).length;

  const successCounts = new Map<string, number>();
  const ignoreCounts = new Map<string, number>();

  for (const h of completed) {
    successCounts.set(h.title, (successCounts.get(h.title) ?? 0) + 1);
  }
  for (const h of [...skipped, ...dismissed]) {
    ignoreCounts.set(h.title, (ignoreCounts.get(h.title) ?? 0) + 1);
  }

  const topN = (m: Map<string, number>, n = 3) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([title, count]) => ({ title, count }));

  return {
    completed: completed.length,
    skipped: skipped.length,
    dismissed: dismissed.length,
    postponed: postponed.length,
    opened: opened.length,
    offered: offered.length,
    completedToday,
    mostSuccessful: topN(successCounts),
    mostIgnored: topN(ignoreCounts),
  };
}

export function filterPostponedActions(
  actions: FounderAction[],
  events: FounderEvent[],
): FounderAction[] {
  const latest = latestActionStatuses(events);
  return actions.filter((a) => latest.get(a.id) === "postponed");
}

export function filterStalledActions(actions: FounderAction[]): FounderAction[] {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return actions.filter((a) => {
    if (a.status === "completed" || a.status === "dismissed" || a.status === "skipped") {
      return false;
    }
    return new Date(a.createdAt).getTime() < cutoff;
  });
}
