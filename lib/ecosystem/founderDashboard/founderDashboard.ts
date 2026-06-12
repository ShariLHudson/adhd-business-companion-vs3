// Founder Ecosystem — Phase 7 core dashboard engine.
// Gathers + computes the whole dashboard from the event stream by composing the
// Phase 6 memory engine, the Phase 4 intelligence engine, and the Phase 2 data
// layer. Derived KPIs come from events; external KPIs (revenue/leads/…) are
// placeholders until a `dashboardSync` connector fills them. Pure.

import type { FounderEvent, ID, ISODateString } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { buildFounderMemory } from "../memory/founderMemoryEngine";
import type { FounderMemory } from "../memory/memoryTypes";
import type {
  DashboardAlert,
  DashboardSummary,
  DecisionCard,
  FounderDashboard,
  GoalProgress,
  Kpi,
  OpportunityCard,
  ProjectProgress,
  RiskCard,
  TimePeriod,
  WinCard,
} from "./dashboardTypes";

const num = (v: unknown) => (typeof v === "number" ? v : undefined);
const DAY = 86_400_000;

export type DashboardWindow = {
  start: number; // ms; -Infinity for "all"
  end: number; // ms (now)
  prevStart: number;
  prevEnd: number;
};

/** Resolve a period into a current + previous comparable window. */
export function windowFor(period: TimePeriod, now: Date): DashboardWindow {
  const end = now.getTime();
  if (period === "all") {
    return { start: -Infinity, end, prevStart: NaN, prevEnd: NaN };
  }
  let span: number;
  if (period === "today") {
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    span = end - startOfDay.getTime();
  } else {
    span = (period === "7d" ? 7 : 30) * DAY;
  }
  const start = end - span;
  return { start, end, prevStart: start - span, prevEnd: start };
}

const inWindow = (ts: ISODateString, w: { start: number; end: number }) => {
  const t = new Date(ts).getTime();
  return t > w.start && t <= w.end;
};

function countEvents(
  events: FounderEvent[],
  type: FounderEvent["type"],
  w: { start: number; end: number },
) {
  return events.filter((e) => e.type === type && inWindow(e.ts, w)).length;
}

function sumEvents(
  events: FounderEvent[],
  type: FounderEvent["type"],
  field: string,
  w: { start: number; end: number },
) {
  return events
    .filter((e) => e.type === type && inWindow(e.ts, w))
    .reduce((acc, e) => acc + (num(e.data?.[field]) ?? 0), 0);
}

function trendOf(value: number, previous: number | null) {
  if (previous === null || Number.isNaN(previous)) {
    return { previous: null, delta: null, trend: "flat" as const };
  }
  const delta = value - previous;
  return {
    previous,
    delta,
    trend: delta > 0 ? ("up" as const) : delta < 0 ? ("down" as const) : ("flat" as const),
  };
}

function derivedKpi(
  key: string,
  label: string,
  unit: Kpi["unit"],
  value: number,
  previous: number | null,
): Kpi {
  return {
    key,
    label,
    value,
    unit,
    origin: "derived",
    ...trendOf(value, previous),
    target: null,
    status: "unknown",
  };
}

/** External KPIs start as placeholders; dashboardSync fills value/previous. */
function externalKpi(key: string, label: string, unit: Kpi["unit"]): Kpi {
  return {
    key,
    label,
    value: null,
    unit,
    origin: "external",
    previous: null,
    delta: null,
    trend: "flat",
    target: null,
    status: "unknown",
  };
}

