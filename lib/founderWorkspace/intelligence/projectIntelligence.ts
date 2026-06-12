import type { FounderWorkspaceData, FounderWorkspaceItem } from "../types";

import { computeNextStep } from "./nextStepEngine";
import {
  getAllOpenIssues,
  getOpenIssuesForProject,
  issueSeverityRank,
  topRiskFromIssues,
} from "./projectIssues";
import {
  getOpenOpportunities,
  getOpportunitiesForProject,
  topOpportunityForProject,
} from "./projectOpportunities";
import { getLinksForProject } from "./projectRelationships";
import type {
  ProjectHealth,
  ProjectIntelligence,
  ProjectIntelligenceDashboard,
  ProjectIntelligenceStore,
  ProjectMomentum,
  ProjectSortKey,
} from "./types";

const MS_PER_DAY = 86_400_000;

export const HEALTH_LABELS: Record<ProjectHealth, string> = {
  healthy: "Healthy",
  needs_attention: "Needs Attention",
  at_risk: "At Risk",
  stalled: "Stalled",
};

function daysBetween(iso: string, now = Date.now()): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 999;
  return Math.floor((now - t) / MS_PER_DAY);
}

function healthRank(health: ProjectHealth): number {
  if (health === "at_risk") return 4;
  if (health === "stalled") return 3;
  if (health === "needs_attention") return 2;
  return 1;
}

export function computeMomentum(
  project: FounderWorkspaceItem,
  data: FounderWorkspaceData,
  links: ReturnType<typeof getLinksForProject>,
): ProjectMomentum {
  const notesAdded = links.filter((l) => l.targetKind === "note").length;
  const experiments = links
    .filter((l) => l.targetKind === "experiment")
    .map((l) =>
      data.experiments.find((e) => e.id === l.targetId),
    )
    .filter(Boolean);
  const experimentsCompleted = experiments.filter(
    (e) => e?.status === "done",
  ).length;

  const days = daysBetween(project.updatedAt);
  let score = 0;
  const progressSignals: string[] = [];

  if (project.status === "active") {
    score += 20;
    progressSignals.push("Status is Active");
  }
  if (days <= 3) {
    score += 25;
    progressSignals.push("Updated in the last 3 days");
  } else if (days <= 7) {
    score += 12;
    progressSignals.push("Updated this week");
  }
  if (notesAdded > 0) {
    score += Math.min(20, notesAdded * 8);
    progressSignals.push(`${notesAdded} linked note(s)`);
  }
  if (experimentsCompleted > 0) {
    score += Math.min(30, experimentsCompleted * 15);
    progressSignals.push(`${experimentsCompleted} experiment(s) completed`);
  }
  if (project.description.trim().length > 40) {
    score += 10;
    progressSignals.push("Clear project description");
  }

  return {
    score: Math.min(100, score),
    progressSignals,
    notesAdded,
    experimentsCompleted,
  };
}

export function computeCompletionScore(
  project: FounderWorkspaceItem,
  momentum: ProjectMomentum,
): number {
  if (project.status === "done") return 100;
  let score = 0;
  if (project.status === "active") score += 35;
  if (project.status === "new") score += 12;
  if (project.status === "parked") score += 20;
  if (project.description.trim()) score += 15;
  score += Math.round(momentum.score * 0.35);
  if (momentum.experimentsCompleted > 0) score += 10;
  return Math.min(100, Math.max(0, score));
}

export function computeHealth(
  project: FounderWorkspaceItem,
  openIssues: ReturnType<typeof getOpenIssuesForProject>,
  daysSinceUpdate: number,
): ProjectHealth {
  if (project.status === "done") return "healthy";

  const hasCritical = openIssues.some(
    (i) => i.severity === "critical" || i.severity === "high",
  );

  if (project.status === "parked" && daysSinceUpdate > 10) return "stalled";
  if (daysSinceUpdate > 14) return "stalled";
  if (hasCritical) return "at_risk";
  if (project.status === "parked") return "needs_attention";
  if (daysSinceUpdate > 7) return "needs_attention";
  if (openIssues.length > 0) return "needs_attention";
  if (project.status === "new" && !project.description.trim()) {
    return "needs_attention";
  }
  return "healthy";
}

export function computePriority(
  health: ProjectHealth,
  completionScore: number,
  momentum: ProjectMomentum,
  openIssues: ReturnType<typeof getOpenIssuesForProject>,
  topOpportunity: ReturnType<typeof topOpportunityForProject>,
): number {
  let score = 50;
  score += healthRank(health) * 12;
  score += Math.max(0, 100 - completionScore) * 0.25;
  score += momentum.score * 0.15;
  score += openIssues.reduce((s, i) => s + issueSeverityRank(i.severity) * 4, 0);
  if (topOpportunity?.potentialImpact === "high") score += 10;
  return Math.min(100, Math.round(score));
}

