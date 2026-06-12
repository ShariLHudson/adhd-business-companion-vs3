// Founder Ecosystem — Phase 7 widget view-models.
// Pure functions that shape a FounderDashboard into the discrete widgets the UI
// renders (KPI cards, project list, wins, decisions, opportunity funnel, alert
// strip). No rendering here — just the data each widget needs.

import type {
  DashboardAlert,
  FounderDashboard,
  Kpi,
  OpportunityCard,
  ProjectProgress,
  WinCard,
} from "./dashboardTypes";

export type KpiCard = {
  key: string;
  label: string;
  display: string; // formatted value, e.g. "$0", "90 min", "3"
  origin: Kpi["origin"];
  trend: Kpi["trend"];
  deltaDisplay: string | null;
  needsSync: boolean;
};

const fmt = (k: Kpi): string => {
  if (k.value === null) return "—";
  switch (k.unit) {
    case "currency":
      return `$${k.value.toLocaleString()}`;
    case "percent":
      return `${k.value}%`;
    case "minutes":
      return `${k.value} min`;
    default:
      return `${k.value}`;
  }
};

export function kpiCards(d: FounderDashboard): KpiCard[] {
  return d.kpis.map((k) => ({
    key: k.key,
    label: k.label,
    display: fmt(k),
    origin: k.origin,
    trend: k.trend,
    deltaDisplay:
      k.delta === null || k.delta === 0
        ? null
        : `${k.delta > 0 ? "+" : ""}${k.delta}`,
    needsSync: k.origin === "external" && k.value === null,
  }));
}

export type ProjectListRow = {
  projectId: string;
  name: string;
  percent: number | null; // 0–100
  label: string; // "3 / 5 tasks" or "No tasks yet"
  nextStep: string | null;
  attention: boolean; // has risks or is stalled
};

export function projectList(d: FounderDashboard): ProjectListRow[] {
  return d.projects.map((p: ProjectProgress) => ({
    projectId: p.projectId,
    name: p.name,
    percent: p.progress === null ? null : Math.round(p.progress * 100),
    label:
      p.doneTasks + p.openTasks === 0
        ? "No tasks yet"
        : `${p.doneTasks} / ${p.doneTasks + p.openTasks} tasks`,
    nextStep: p.nextStep,
    attention: p.riskCount > 0,
  }));
}

export type AlertStripItem = DashboardAlert & { icon: string };
const ALERT_ICON: Record<DashboardAlert["kind"], string> = {
  "overdue-task": "⏰",
  "new-opportunity": "✨",
  "decision-pending": "⚖️",
  risk: "⚠️",
  "kpi-threshold": "📊",
  win: "🎉",
};

export function alertStrip(d: FounderDashboard): AlertStripItem[] {
  return d.alerts.map((a) => ({ ...a, icon: ALERT_ICON[a.kind] }));
}

export function winsWidget(d: FounderDashboard): WinCard[] {
  return d.wins
    .slice()
    .sort((a, b) => ((a.ts ?? "") < (b.ts ?? "") ? 1 : -1));
}

export type FunnelStage = { stage: string; count: number };

/** Opportunity funnel: counts by status, idea → completed. */
export function opportunityFunnel(d: FounderDashboard): FunnelStage[] {
  const order = ["idea", "exploring", "active", "parked", "completed"];
  const counts = new Map<string, number>(order.map((s) => [s, 0]));
  for (const o of d.opportunities as OpportunityCard[])
    counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  return order.map((stage) => ({ stage, count: counts.get(stage) ?? 0 }));
}

export type DecisionRow = { decisionId: string; text: string; status: string; choices: string[] };
export function decisionList(d: FounderDashboard): DecisionRow[] {
  return d.decisions.map((dc) => ({
    decisionId: dc.decisionId,
    text: dc.text,
    status: dc.status,
    choices: dc.alternatives,
  }));
}
