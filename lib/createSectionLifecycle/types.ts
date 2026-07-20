/**
 * Universal Create section lifecycle (077_006).
 * One authoritative status vocabulary for all Work Types.
 */

export type CreateSectionLifecycleStatus =
  | "not_started"
  | "in_progress"
  | "complete_for_now"
  | "skipped_for_now"
  | "reopened"
  | "needs_review";

/** @deprecated Prefer complete_for_now — kept for FacilitatedCreation aliases. */
export type LegacyFacilitatedCompleteAlias = "complete";

export type CreateSectionLifecycleTransition =
  | { type: "start" }
  | { type: "complete_for_now" }
  | { type: "skip_for_now" }
  | { type: "unskip" }
  | { type: "reopen" }
  | { type: "edit"; content: string }
  | { type: "mark_needs_review" };

/** Event Record domain projection — not a parallel Create SoT. */
export type EventSectionDomainStatus =
  | "empty"
  | "drafting"
  | "confirmed"
  | "skipped";

export const CREATE_SECTION_LIFECYCLE_LABELS: Record<
  CreateSectionLifecycleStatus,
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete_for_now: "Complete for Now",
  skipped_for_now: "Skipped for Now",
  reopened: "Reopened",
  needs_review: "Needs Review",
};