function buildRecentActivity(
  project: FounderWorkspaceItem,
  store: ProjectIntelligenceStore,
  momentum: ProjectMomentum,
): string[] {
  const activity = store.activity[project.id];
  const lines: string[] = [];
  lines.push(`Updated ${new Date(project.updatedAt).toLocaleString()}`);
  if (activity?.lastViewedAt) {
    lines.push(`Viewed ${new Date(activity.lastViewedAt).toLocaleString()}`);
  }
  if (activity?.lastEditedAt) {
    lines.push(`Edited ${new Date(activity.lastEditedAt).toLocaleString()}`);
  }
  for (const signal of momentum.progressSignals.slice(0, 3)) {
    lines.push(signal);
  }
  return lines;
}

export function analyzeProject(
  project: FounderWorkspaceItem,
  data: FounderWorkspaceData,
  store: ProjectIntelligenceStore,
): ProjectIntelligence {
  const links = getLinksForProject(store.links, project.id);
  const openIssues = getOpenIssuesForProject(store.issues, project.id);
  const opportunities = getOpportunitiesForProject(
    store.opportunities,
    project.id,
  );
  const daysSinceUpdate = daysBetween(project.updatedAt);
  const momentum = computeMomentum(project, data, links);
  const health = computeHealth(project, openIssues, daysSinceUpdate);
  const completionScore = computeCompletionScore(project, momentum);
  const topOpportunity = topOpportunityForProject(
    store.opportunities,
    project.id,
  );
  const priority = computePriority(
    health,
    completionScore,
    momentum,
    openIssues,
    topOpportunity,
  );

  const risks: string[] = [];
  if (daysSinceUpdate > 7) {
    risks.push(`No updates in ${daysSinceUpdate} days`);
  }
  if (openIssues.length > 0) {
    risks.push(`${openIssues.length} open issue(s)`);
  }
  if (project.status === "parked") {
    risks.push("Project is parked");
  }

  const blockers = openIssues
    .filter((i) => i.severity === "high" || i.severity === "critical")
    .map((i) => i.problem);

  const nextStep = computeNextStep({
    project,
    openIssues,
    opportunities,
    links,
    notesAdded: momentum.notesAdded,
    experimentsCompleted: momentum.experimentsCompleted,
    daysSinceUpdate,
  });

  return {
    project,
    health,
    healthLabel: HEALTH_LABELS[health],
    completionScore,
    priority,
    momentum,
    activity: {
      lastUpdated: project.updatedAt,
      lastViewed: store.activity[project.id]?.lastViewedAt,
      lastEdited: store.activity[project.id]?.lastEditedAt,
      daysSinceUpdate,
    },
    risks,
    blockers,
    nextStep,
    topOpportunity,
    openIssues,
    opportunities,
    relationships: links,
    recentActivity: buildRecentActivity(project, store, momentum),
  };
}

export function analyzeAllProjects(
  data: FounderWorkspaceData,
  store: ProjectIntelligenceStore,
): ProjectIntelligence[] {
  return data.projects.map((project) => analyzeProject(project, data, store));
}

export function buildIntelligenceDashboard(
  analyses: ProjectIntelligence[],
  store: ProjectIntelligenceStore,
): ProjectIntelligenceDashboard {
  return {
    needingAttention: analyses.filter(
      (a) => a.health === "needs_attention" || a.health === "at_risk",
    ),
    stalled: analyses.filter((a) => a.health === "stalled"),
    highMomentum: analyses.filter((a) => a.momentum.score >= 55),
    opportunities: getOpenOpportunities(store.opportunities),
    openIssues: getAllOpenIssues(store.issues),
  };
}

export function sortProjectAnalyses(
  analyses: ProjectIntelligence[],
  sortKey: ProjectSortKey,
): ProjectIntelligence[] {
  const list = [...analyses];
  switch (sortKey) {
    case "health":
      return list.sort(
        (a, b) => healthRank(b.health) - healthRank(a.health),
      );
    case "momentum":
      return list.sort((a, b) => b.momentum.score - a.momentum.score);
    case "last_activity":
      return list.sort(
        (a, b) =>
          Date.parse(b.activity.lastUpdated) -
          Date.parse(a.activity.lastUpdated),
      );
    case "priority":
    default:
      return list.sort((a, b) => b.priority - a.priority);
  }
}

export function formatIntelligenceForGuidance(
  analyses: ProjectIntelligence[],
  dashboard: ProjectIntelligenceDashboard,
): string {
  const lines = [
    "PROJECT INTELLIGENCE (founder projects only):",
    "",
    `Needing attention: ${dashboard.needingAttention.length}`,
    `Stalled: ${dashboard.stalled.length}`,
    `High momentum: ${dashboard.highMomentum.length}`,
    `Open issues: ${dashboard.openIssues.length}`,
    `Open opportunities: ${dashboard.opportunities.length}`,
    "",
  ];

  for (const a of analyses.slice(0, 12)) {
    lines.push(
      `• ${a.project.title} [${a.project.id}]`,
      `  Health: ${a.healthLabel} | Completion: ${a.completionScore}% | Momentum: ${a.momentum.score}`,
      `  Next step: ${a.nextStep}`,
    );
    if (a.blockers.length) {
      lines.push(`  Blockers: ${a.blockers.join("; ")}`);
    }
    if (a.topOpportunity) {
      lines.push(
        `  Opportunity: ${a.topOpportunity.idea} (${a.topOpportunity.potentialImpact} impact)`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
