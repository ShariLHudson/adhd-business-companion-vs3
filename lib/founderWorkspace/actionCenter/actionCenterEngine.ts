import type { FounderDailyBriefing } from "../briefing/founderBriefingEngine";
import type { CursorPromptInput } from "../cursorPromptGenerator";
import type { ProjectIntelligence } from "../intelligence/types";
import type { FounderTrackingData } from "../tracking/types";
import {
  experimentStatusLabel,
  issueSeverityLabel,
  issueStatusLabel,
} from "../tracking/types";
import type { FounderWorkspaceData } from "../types";
import { statusLabel } from "../types";

import type {
  ActionCenterSource,
  EffortLevel,
  FounderRecommendedTask,
  ImpactLevel,
} from "./types";

function severityToImpact(
  severity: "low" | "medium" | "high" | "critical",
): ImpactLevel {
  if (severity === "critical" || severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function projectHealthToImpact(health?: string): ImpactLevel {
  if (health === "at_risk") return "high";
  if (health === "stalled" || health === "needs_attention") return "medium";
  return "low";
}

function projectHealthToEffort(health?: string): EffortLevel {
  if (health === "stalled") return "high";
  if (health === "at_risk") return "medium";
  return "low";
}

function resolveCursorContext(
  source: ActionCenterSource,
  tracking: FounderTrackingData,
): CursorPromptInput | null {
  if (source.kind === "issue") {
    const issue = source.issue;
    if (issue.status === "retest") {
      const linkedExperiment = tracking.experiments.find(
        (e) => e.relatedIssueId === issue.id,
      );
      return { kind: "retest", issue, linkedExperiment };
    }
    return { kind: "bug_fix", issue };
  }
  if (source.kind === "project") {
    return { kind: "feature", project: source.project };
  }
  if (source.kind === "experiment") {
    const relatedIssue = source.experiment.relatedIssueId
      ? tracking.issues.find((i) => i.id === source.experiment.relatedIssueId)
      : undefined;
    return {
      kind: "experiment",
      experiment: source.experiment,
      relatedIssue,
    };
  }
  return null;
}

function buildTask(
  input: Omit<FounderRecommendedTask, "cursorContext"> & {
    tracking: FounderTrackingData;
  },
): FounderRecommendedTask {
  const { tracking, ...rest } = input;
  return {
    ...rest,
    cursorContext: resolveCursorContext(rest.source, tracking),
  };
}

export function resolveRecommendedTask(input: {
  briefing: FounderDailyBriefing;
  tracking: FounderTrackingData;
  analyses: ProjectIntelligence[];
  workspace: FounderWorkspaceData;
}): FounderRecommendedTask {
  const { briefing, tracking, analyses, workspace } = input;
  const suggested = briefing.suggestedAction;

  if (suggested.issueId) {
    const issue = tracking.issues.find((i) => i.id === suggested.issueId);
    if (issue) {
      const isRetest =
        suggested.navigateTo === "retest" || issue.status === "retest";
      return buildTask({
        tracking,
        title: issue.title,
        reason: suggested.detail || briefing.todaysFocus.reason,
        impact: severityToImpact(issue.severity),
        effort: isRetest ? "low" : issue.severity === "critical" ? "medium" : "low",
        status: issueStatusLabel(issue.status),
        source: { kind: "issue", issue },
        navigateTo: "issue",
        itemId: issue.id,
        issueFilter: isRetest ? "retest" : undefined,
      });
    }
  }

  if (suggested.projectId) {
    const project = workspace.projects.find((p) => p.id === suggested.projectId);
    const analysis = analyses.find((a) => a.project.id === suggested.projectId);
    if (project) {
      return buildTask({
        tracking,
        title: project.title,
        reason: suggested.detail || briefing.todaysFocus.reason,
        impact: projectHealthToImpact(analysis?.health),
        effort: projectHealthToEffort(analysis?.health),
        status: statusLabel(project.status),
        source: { kind: "project", project },
        navigateTo: "project",
        itemId: project.id,
      });
    }
  }

  const focusTitle = briefing.todaysFocus.title.toLowerCase();
  const matchedExperiment = tracking.experiments.find(
    (e) =>
      e.title.toLowerCase() === focusTitle ||
      briefing.activeExperiments.some((a) => a.id === e.id),
  );
  if (matchedExperiment) {
    return buildTask({
      tracking,
      title: matchedExperiment.title,
      reason: briefing.todaysFocus.reason,
      impact: "medium",
      effort: matchedExperiment.status === "testing" ? "low" : "medium",
      status: experimentStatusLabel(matchedExperiment.status),
      source: { kind: "experiment", experiment: matchedExperiment },
      navigateTo: "dev_experiment",
      itemId: matchedExperiment.id,
    });
  }

  const critical = tracking.issues.find(
    (i) =>
      (i.severity === "critical" || i.severity === "high") &&
      i.status !== "fixed" &&
      i.status !== "parked",
  );
  if (critical) {
    return buildTask({
      tracking,
      title: critical.title,
      reason: `High-severity issue (${issueSeverityLabel(critical.severity)}) needs attention.`,
      impact: "high",
      effort: "medium",
      status: issueStatusLabel(critical.status),
      source: { kind: "issue", issue: critical },
      navigateTo: "issue",
      itemId: critical.id,
    });
  }

  return buildTask({
    tracking,
    title: briefing.todaysFocus.title,
    reason: briefing.todaysFocus.reason,
    impact: "medium",
    effort: "medium",
    status: "Recommended",
    source: {
      kind: "focus",
      title: briefing.todaysFocus.title,
      reason: briefing.todaysFocus.reason,
    },
  });
}

export function insightNoteFromTask(task: FounderRecommendedTask): {
  title: string;
  body: string;
} {
  const link =
    task.source.kind === "issue"
      ? `Issue: ${task.source.issue.title} [${task.source.issue.id}]`
      : task.source.kind === "project"
        ? `Project: ${task.source.project.title} [${task.source.project.id}]`
        : task.source.kind === "experiment"
          ? `Experiment: ${task.source.experiment.title} [${task.source.experiment.id}]`
          : `Focus: ${task.source.title}`;

  return {
    title: `Insight: ${task.title}`,
    body: [
      link,
      "",
      `Recommendation: ${task.title}`,
      task.reason,
      "",
      "---",
      "",
      "Notes:",
    ].join("\n"),
  };
}

export function issueDraftFromTask(task: FounderRecommendedTask): {
  title: string;
  description: string;
} {
  return {
    title: task.title.startsWith("Fix ") ? task.title : `Fix: ${task.title}`,
    description: [
      task.reason,
      "",
      "Reported from Action Center recommendation.",
    ].join("\n"),
  };
}

export function experimentDraftFromTask(
  task: FounderRecommendedTask,
): {
  title: string;
  hypothesis: string;
  testPlan: string;
  relatedProjectId?: string;
  relatedProjectTitle?: string;
  relatedIssueId?: string;
} {
  const base = {
    title: `Test: ${task.title}`,
    hypothesis: task.reason,
    testPlan: `1. Define success criteria for "${task.title}"\n2. Run a small test\n3. Record results in founder workspace`,
  };

  if (task.source.kind === "project") {
    return {
      ...base,
      relatedProjectId: task.source.project.id,
      relatedProjectTitle: task.source.project.title,
    };
  }
  if (task.source.kind === "issue") {
    return {
      ...base,
      relatedIssueId: task.source.issue.id,
      relatedProjectId: task.source.issue.relatedProjectId,
      relatedProjectTitle: task.source.issue.relatedProjectTitle,
    };
  }
  if (task.source.kind === "experiment") {
    return {
      title: task.source.experiment.title,
      hypothesis: task.source.experiment.hypothesis || task.reason,
      testPlan: task.source.experiment.testPlan || base.testPlan,
      relatedProjectId: task.source.experiment.relatedProjectId,
      relatedProjectTitle: task.source.experiment.relatedProjectTitle,
      relatedIssueId: task.source.experiment.relatedIssueId,
    };
  }
  return base;
}

export function formatActionCenterForGuidance(
  task: FounderRecommendedTask,
): string {
  const lines = [
    "ACTION CENTER (current recommended task — launch actions from here):",
    "",
    `Title: ${task.title}`,
    `Reason: ${task.reason}`,
    `Impact: ${task.impact} | Effort: ${task.effort} | Status: ${task.status}`,
    task.navigateTo
      ? `Navigate: ${task.navigateTo}${task.itemId ? ` [${task.itemId}]` : ""}`
      : "Navigate: (general focus)",
    task.cursorContext
      ? `Cursor prompt available: ${task.cursorContext.kind}`
      : "Cursor prompt: not auto-linked (use feature/issue/experiment source)",
    "",
    "Available founder actions: Start Working, Generate/Copy/Save Cursor Prompt, Capture Insight (note), Test This Idea (experiment), Report Problem (issue), Done, Park, Needs More Research, Research This (note with questions).",
  ];
  return lines.join("\n");
}
