// Founder Ecosystem — Phase 15 Analytics Module.
// Derives success rates, time saved, tool frequency, and engagement patterns.

import type { FounderEvent } from "../events";
import type { ID } from "../models";
import { parseAutomationRecords } from "./founderEcosystemTracker";
import type {
  AutomationSuccessMetric,
  EngagementHeatCell,
  PendingVsExecuted,
  ToolUsageMetric,
  WorkflowEfficiency,
} from "./learningTypes";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pct(num: number, den: number): number {
  if (den <= 0) return 0;
  return Math.round((num / den) * 100);
}

function automationKey(tool: string, actionType: string): string {
  return `${tool}::${actionType}`;
}

function forFounder(events: FounderEvent[], founderId: ID): FounderEvent[] {
  return events.filter((e) => e.founderId === founderId);
}

export function automationSuccessMetrics(
  events: FounderEvent[],
  founderId: ID,
): AutomationSuccessMetric[] {
  const rows = parseAutomationRecords(forFounder(events, founderId));
  const byKey = new Map<string, AutomationSuccessMetric>();

  for (const r of rows) {
    const key = automationKey(r.tool, r.actionType);
    let m = byKey.get(key);
    if (!m) {
      m = {
        key,
        title: r.title,
        tool: r.tool,
        suggested: 0,
        approved: 0,
        executed: 0,
        rejected: 0,
        dismissed: 0,
        approvalRate: 0,
        executionRate: 0,
        avgTimeSavedMinutes: 0,
      };
      byKey.set(key, m);
    }
    if (r.lifecycle === "suggested") m.suggested += 1;
    if (r.lifecycle === "approved" || r.lifecycle === "edited") m.approved += 1;
    if (r.lifecycle === "executed") m.executed += 1;
    if (r.lifecycle === "rejected") m.rejected += 1;
    if (r.lifecycle === "dismissed") m.dismissed += 1;
  }

  const timeSaved = new Map<string, number[]>();
  for (const r of rows) {
    if (r.lifecycle !== "executed" || r.timeSavedMinutes == null) continue;
    const key = automationKey(r.tool, r.actionType);
    const arr = timeSaved.get(key) ?? [];
    arr.push(r.timeSavedMinutes);
    timeSaved.set(key, arr);
  }

  const out: AutomationSuccessMetric[] = [];
  for (const m of byKey.values()) {
    const responded = m.approved + m.rejected + m.dismissed;
    m.approvalRate = pct(m.approved, responded || m.suggested);
    m.executionRate = pct(m.executed, m.approved || m.suggested);
    const times = timeSaved.get(m.key) ?? [];
    m.avgTimeSavedMinutes =
      times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    out.push(m);
  }

  return out.sort((a, b) => b.executionRate - a.executionRate || b.approved - a.approved);
}

export function pendingVsExecutedCounts(
  events: FounderEvent[],
  founderId: ID,
): PendingVsExecuted {
  const rows = parseAutomationRecords(forFounder(events, founderId));
  let pending = 0;
  let executed = 0;
  let dismissed = 0;
  let rejected = 0;

  const latest = new Map<string, string>();
  for (const r of rows) {
    latest.set(r.automationId, r.lifecycle);
  }
  for (const life of latest.values()) {
    if (life === "executed") executed += 1;
    else if (life === "dismissed") dismissed += 1;
    else if (life === "rejected") rejected += 1;
    else pending += 1;
  }

  // Also count open action cards from Phase 11.
  const actionEvents = forFounder(events, founderId).filter((e) => e.type.startsWith("action."));
  const openActions = new Set<string>();
  for (const e of actionEvents) {
    const id = (e.data as { actionId?: string }).actionId;
    if (!id) continue;
    if (e.type === "action.completed" || e.type === "action.dismissed") {
      openActions.delete(id);
    } else if (
      e.type === "action.offered" ||
      e.type === "action.opened" ||
      e.type === "action.started"
    ) {
      openActions.add(id);
    }
  }
  pending += openActions.size;

  return { pending, executed, dismissed, rejected };
}

export function toolUsageFrequency(
  events: FounderEvent[],
  founderId: ID,
): ToolUsageMetric[] {
  const scoped = forFounder(events, founderId);
  const byTool = new Map<string, ToolUsageMetric>();

  const bump = (tool: string, ok: boolean, minutes?: number) => {
    let m = byTool.get(tool);
    if (!m) {
      m = {
        tool,
        triggerCount: 0,
        successCount: 0,
        totalTimeSavedMinutes: 0,
        avgTimeSavedMinutes: 0,
      };
      byTool.set(tool, m);
    }
    m.triggerCount += 1;
    if (ok) m.successCount += 1;
    if (minutes != null && minutes > 0) m.totalTimeSavedMinutes += minutes;
  };

  for (const e of scoped) {
    if (e.type === "assisted_action.accepted") {
      const d = e.data as { tool?: string; action?: string; ok?: boolean };
      const tool = d.tool ?? d.action?.split(":")[0];
      if (tool) bump(tool, d.ok ?? true);
    }
    if (e.type === "automation.executed") {
      const d = e.data as { tool?: string; ok?: boolean; timeSavedMinutes?: number };
      if (d.tool) bump(d.tool, d.ok ?? true, d.timeSavedMinutes);
    }
    if (e.type === "learning.time_saved") {
      const d = e.data as { minutes?: number; source?: string };
      if (d.source) bump(d.source, true, d.minutes);
    }
  }

  for (const m of byTool.values()) {
    m.avgTimeSavedMinutes =
      m.triggerCount > 0 ? Math.round(m.totalTimeSavedMinutes / m.triggerCount) : 0;
  }

  return [...byTool.values()].sort((a, b) => b.triggerCount - a.triggerCount);
}

