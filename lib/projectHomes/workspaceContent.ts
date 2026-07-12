import type { ProjectHomeRecord } from "./types";
import { formatProjectHomeDate } from "./sampleProjects";

/** Short purpose for cards — keep the artwork as the visual focus. */
export function shortPurpose(purpose: string, max = 88): string {
  const trimmed = purpose.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

/** Prototype workspace content — illustrative only; not live project data. */
export function prototypeRecentProgress(
  project: ProjectHomeRecord,
): string[] {
  return [
    `Returned to “${project.currentFocus}”`,
    `Last presence ${formatProjectHomeDate(project.lastWorkedAt)}`,
    "Kept one next step visible — nothing forced",
  ];
}

export function prototypeUpcomingMilestones(
  project: ProjectHomeRecord,
): string[] {
  return [
    project.nextSuggestedStep,
    "A natural pause to review what feels finished",
  ];
}

export function prototypeRelatedConversations(
  currentFocus: string,
): string[] {
  return [
    `Talked through: “${currentFocus}”`,
    "Asked what would make this feel lighter",
  ];
}

export function prototypeOpenQuestions(project: ProjectHomeRecord): string[] {
  return [
    `What would make “${project.currentFocus}” feel clearer?`,
    "What can wait until the next quiet hour?",
  ];
}

export function prototypeRecentWins(project: ProjectHomeRecord): string[] {
  if (project.status === "dreaming") {
    return ["Chose a Project Home and gave the work a place to live"];
  }
  return [
    "Moved the focus forward without overloading the day",
    "Protected one next step instead of a long list",
  ];
}
