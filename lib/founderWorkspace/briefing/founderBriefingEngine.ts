import type { FounderWorkspaceData } from "../types";
import type {
  ProjectIntelligence,
  ProjectIntelligenceDashboard,
  ProjectOpportunity,
} from "../intelligence/types";
import {
  getCriticalIssues,
  getRetestQueue,
} from "../tracking/store";
import type {
  FounderIssueSeverity,
  FounderTrackedExperiment,
  FounderTrackedIssue,
  FounderTrackingData,
} from "../tracking/types";

export type BriefingFocus = {
  title: string;
  reason: string;
};

export type BriefingProjectAttention = {
  projectId: string;
  title: string;
  reason: string;
};

export type BriefingOpenIssue = {
  id: string;
  title: string;
  severity: FounderIssueSeverity;
};

export type BriefingExperiment = {
  id: string;
  title: string;
};

export type BriefingOpportunity = {
  idea: string;
  projectTitle?: string;
};

export type BriefingSuggestedAction = {
  label: string;
  detail: string;
  navigateTo?: "issue" | "dev_experiment" | "retest" | "project";
  issueId?: string;
  projectId?: string;
};

export type FounderDailyBriefing = {
  generatedAt: string;
  greeting: string;
  todaysFocus: BriefingFocus;
  projectsNeedingAttention: BriefingProjectAttention[];
  openIssues: BriefingOpenIssue[];
  activeExperiments: BriefingExperiment[];
  opportunities: BriefingOpportunity[];
  suggestedAction: BriefingSuggestedAction;
  canWait: string[];
  stats: {
    criticalIssueCount: number;
    openIssueCount: number;
    projectsNeedingAttentionCount: number;
    retestCount: number;
    activeExperimentCount: number;
  };
};

export type FounderBriefingInput = {
  workspace: FounderWorkspaceData;
  analyses: ProjectIntelligence[];
  dashboard: ProjectIntelligenceDashboard;
  tracking: FounderTrackingData;
  founderName?: string;
  now?: Date;
};

const SEVERITY_RANK: Record<FounderIssueSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const IMPACT_RANK = { high: 3, medium: 2, low: 1 };

function greetingForHour(hour: number, name: string): string {
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function sortIssuesBySeverity(
  issues: FounderTrackedIssue[],
): FounderTrackedIssue[] {
  return [...issues].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  );
}

function openTrackedIssues(data: FounderTrackingData): FounderTrackedIssue[] {
  return data.issues.filter(
    (i) => i.status !== "fixed" && i.status !== "parked",
  );
}

function pickProjectsNeedingAttention(
  analyses: ProjectIntelligence[],
): BriefingProjectAttention[] {
  const seen = new Set<string>();
  const candidates: BriefingProjectAttention[] = [];

  for (const a of analyses) {
    if (a.project.status === "done" || seen.has(a.project.id)) continue;

    let reason: string | null = null;
    if (a.health === "stalled") {
      reason = `Stalled — no meaningful progress (${a.activity.daysSinceUpdate}d since update)`;
    } else if (a.health === "at_risk") {
      reason = "At risk — blockers or long inactivity";
    } else if (a.health === "needs_attention") {
      reason = "Needs attention — momentum or clarity slipping";
    } else if (a.activity.daysSinceUpdate > 14 && a.project.status === "active") {
      reason = `Inactive for ${a.activity.daysSinceUpdate} days`;
    } else if (a.priority >= 70) {
      reason = "High priority — keep moving";
    }

    if (!reason) continue;
    seen.add(a.project.id);
    candidates.push({
      projectId: a.project.id,
      title: a.project.title,
      reason,
    });
  }

  return candidates
    .sort((a, b) => {
      const rankA =
        analyses.find((x) => x.project.id === a.projectId)?.priority ?? 0;
      const rankB =
        analyses.find((x) => x.project.id === b.projectId)?.priority ?? 0;
      return rankB - rankA;
    })
    .slice(0, 3);
}

function pickOpportunities(
  opportunities: ProjectOpportunity[],
  analyses: ProjectIntelligence[],
): BriefingOpportunity[] {
  const projectTitle = (id: string) =>
    analyses.find((a) => a.project.id === id)?.project.title;

  return [...opportunities]
    .filter((o) => o.status === "open" || o.status === "pursuing")
    .sort(
      (a, b) =>
        IMPACT_RANK[b.potentialImpact] - IMPACT_RANK[a.potentialImpact],
    )
    .slice(0, 3)
    .map((o) => ({
      idea: o.idea,
      projectTitle: projectTitle(o.projectId),
    }));
}

