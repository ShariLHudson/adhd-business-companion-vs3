// Founder Ecosystem — Phase 7 visualization data.
// Shapes the dashboard into chart/timeline/graph-ready structures. NO rendering
// library here — these are plain series the UI hands to Chart.js / a Gantt / a
// node-graph component. Pure.

import type { FounderEvent } from "../events";
import type { RelationshipGraph } from "../memory/memoryTypes";
import { subgraph } from "../memory/memoryQueries";
import type { FounderDashboard } from "./dashboardTypes";

// ---- Project completion (bar chart) ------------------------------------
export type BarDatum = { label: string; value: number };
export function projectCompletionChart(d: FounderDashboard): BarDatum[] {
  return d.projects.map((p) => ({
    label: p.name,
    value: p.progress === null ? 0 : Math.round(p.progress * 100),
  }));
}

// ---- KPI snapshot (bar chart of derived KPIs) --------------------------
export function kpiSnapshotChart(d: FounderDashboard): BarDatum[] {
  return d.kpis
    .filter((k) => k.origin === "derived" && k.value !== null)
    .map((k) => ({ label: k.label, value: k.value as number }));
}

// ---- KPI time series (line chart) --------------------------------------
export type SeriesPoint = { date: string; value: number };
export type Series = { key: string; label: string; points: SeriesPoint[] };

const dayKey = (ts: string) => ts.slice(0, 10);

/** Daily counts of an event type over the last `days` — a sparkline source. */
export function kpiTimeSeries(
  events: FounderEvent[],
  founderId: string,
  type: FounderEvent["type"],
  label: string,
  now = new Date(),
  days = 30,
): Series {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    buckets.set(dayKey(d.toISOString()), 0);
  }
  for (const e of events) {
    if (e.founderId !== founderId || e.type !== type) continue;
    const k = dayKey(e.ts);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return {
    key: type,
    label,
    points: [...buckets.entries()].map(([date, value]) => ({ date, value })),
  };
}

// ---- Opportunity funnel ------------------------------------------------
export type FunnelDatum = { stage: string; count: number };
export function opportunityFunnelChart(d: FounderDashboard): FunnelDatum[] {
  const order = ["idea", "exploring", "active", "parked", "completed"];
  const counts = new Map<string, number>(order.map((s) => [s, 0]));
  for (const o of d.opportunities) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  return order.map((stage) => ({ stage, count: counts.get(stage) ?? 0 }));
}

// ---- Timeline / Gantt --------------------------------------------------
export type GanttRow = {
  id: string;
  label: string;
  kind: "task" | "timeblock" | "focus" | "milestone" | "document";
  start: string;
  end: string | null;
  projectId?: string;
  done: boolean;
};

/** Build Gantt/timeline rows from the raw event stream. */
export function timelineRows(events: FounderEvent[], founderId: string): GanttRow[] {
  const mine = events.filter((e) => e.founderId === founderId);
  const completed = new Set(
    mine.filter((e) => e.type === "task.completed").map((e) => e.refs?.taskId),
  );
  const rows: GanttRow[] = [];
  for (const e of mine) {
    const p = e.refs?.projectId;
    switch (e.type) {
      case "task.created":
        if (e.refs?.taskId)
          rows.push({
            id: e.refs.taskId,
            label: String(e.data?.title ?? "Task"),
            kind: "task",
            start: e.ts,
            end: null,
            projectId: p,
            done: completed.has(e.refs.taskId),
          });
        break;
      case "timeblock.created":
        if (e.refs?.timeBlockId) {
          const dur = typeof e.data?.durationMin === "number" ? e.data.durationMin : 60;
          rows.push({
            id: e.refs.timeBlockId,
            label: String(e.data?.title ?? "Time block"),
            kind: "timeblock",
            start: e.ts,
            end: new Date(new Date(e.ts).getTime() + dur * 60_000).toISOString(),
            projectId: p,
            done: false,
          });
        }
        break;
      case "focus.completed":
        rows.push({
          id: `focus:${e.id}`,
          label: "Focus session",
          kind: "focus",
          start: e.ts,
          end: e.ts,
          projectId: p,
          done: true,
        });
        break;
      case "document.created":
        if (e.refs?.documentId)
          rows.push({
            id: e.refs.documentId,
            label: String(e.data?.title ?? "Document"),
            kind: "document",
            start: e.ts,
            end: null,
            projectId: p,
            done: false,
          });
        break;
      case "project.completed":
        if (p)
          rows.push({
            id: `milestone:${e.id}`,
            label: "Project completed",
            kind: "milestone",
            start: e.ts,
            end: e.ts,
            projectId: p,
            done: true,
          });
        break;
      default:
        break;
    }
  }
  return rows.sort((a, b) => (a.start < b.start ? -1 : 1));
}

// ---- Node/relationship preview -----------------------------------------
export type GraphPreview = {
  nodes: { id: string; type: string; label: string }[];
  edges: { from: string; to: string; type: string }[];
};

function toPreview(g: RelationshipGraph): GraphPreview {
  return {
    nodes: g.nodes.map((n) => ({ id: n.id, type: n.type, label: n.label })),
    edges: g.edges.map((e) => ({ from: e.from, to: e.to, type: e.type })),
  };
}

/** Whole-graph preview, or a subgraph centred on one node when given. */
export function relationshipPreview(
  d: FounderDashboard,
  centerId?: string,
  depth = 1,
): GraphPreview {
  return toPreview(centerId ? subgraph(d.graph, centerId, depth) : d.graph);
}
