// Founder Ecosystem — Phase 7 Data Dashboard & KPI types.
//
// The visual layer over the Phase 6 memory graph + Phase 4 intelligence. All
// shapes are plain, serializable view-models derived from the event stream;
// missing data is null / empty, never fabricated. No medical/financial claims.

import type { ID, ISODateString } from "../models";
import type { RelationshipGraph } from "../memory/memoryTypes";

export type TimePeriod = "today" | "7d" | "30d" | "all";

// ---- KPIs ---------------------------------------------------------------
export type KpiUnit = "currency" | "count" | "percent" | "minutes";
export type KpiTrend = "up" | "down" | "flat";
export type KpiStatus = "good" | "watch" | "behind" | "unknown";

export type Kpi = {
  key: string;
  label: string;
  /** null when external + not yet synced. */
  value: number | null;
  unit: KpiUnit;
  /** "derived" = computed from events; "external" = needs a sync connector. */
  origin: "derived" | "external";
  /** Previous comparable period (same length), for trend. */
  previous: number | null;
  delta: number | null; // value - previous
  trend: KpiTrend;
  target: number | null;
  status: KpiStatus;
};

// ---- Project progress ---------------------------------------------------
export type ProjectProgress = {
  projectId: ID;
  name: string;
  status: string;
  /** 0–1, or null when there are no tasks yet. */
  progress: number | null;
  openTasks: number;
  doneTasks: number;
  nextStep: string | null;
  lastActivity: ISODateString | null;
  riskCount: number;
  openOpportunities: number;
};

export type GoalProgress = {
  label: string;
  relatedProjects: number;
  mentions: number;
};

// ---- Alerts / notifications --------------------------------------------
export type AlertKind =
  | "overdue-task"
  | "new-opportunity"
  | "decision-pending"
  | "risk"
  | "kpi-threshold"
  | "win";
export type AlertSeverity = "info" | "watch" | "urgent";

export type DashboardAlert = {
  id: ID;
  kind: AlertKind;
  severity: AlertSeverity;
  label: string;
  ts: ISODateString | null;
  relatedId?: ID;
};

// ---- Compact summary cards ---------------------------------------------
export type DashboardSummary = {
  activeProjects: number;
  openTasks: number;
  openDecisions: number;
  openOpportunities: number;
  risks: number;
  winsThisPeriod: number;
  focusSessions: number;
  /** 0–100 composite of momentum vs risk; supportive, not a diagnosis. */
  healthScore: number;
  healthLabel: "thriving" | "steady" | "stretched" | "stalled";
};

export type DecisionCard = {
  decisionId: ID;
  text: string;
  status: string;
  projectId?: ID;
  alternatives: string[];
};

export type OpportunityCard = {
  opportunityId: ID;
  text: string;
  origin: string;
  status: string;
  impact: "low" | "medium" | "high";
  projectId?: ID;
};

export type WinCard = { id: ID; label: string; ts: ISODateString | null; projectId?: ID };

export type RiskCard = {
  id: ID;
  type: string;
  label: string;
  severity: "low" | "medium" | "high";
  suggestedAction: string;
  projectId?: ID;
};

// ---- The whole dashboard ------------------------------------------------
export type FounderDashboard = {
  founderId: ID;
  generatedAt: ISODateString;
  period: TimePeriod;
  summary: DashboardSummary;
  kpis: Kpi[];
  projects: ProjectProgress[];
  goals: GoalProgress[];
  decisions: DecisionCard[];
  opportunities: OpportunityCard[];
  risks: RiskCard[];
  wins: WinCard[];
  alerts: DashboardAlert[];
  /** For the node/relationship preview widget. */
  graph: RelationshipGraph;
};