function computeKpis(events: FounderEvent[], w: DashboardWindow): Kpi[] {
  const cur = { start: w.start, end: w.end };
  const prev = Number.isNaN(w.prevStart) ? null : { start: w.prevStart, end: w.prevEnd };
  const c = (type: FounderEvent["type"]) => countEvents(events, type, cur);
  const p = (type: FounderEvent["type"]) =>
    prev ? countEvents(events, type, prev) : null;

  return [
    // Derived from the event stream.
    derivedKpi("focusSessions", "Focus sessions", "count", c("focus.completed"), p("focus.completed")),
    derivedKpi(
      "focusMinutes",
      "Focus minutes",
      "minutes",
      sumEvents(events, "focus.completed", "actualMinutes", cur),
      prev ? sumEvents(events, "focus.completed", "actualMinutes", prev) : null,
    ),
    derivedKpi("timeBlocks", "Time blocks", "count", c("timeblock.created"), p("timeblock.created")),
    derivedKpi("tasksCompleted", "Tasks completed", "count", c("task.completed"), p("task.completed")),
    derivedKpi("documents", "Documents created", "count", c("document.created"), p("document.created")),
    derivedKpi("opportunities", "New opportunities", "count", c("opportunity.created"), p("opportunity.created")),
    // External — provided by a sync connector (GHL, etc.).
    externalKpi("revenue", "Revenue", "currency"),
    externalKpi("leads", "Leads", "count"),
    externalKpi("conversion", "Conversion rate", "percent"),
    externalKpi("engagement", "Engagement", "count"),
  ];
}

function projectProgress(memory: FounderMemory): ProjectProgress[] {
  return memory.projects.map((p) => {
    const done = p.tasks.filter((t) => t.done).length;
    const total = p.tasks.length;
    return {
      projectId: p.projectId,
      name: p.name,
      status: total > 0 && done === total ? "complete" : "active",
      progress: total > 0 ? done / total : null,
      openTasks: total - done,
      doneTasks: done,
      nextStep: p.nextStep,
      lastActivity: p.lastActivity,
      riskCount: p.risks.length,
      openOpportunities: p.opportunities.length,
    };
  });
}

function goalProgress(memory: FounderMemory, events: FounderEvent[]): GoalProgress[] {
  const labels = new Map<string, number>();
  for (const e of events.filter((e) => e.type === "checkin.recorded")) {
    const ps = Array.isArray(e.data?.priorities) ? (e.data!.priorities as string[]) : [];
    for (const g of ps) labels.set(g, (labels.get(g) ?? 0) + 1);
  }
  return [...labels.entries()].map(([label, mentions]) => ({
    label,
    mentions,
    relatedProjects: memory.projects.filter((p) => p.goals.includes(label)).length,
  }));
}

function buildAlerts(
  events: FounderEvent[],
  intel: FounderIntelligence,
  memory: FounderMemory,
  w: DashboardWindow,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const cur = { start: w.start, end: w.end };

  for (const r of intel.risks) {
    alerts.push({
      id: `alert:risk:${r.id}`,
      kind: "risk",
      severity: r.severity === "high" ? "urgent" : r.severity === "medium" ? "watch" : "info",
      label: r.label,
      ts: r.detectedAt,
      relatedId: r.relatedProjectIds[0],
    });
  }
  for (const d of memory.decisions.filter((d) => d.status === "open")) {
    alerts.push({
      id: `alert:decision:${d.id}`,
      kind: "decision-pending",
      severity: "watch",
      label: `Pending decision: ${d.decision}`,
      ts: null,
      relatedId: d.relatedProjectIds[0],
    });
  }
  for (const e of events.filter((e) => e.type === "opportunity.created" && inWindow(e.ts, cur))) {
    alerts.push({
      id: `alert:opp:${e.id}`,
      kind: "new-opportunity",
      severity: "info",
      label: `New opportunity captured`,
      ts: e.ts,
      relatedId: e.refs?.opportunityId,
    });
  }
  for (const wEv of events.filter(
    (e) =>
      (e.type === "task.completed" || e.type === "project.completed") && inWindow(e.ts, cur),
  )) {
    alerts.push({
      id: `alert:win:${wEv.id}`,
      kind: "win",
      severity: "info",
      label: wEv.type === "project.completed" ? "Project completed" : "Task completed",
      ts: wEv.ts,
      relatedId: wEv.refs?.projectId,
    });
  }
  // Most urgent first.
  const rank = { urgent: 0, watch: 1, info: 2 };
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]).slice(0, 25);
}

