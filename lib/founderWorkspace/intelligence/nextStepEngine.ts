import type { FounderWorkspaceItem } from "../types";
import type { ProjectIssue, ProjectLink, ProjectOpportunity } from "./types";
import { issueSeverityRank } from "./projectIssues";

export type NextStepContext = {
  project: FounderWorkspaceItem;
  openIssues: ProjectIssue[];
  opportunities: ProjectOpportunity[];
  links: ProjectLink[];
  notesAdded: number;
  experimentsCompleted: number;
  daysSinceUpdate: number;
};

function firstSentence(text: string): string {
  const line = text.split("\n").find((l) => l.trim())?.trim() ?? "";
  return line.slice(0, 120);
}

function stepFromDescription(project: FounderWorkspaceItem): string | null {
  const nextLine = project.description
    .split("\n")
    .map((l) => l.trim())
    .find((l) => /^next\s*:/i.test(l));
  if (nextLine) {
    return nextLine.replace(/^next\s*:\s*/i, "").trim();
  }

  const milestone = project.description
    .split("\n")
    .map((l) => l.trim())
    .find((l) => /^(-|\*)?\s*\[[ x]\]/i.test(l) || /^milestone\s*:/i.test(l));
  if (milestone) {
    return milestone
      .replace(/^(-|\*)?\s*\[[ x]\]\s*/i, "")
      .replace(/^milestone\s*:\s*/i, "")
      .trim();
  }

  const sentence = firstSentence(project.description);
  if (sentence.length > 12 && project.status !== "done") {
    return `Advance: ${sentence}`;
  }
  return null;
}

export function computeNextStep(ctx: NextStepContext): string {
  const { project, openIssues, opportunities, links, daysSinceUpdate } = ctx;

  if (project.status === "done") {
    return "Review outcomes and capture learnings in a note.";
  }

  const explicit = stepFromDescription(project);
  if (explicit) return explicit;

  const critical = [...openIssues].sort(
    (a, b) => issueSeverityRank(b.severity) - issueSeverityRank(a.severity),
  )[0];
  if (critical) {
    return `Resolve blocker: ${critical.problem}`;
  }

  const topOpp = [...opportunities]
    .filter((o) => o.status === "open" || o.status === "pursuing")
    .sort((a, b) => {
      const rank = { high: 3, medium: 2, low: 1 };
      return rank[b.potentialImpact] - rank[a.potentialImpact];
    })[0];
  if (topOpp && project.status !== "active") {
    return `Explore opportunity: ${topOpp.idea}`;
  }

  if (project.status === "new" && !project.description.trim()) {
    return `Define the outcome for "${project.title}" in the description.`;
  }

  if (project.status === "parked") {
    return `Unpark or decide whether to close "${project.title}".`;
  }

  if (daysSinceUpdate > 7) {
    return `Schedule a 25-minute focus block on "${project.title}".`;
  }

  const experimentLink = links.find((l) => l.targetKind === "experiment");
  if (experimentLink && ctx.experimentsCompleted === 0) {
    return `Run linked experiment: ${experimentLink.label}`;
  }

  if (ctx.notesAdded === 0) {
    return `Capture a note with hypotheses or open questions for "${project.title}".`;
  }

  if (topOpp) {
    return `Pursue opportunity: ${topOpp.idea}`;
  }

  return `Ship the next visible slice of "${project.title}".`;
}
