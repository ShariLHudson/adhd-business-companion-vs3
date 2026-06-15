/**
 * Sync companion app state into recognition milestones.
 */

import { getProjects, getSnippets } from "@/lib/companionStore";
import { dayKey, getRecognitionStore, markBusinessMilestone } from "./recognitionStore";
import type { BusinessMilestoneKey } from "./types";

const MILESTONE_LABELS: Record<BusinessMilestoneKey, string> = {
  first_project: "your first project",
  first_project_completed: "your first completed project",
  first_content_created: "your first piece of content",
  first_launch: "your first launch",
  first_client_milestone: "your first client milestone",
  revenue_milestone: "a revenue milestone",
};

export function milestoneReachedToday(
  iso: string | undefined,
  now = new Date(),
): boolean {
  if (!iso) return false;
  return iso.slice(0, 10) === dayKey(now);
}

function markIfNew(key: BusinessMilestoneKey): void {
  const store = getRecognitionStore();
  if (store.businessMilestones[key]) return;
  markBusinessMilestone(key);
}

export function syncBusinessMilestonesFromApp(): {
  projectCount: number;
  completedProjectCount: number;
  hasCreatedContent: boolean;
  businessMilestones: Partial<Record<BusinessMilestoneKey, string>>;
} {
  const projects = getProjects();
  const projectCount = projects.length;
  const completedProjectCount = projects.filter(
    (p) => p.status === "completed",
  ).length;
  const hasCreatedContent = getSnippets().length > 0;

  if (projectCount >= 1) markIfNew("first_project");
  if (completedProjectCount >= 1) markIfNew("first_project_completed");
  if (hasCreatedContent) markIfNew("first_content_created");

  return {
    projectCount,
    completedProjectCount,
    hasCreatedContent,
    businessMilestones: getRecognitionStore().businessMilestones,
  };
}

export function labelForBusinessMilestone(key: string): string {
  return (
    MILESTONE_LABELS[key as BusinessMilestoneKey] ??
    key.replaceAll("_", " ")
  );
}