export function totalTimeSavedMinutes(events: FounderEvent[], founderId: ID): number {
  let total = 0;
  for (const e of forFounder(events, founderId)) {
    if (e.type === "learning.time_saved") {
      total += (e.data as { minutes?: number }).minutes ?? 0;
    }
    if (e.type === "automation.executed") {
      total += (e.data as { timeSavedMinutes?: number }).timeSavedMinutes ?? 0;
    }
  }
  return total;
}

export function engagementHeatmap(
  events: FounderEvent[],
  founderId: ID,
): EngagementHeatCell[] {
  const grid = new Map<string, number>();
  const scoped = forFounder(events, founderId).filter(
    (e) =>
      e.type.startsWith("automation.") ||
      e.type.startsWith("action.") ||
      e.type === "assisted_action.accepted",
  );

  for (const e of scoped) {
    const d = new Date(e.ts);
    const day = DAY_LABELS[d.getUTCDay()] ?? "Sun";
    const hour = d.getUTCHours();
    const key = `${day}-${hour}`;
    grid.set(key, (grid.get(key) ?? 0) + 1);
  }

  const cells: EngagementHeatCell[] = [];
  for (const day of DAY_LABELS) {
    for (let hour = 0; hour < 24; hour += 1) {
      const key = `${day}-${hour}`;
      cells.push({ day, hour, count: grid.get(key) ?? 0 });
    }
  }
  return cells;
}

export function workflowEfficiencyPatterns(
  events: FounderEvent[],
  founderId: ID,
): WorkflowEfficiency[] {
  const scoped = forFounder(events, founderId);
  const sequences: WorkflowEfficiency[] = [];
  const window: string[] = [];
  const WINDOW = 3;

  const pushStep = (label: string) => {
    window.push(label);
    if (window.length > WINDOW) window.shift();
    if (window.length === WINDOW) {
      const seq = [...window];
      const existing = sequences.find((s) => s.sequence.join("→") === seq.join("→"));
      if (existing) {
        existing.count += 1;
      } else {
        sequences.push({ sequence: seq, count: 1, avgTimeSavedMinutes: 0 });
      }
    }
  };

  for (const e of scoped) {
    if (e.type === "automation.executed") {
      const d = e.data as { title?: string; timeSavedMinutes?: number };
      pushStep(d.title ?? "automation");
      const seqKey = window.join("→");
      const match = sequences.find((s) => s.sequence.join("→") === seqKey);
      if (match && d.timeSavedMinutes) {
        match.avgTimeSavedMinutes = Math.round(
          (match.avgTimeSavedMinutes * (match.count - 1) + d.timeSavedMinutes) / match.count,
        );
      }
    }
    if (e.type === "action.completed") {
      const d = e.data as { title?: string };
      pushStep(d.title ?? "action");
    }
  }

  return sequences.sort((a, b) => b.count - a.count).slice(0, 8);
}

export function overallAutomationSuccessRate(
  events: FounderEvent[],
  founderId: ID,
): number {
  const metrics = automationSuccessMetrics(events, founderId);
  if (metrics.length === 0) return 0;
  const sum = metrics.reduce((a, m) => a + m.executionRate, 0);
  return Math.round(sum / metrics.length);
}

/** Which suggestions led to continued engagement within 24h. */
export function feedbackLoopEngagement(
  events: FounderEvent[],
  founderId: ID,
): { suggestion: string; continued: number; total: number; rate: number }[] {
  const scoped = forFounder(events, founderId);
  const suggestions = scoped.filter((e) => e.type === "automation.suggested");
  const followUps = scoped.filter(
    (e) =>
      e.type === "automation.executed" ||
      e.type === "action.completed" ||
      e.type === "assisted_action.accepted",
  );

  const byTitle = new Map<string, { continued: number; total: number }>();
  for (const s of suggestions) {
    const title = (s.data as { title?: string }).title ?? "unknown";
    const bucket = byTitle.get(title) ?? { continued: 0, total: 0 };
    bucket.total += 1;
    const t0 = new Date(s.ts).getTime();
    const engaged = followUps.some((f) => {
      const t1 = new Date(f.ts).getTime();
      return t1 > t0 && t1 - t0 <= 24 * 60 * 60 * 1000;
    });
    if (engaged) bucket.continued += 1;
    byTitle.set(title, bucket);
  }

  return [...byTitle.entries()]
    .map(([suggestion, { continued, total }]) => ({
      suggestion,
      continued,
      total,
      rate: pct(continued, total),
    }))
    .sort((a, b) => b.rate - a.rate);
}