const HEALTH_LABEL = (s: number): DashboardSummary["healthLabel"] =>
  s >= 75 ? "thriving" : s >= 50 ? "steady" : s >= 25 ? "stretched" : "stalled";

function summarize(
  events: FounderEvent[],
  intel: FounderIntelligence,
  memory: FounderMemory,
  projects: ProjectProgress[],
  w: DashboardWindow,
): DashboardSummary {
  const cur = { start: w.start, end: w.end };
  const winsThisPeriod =
    countEvents(events, "task.completed", cur) +
    countEvents(events, "project.completed", cur) +
    countEvents(events, "document.exported", cur);
  const focusSessions = countEvents(events, "focus.completed", cur);
  const openTasks = projects.reduce((a, p) => a + p.openTasks, 0);
  const openDecisions = memory.decisions.filter((d) => d.status === "open").length;
  const openOpportunities = memory.opportunities.filter((o) => o.status !== "completed").length;

  // Supportive composite: momentum lifts, unresolved risk/decisions weigh down.
  const momentum = winsThisPeriod * 8 + focusSessions * 6;
  const avgProgress =
    projects.length > 0
      ? projects.reduce((a, p) => a + (p.progress ?? 0), 0) / projects.length
      : 0;
  const drag = intel.risks.length * 10 + openDecisions * 4;
  const raw = 40 + momentum + avgProgress * 30 - drag;
  const healthScore = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    activeProjects: projects.filter((p) => p.status !== "complete").length,
    openTasks,
    openDecisions,
    openOpportunities,
    risks: intel.risks.length,
    winsThisPeriod,
    focusSessions,
    healthScore,
    healthLabel: HEALTH_LABEL(healthScore),
  };
}

export type BuildDashboardOptions = {
  period?: TimePeriod;
  now?: Date;
  intel?: FounderIntelligence;
};

export function buildFounderDashboard(
  events: FounderEvent[],
  founderId: ID,
  opts: BuildDashboardOptions = {},
): FounderDashboard {
  const period = opts.period ?? "30d";
  const now = opts.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = opts.intel ?? getFounderIntelligence(mine, founderId, now.toISOString());
  const memory = buildFounderMemory(mine, founderId, intel);
  const w = windowFor(period, now);

  const projects = projectProgress(memory);

  const decisions: DecisionCard[] = memory.decisions.map((d) => ({
    decisionId: d.id,
    text: d.decision,
    status: d.status,
    projectId: d.relatedProjectIds[0],
    alternatives: d.alternatives,
  }));

  const opportunities: OpportunityCard[] = memory.opportunities.map((o) => ({
    opportunityId: o.id,
    text: o.idea,
    origin: o.origin,
    status: o.status,
    impact: o.potentialImpact,
    projectId: o.relatedProjectId,
  }));

  const risks: RiskCard[] = intel.risks.map((r) => ({
    id: r.id,
    type: r.type,
    label: r.label,
    severity: r.severity,
    suggestedAction: r.suggestedAction,
    projectId: r.relatedProjectIds[0],
  }));

  const cur = { start: w.start, end: w.end };
  const wins: WinCard[] = memory.graph.nodes
    .filter((n) => n.type === "win" && (!n.lastActivity || inWindow(n.lastActivity, cur)))
    .map((n) => ({ id: n.id, label: n.label, ts: n.lastActivity ?? null }));

  return {
    founderId,
    generatedAt: now.toISOString(),
    period,
    summary: summarize(mine, intel, memory, projects, w),
    kpis: computeKpis(mine, w),
    projects,
    goals: goalProgress(memory, mine),
    decisions,
    opportunities,
    risks,
    wins,
    alerts: buildAlerts(mine, intel, memory, w),
    graph: memory.graph,
  };
}

// Re-export the window helper for filters/visuals that need raw bounds.
export { inWindow };
