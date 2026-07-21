import type { WorkspaceEnvironmentId } from "./types";

/**
 * Default workspace environment per registered UWE Work Type (091).
 * Intent table environments for future Work Types live in the product standard.
 */
export const DEFAULT_WORK_TYPE_ENVIRONMENTS: Readonly<
  Record<string, WorkspaceEnvironmentId>
> = {
  marketing_plan: "creative-marketing-studio",
  event_plan: "event-planning-studio",
  business_plan: "executive-planning-office",
};

/** Intent-level defaults for Work Types not yet registered in UWE. */
export const INTENDED_WORK_TYPE_ENVIRONMENTS: Readonly<
  Record<string, WorkspaceEnvironmentId>
> = {
  ...DEFAULT_WORK_TYPE_ENVIRONMENTS,
  strategic_plan: "executive-strategy-office",
  projects: "modern-project-studio",
  writing: "authors-library",
  course_creation: "teaching-studio",
  podcast: "recording-studio",
  finance: "executive-financial-office",
  research: "innovation-lab",
  learning: "university-reading-room",
  client_planning: "professional-meeting-suite",
};

export function getDefaultEnvironmentIdForWorkType(
  workTypeId: string,
): WorkspaceEnvironmentId | null {
  return (
    DEFAULT_WORK_TYPE_ENVIRONMENTS[workTypeId] ??
    INTENDED_WORK_TYPE_ENVIRONMENTS[workTypeId] ??
    null
  );
}
