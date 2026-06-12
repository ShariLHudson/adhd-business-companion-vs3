// Founder Ecosystem — Phase 7 dashboard selectors.
// Summary metrics, drill-downs, and "what should I do next" queries over a built
// FounderDashboard. Drill-down reuses the Phase 6 graph queries. Pure.

import type { ID } from "../events";
import type { GraphNode, RelationshipGraph } from "../memory/memoryTypes";
import { everythingRelatedTo, getNode, subgraph } from "../memory/memoryQueries";
import type {
  DashboardSummary,
  DecisionCard,
  FounderDashboard,
  OpportunityCard,
  ProjectProgress,
  RiskCard,
} from "./dashboardTypes";

export function summaryMetrics(d: FounderDashboard): DashboardSummary {
  return d.summary;
}

/** At-a-glance business health line for the header. */
export function healthHeadline(d: FounderDashboard): string {
  const s = d.summary;
  return `Health ${s.healthScore}/100 (${s.healthLabel}) · ${s.activeProjects} active projects · ${s.winsThisPeriod} wins · ${s.risks} risks`;
}

export type DrillDown = {
  node: GraphNode | null;
  related: GraphNode[];
  graph: RelationshipGraph;
  project?: ProjectProgress;
  decision?: DecisionCard;
  opportunity?: OpportunityCard;
  risk?: RiskCard;
};

/** Click an item → everything one/two hops away + the matching card. */
export function drillDown(d: FounderDashboard, nodeId: ID, depth = 1): DrillDown {
  return {
    node: getNode(d.graph, nodeId) ?? null,
    related: everythingRelatedTo(d.graph, nodeId, depth),
    graph: subgraph(d.graph, nodeId, depth),
    project: d.projects.find((p) => p.projectId === nodeId),
    decision: d.decisions.find((x) => x.decisionId === nodeId),
    opportunity: d.opportunities.find((x) => x.opportunityId === nodeId),
    risk: d.risks.find((x) => x.id === nodeId),
  };
}

export type NextStep = { source: "risk" | "decision" | "project"; label: string; relatedId?: ID };

/** Ranked, actionable next steps: urgent risks → open decisions → project next steps. */
export function nextActionableSteps(d: FounderDashboard, limit = 5): NextStep[] {
  const steps: NextStep[] = [];
  for (const r of d.risks.filter((x) => x.severity === "high"))
    steps.push({ source: "risk", label: r.suggestedAction, relatedId: r.projectId });
  for (const dec of d.decisions.filter((x) => x.status === "open"))
    steps.push({ source: "decision", label: `Decide: ${dec.text}`, relatedId: dec.projectId });
  for (const p of d.projects.filter((x) => x.nextStep))
    steps.push({ source: "project", label: p.nextStep!, relatedId: p.projectId });
  return steps.slice(0, limit);
}

/** Projects that need attention first (risks, then most open work). */
export function projectsNeedingAttention(d: FounderDashboard): ProjectProgress[] {
  return d.projects
    .filter((p) => p.riskCount > 0 || (p.progress !== null && p.progress < 0.5))
    .sort((a, b) => b.riskCount - a.riskCount || b.openTasks - a.openTasks);
}

export function unsyncedKpis(d: FounderDashboard): string[] {
  return d.kpis.filter((k) => k.origin === "external" && k.value === null).map((k) => k.label);
}