function pickActiveExperiments(
  experiments: FounderTrackedExperiment[],
): BriefingExperiment[] {
  return experiments
    .filter((e) => e.status === "testing")
    .slice(0, 3)
    .map((e) => ({ id: e.id, title: e.title }));
}

function pickTodaysFocus(input: {
  critical: FounderTrackedIssue[];
  retest: FounderTrackedIssue[];
  analyses: ProjectIntelligence[];
  testing: BriefingExperiment[];
  opportunities: BriefingOpportunity[];
}): BriefingFocus {
  const topIssue = input.critical[0] ?? input.retest[0];
  if (topIssue) {
    const isRetest = topIssue.status === "retest";
    return {
      title: topIssue.title,
      reason: isRetest
        ? "Waiting in your retest queue — verify the fix holds."
        : topIssue.severity === "critical"
          ? "Critical issue — affects core product experience."
          : "High-severity issue — users may be hitting this now.",
    };
  }

  const stuck = input.analyses
    .filter(
      (a) =>
        a.project.status !== "done" &&
        (a.health === "at_risk" || a.health === "stalled"),
    )
    .sort((a, b) => b.priority - a.priority)[0];
  if (stuck) {
    return {
      title: stuck.project.title,
      reason:
        stuck.health === "stalled"
          ? "This project has stalled — a small push could unblock everything else."
          : "At-risk project — clearing this reduces founder drag.",
    };
  }

  if (input.testing[0]) {
    return {
      title: input.testing[0].title,
      reason: "An experiment is in testing — finish the loop while context is fresh.",
    };
  }

  if (input.opportunities[0]) {
    return {
      title: input.opportunities[0].idea,
      reason: "Highest-impact opportunity on your radar right now.",
    };
  }

  const active = input.analyses.find(
    (a) => a.project.status === "active" && a.momentum.score >= 40,
  );
  if (active) {
    return {
      title: active.project.title,
      reason: `Good momentum (${active.momentum.score}) — ride it while energy is here.`,
    };
  }

  return {
    title: "Pick one small win",
    reason: "Nothing urgent is screaming — choose one project and move it one step.",
  };
}

function pickSuggestedAction(input: {
  focus: BriefingFocus;
  critical: FounderTrackedIssue[];
  retest: FounderTrackedIssue[];
  topProject?: BriefingProjectAttention;
}): BriefingSuggestedAction {
  if (input.critical[0]) {
    return {
      label: `Create Cursor prompt to fix ${input.critical[0].title}`,
      detail: "Turn this issue into an actionable fix prompt for Cursor.",
      navigateTo: "issue",
      issueId: input.critical[0].id,
    };
  }
  if (input.retest[0]) {
    return {
      label: `Run retest: ${input.retest[0].title}`,
      detail: "Confirm the fix in the Retest Queue.",
      navigateTo: "retest",
      issueId: input.retest[0].id,
    };
  }
  if (input.topProject) {
    return {
      label: `Review ${input.topProject.title}`,
      detail: input.topProject.reason,
      navigateTo: "project",
      projectId: input.topProject.projectId,
    };
  }
  return {
    label: `Focus on: ${input.focus.title}`,
    detail: input.focus.reason,
  };
}

function buildCanWait(
  workspace: FounderWorkspaceData,
  tracking: FounderTrackingData,
): string[] {
  const lines: string[] = [];
  const parkedProjects = workspace.projects.filter((p) => p.status === "parked");
  if (parkedProjects.length) {
    lines.push(
      `${parkedProjects.length} parked project${parkedProjects.length === 1 ? "" : "s"} can wait`,
    );
  }
  const lowIssues = tracking.issues.filter(
    (i) =>
      i.severity === "low" &&
      i.status !== "fixed" &&
      i.status !== "parked",
  );
  if (lowIssues.length) {
    lines.push(
      `${lowIssues.length} low-severity issue${lowIssues.length === 1 ? "" : "s"} can wait`,
    );
  }
  const ideaExperiments = tracking.experiments.filter((e) => e.status === "idea");
  if (ideaExperiments.length) {
    lines.push(
      `${ideaExperiments.length} experiment idea${ideaExperiments.length === 1 ? "" : "s"} — not testing yet`,
    );
  }
  const doneNotes = workspace.notes.filter((n) => n.status === "done").length;
  if (doneNotes > 0) {
    lines.push(`${doneNotes} completed note${doneNotes === 1 ? "" : "s"} — archive if done`);
  }
  if (!lines.length) {
    lines.push("Low-priority items are quiet — you're clear to focus.");
  }
  return lines.slice(0, 3);
}

