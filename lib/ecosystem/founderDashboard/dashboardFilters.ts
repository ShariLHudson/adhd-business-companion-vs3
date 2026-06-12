// Founder Ecosystem — Phase 7 dashboard filters & sorting.
// Narrow a built dashboard by project / goal / decision / period, and sort the
// common lists. Returns a new FounderDashboard (immutable). Pure.

import type { FounderDashboard } from "./dashboardTypes";

export type DashboardFilter = {
  projectId?: string;
  goal?: string;
  decisionId?: string;
};

/** Keep only the slices related to a single project. */
export function filterByProject(
  d: FounderDashboard,
  projectId: string,
): FounderDashboard {
  const keepNode = (id?: string) => id === projectId;
  return {
    ...d,
    projects: d.projects.filter((p) => p.projectId === projectId),
    decisions: d.decisions.filter((x) => keepNode(x.projectId)),
    opportunities: d.opportunities.filter((x) => keepNode(x.projectId)),
    risks: d.risks.filter((x) => keepNode(x.projectId)),
    wins: d.wins.filter((x) => keepNode(x.projectId)),
    alerts: d.alerts.filter((a) => !a.relatedId || a.relatedId === projectId),
  };
}

export function filterByGoal(d: FounderDashboard, goal: string): FounderDashboard {
  const goalProjects = new Set(
    d.goals.some((g) => g.label === goal)
      ? d.projects.map((p) => p.projectId) // goals aren't hard-linked; keep projects
      : [],
  );
  return {
    ...d,
    goals: d.goals.filter((g) => g.label === goal),
    projects: d.projects.filter((p) => goalProjects.has(p.projectId)),
  };
}

export function filterByDecision(
  d: FounderDashboard,
  decisionId: string,
): FounderDashboard {
  const dec = d.decisions.find((x) => x.decisionId === decisionId);
  const projectId = dec?.projectId;
  return {
    ...d,
    decisions: d.decisions.filter((x) => x.decisionId === decisionId),
    projects: projectId
      ? d.projects.filter((p) => p.projectId === projectId)
      : d.projects,
  };
}

export function applyFilter(
  d: FounderDashboard,
  f: DashboardFilter,
): FounderDashboard {
  let out = d;
  if (f.projectId) out = filterByProject(out, f.projectId);
  if (f.goal) out = filterByGoal(out, f.goal);
  if (f.decisionId) out = filterByDecision(out, f.decisionId);
  return out;
}

// ---- Sorting ------------------------------------------------------------
export type ProjectSort = "progress" | "activity" | "attention" | "name";

export function sortProjects(
  d: FounderDashboard,
  by: ProjectSort,
): FounderDashboard {
  const projects = d.projects.slice().sort((a, b) => {
    switch (by) {
      case "progress":
        return (b.progress ?? -1) - (a.progress ?? -1);
      case "activity":
        return (b.lastActivity ?? "") < (a.lastActivity ?? "") ? -1 : 1;
      case "attention":
        return b.riskCount - a.riskCount || b.openTasks - a.openTasks;
      case "name":
        return a.name.localeCompare(b.name);
    }
  });
  return { ...d, projects };
}
