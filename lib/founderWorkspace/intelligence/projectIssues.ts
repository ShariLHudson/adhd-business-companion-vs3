import type { FounderWorkspaceData, FounderWorkspaceItem } from "../types";
import type { IssueSeverity, IssueStatus, ProjectIssue } from "./types";

const ISSUE_LINE =
  /^(?:issue|bug|problem|blocker)\s*:\s*(.+)$/i;

function newId(): string {
  return `pi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function inferSeverity(text: string): IssueSeverity {
  const lower = text.toLowerCase();
  if (/\b(critical|crash|down|blocked)\b/.test(lower)) return "critical";
  if (/\b(urgent|broken|error|blocker)\b/.test(lower)) return "high";
  if (/\b(slow|confusing|minor)\b/.test(lower)) return "low";
  return "medium";
}

export function inferIssuesFromProject(
  project: FounderWorkspaceItem,
): Omit<ProjectIssue, "id">[] {
  const found: Omit<ProjectIssue, "id">[] = [];
  const now = new Date().toISOString();

  for (const line of project.description.split("\n")) {
    const match = line.trim().match(ISSUE_LINE);
    if (!match?.[1]) continue;
    const problem = match[1].trim();
    if (!problem) continue;
    found.push({
      projectId: project.id,
      problem,
      severity: inferSeverity(problem),
      status: "active",
      dateFound: now,
    });
  }

  if (
    found.length === 0 &&
    /\b(bug|broken|blocker|doesn't work|does not work)\b/i.test(
      `${project.title} ${project.description}`,
    )
  ) {
    found.push({
      projectId: project.id,
      problem: `Unresolved problem noted in "${project.title}"`,
      severity: "medium",
      status: "active",
      dateFound: now,
    });
  }

  return found;
}

export function mergeInferredIssues(
  existing: ProjectIssue[],
  project: FounderWorkspaceItem,
): ProjectIssue[] {
  const inferred = inferIssuesFromProject(project);
  const forProject = existing.filter((i) => i.projectId === project.id);
  const others = existing.filter((i) => i.projectId !== project.id);
  const merged = [...forProject];

  for (const candidate of inferred) {
    const duplicate = merged.some(
      (i) =>
        i.status === "active" &&
        i.problem.toLowerCase() === candidate.problem.toLowerCase(),
    );
    if (!duplicate) {
      merged.push({ ...candidate, id: newId() });
    }
  }

  return [...others, ...merged];
}

export function syncIssuesFromWorkspace(
  issues: ProjectIssue[],
  data: FounderWorkspaceData,
): ProjectIssue[] {
  let next = issues.filter((issue) =>
    data.projects.some((p) => p.id === issue.projectId),
  );
  for (const project of data.projects) {
    next = mergeInferredIssues(next, project);
  }
  return next;
}

export function getOpenIssuesForProject(
  issues: ProjectIssue[],
  projectId: string,
): ProjectIssue[] {
  return issues.filter(
    (i) => i.projectId === projectId && i.status === "active",
  );
}

export function getAllOpenIssues(issues: ProjectIssue[]): ProjectIssue[] {
  return issues.filter((i) => i.status === "active");
}

export function issueSeverityRank(severity: IssueSeverity): number {
  if (severity === "critical") return 4;
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

export function topRiskFromIssues(issues: ProjectIssue[]): string | null {
  const open = getAllOpenIssues(issues);
  if (open.length === 0) return null;
  const sorted = [...open].sort(
    (a, b) => issueSeverityRank(b.severity) - issueSeverityRank(a.severity),
  );
  return sorted[0]?.problem ?? null;
}

export function updateIssueStatus(
  issues: ProjectIssue[],
  issueId: string,
  status: IssueStatus,
  resolution?: string,
): ProjectIssue[] {
  return issues.map((issue) =>
    issue.id === issueId
      ? { ...issue, status, resolution: resolution ?? issue.resolution }
      : issue,
  );
}