export function generateFounderDailyBriefing(
  input: FounderBriefingInput,
): FounderDailyBriefing {
  const now = input.now ?? new Date();
  const name = input.founderName?.trim() || "Shari";
  const critical = sortIssuesBySeverity(getCriticalIssues(input.tracking));
  const retest = getRetestQueue(input.tracking);
  const openIssues = sortIssuesBySeverity(openTrackedIssues(input.tracking));
  const projectsNeedingAttention = pickProjectsNeedingAttention(input.analyses);
  const opportunities = pickOpportunities(
    input.dashboard.opportunities,
    input.analyses,
  );
  const activeExperiments = pickActiveExperiments(input.tracking.experiments);

  const todaysFocus = pickTodaysFocus({
    critical,
    retest,
    analyses: input.analyses,
    testing: activeExperiments,
    opportunities,
  });

  const briefingIssues: BriefingOpenIssue[] = openIssues.slice(0, 4).map((i) => ({
    id: i.id,
    title: i.title,
    severity: i.severity,
  }));

  return {
    generatedAt: now.toISOString(),
    greeting: greetingForHour(now.getHours(), name),
    todaysFocus,
    projectsNeedingAttention,
    openIssues: briefingIssues,
    activeExperiments,
    opportunities,
    suggestedAction: pickSuggestedAction({
      focus: todaysFocus,
      critical,
      retest,
      topProject: projectsNeedingAttention[0],
    }),
    canWait: buildCanWait(input.workspace, input.tracking),
    stats: {
      criticalIssueCount: critical.length,
      openIssueCount: openIssues.length,
      projectsNeedingAttentionCount: projectsNeedingAttention.length,
      retestCount: retest.length,
      activeExperimentCount: activeExperiments.length,
    },
  };
}

export function formatBriefingForGuidance(briefing: FounderDailyBriefing): string {
  const lines = [
    "DAILY FOUNDER BRIEFING (trusted partner summary — use this first for priorities):",
    "",
    `${briefing.greeting}`,
    "",
    `TODAY'S FOCUS: ${briefing.todaysFocus.title}`,
    `Reason: ${briefing.todaysFocus.reason}`,
    "",
    `SUGGESTED ACTION: ${briefing.suggestedAction.label}`,
    briefing.suggestedAction.detail,
    "",
    `Open issues: ${briefing.stats.openIssueCount} (${briefing.stats.criticalIssueCount} critical/high)`,
    `Retest queue: ${briefing.stats.retestCount}`,
    `Projects needing attention: ${briefing.stats.projectsNeedingAttentionCount}`,
    `Active experiments (testing): ${briefing.stats.activeExperimentCount}`,
    "",
  ];

  if (briefing.openIssues.length) {
    lines.push("OPEN ISSUES (severity order):");
    for (const issue of briefing.openIssues) {
      lines.push(`- [${issue.id}] ${issue.title} (${issue.severity})`);
    }
    lines.push("");
  }

  if (briefing.projectsNeedingAttention.length) {
    lines.push("PROJECTS NEEDING ATTENTION:");
    for (const p of briefing.projectsNeedingAttention) {
      lines.push(`- [${p.projectId}] ${p.title} — ${p.reason}`);
    }
    lines.push("");
  }

  if (briefing.activeExperiments.length) {
    lines.push("ACTIVE EXPERIMENTS:");
    for (const e of briefing.activeExperiments) {
      lines.push(`- [${e.id}] ${e.title}`);
    }
    lines.push("");
  }

  if (briefing.opportunities.length) {
    lines.push("OPPORTUNITIES:");
    for (const o of briefing.opportunities) {
      const proj = o.projectTitle ? ` (${o.projectTitle})` : "";
      lines.push(`- ${o.idea}${proj}`);
    }
    lines.push("");
  }

  if (briefing.canWait.length) {
    lines.push("CAN WAIT TODAY:");
    for (const item of briefing.canWait) {
      lines.push(`- ${item}`);
    }
  }

  return lines.join("\n");
}
