import type { FounderWorkspaceItem } from "../types";
import {
  generateBugFixPrompt,
  generateCursorPrompt as buildCursorPrompt,
  generateExperimentPrompt,
  generateFeaturePrompt,
  type CursorPromptInput,
  type CursorPromptKind,
} from "../cursorPromptGenerator";
import type { FounderTrackedExperiment, FounderTrackedIssue } from "./types";

export function generateCursorPrompt(issue: FounderTrackedIssue): string {
  return generateBugFixPrompt(issue);
}

export const generateProjectCursorPrompt = generateFeaturePrompt;

export const generateExperimentCursorPrompt = generateExperimentPrompt;

export function resolveCursorPromptInput(input: {
  kind: CursorPromptKind;
  issueId?: string;
  projectId?: string;
  experimentId?: string;
  issues: FounderTrackedIssue[];
  projects: FounderWorkspaceItem[];
  experiments: FounderTrackedExperiment[];
}): CursorPromptInput | null {
  if (input.kind === "bug_fix" || input.kind === "retest") {
    const issue = input.issues.find((i) => i.id === input.issueId);
    if (!issue) return null;
    const linkedExperiment = input.experiments.find(
      (e) => e.relatedIssueId === issue.id,
    );
    if (input.kind === "retest") {
      return { kind: "retest", issue, linkedExperiment };
    }
    return { kind: "bug_fix", issue };
  }
  if (input.kind === "feature") {
    const project = input.projects.find((p) => p.id === input.projectId);
    if (!project) return null;
    return { kind: "feature", project };
  }
  const experiment = input.experiments.find((e) => e.id === input.experimentId);
  if (!experiment) return null;
  const relatedIssue = experiment.relatedIssueId
    ? input.issues.find((i) => i.id === experiment.relatedIssueId)
    : undefined;
  return { kind: "experiment", experiment, relatedIssue };
}

export type CursorPromptContext =
  | { kind: "issue"; issue: FounderTrackedIssue }
  | { kind: "project"; project: FounderWorkspaceItem }
  | { kind: "experiment"; experiment: FounderTrackedExperiment }
  | { kind: "retest"; issue: FounderTrackedIssue; linkedExperiment?: FounderTrackedExperiment };

export function generateCursorPromptFromContext(
  ctx: CursorPromptContext,
  extraNotes?: string,
): string {
  let input: CursorPromptInput;
  if (ctx.kind === "issue") {
    input = { kind: "bug_fix", issue: ctx.issue };
  } else if (ctx.kind === "project") {
    input = { kind: "feature", project: ctx.project };
  } else if (ctx.kind === "experiment") {
    input = { kind: "experiment", experiment: ctx.experiment };
  } else {
    input = {
      kind: "retest",
      issue: ctx.issue,
      linkedExperiment: ctx.linkedExperiment,
    };
  }
  return buildCursorPrompt(input, extraNotes);
}
