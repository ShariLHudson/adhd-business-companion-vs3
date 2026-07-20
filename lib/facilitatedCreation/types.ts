/**
 * Facilitated Creation Flow — Shari facilitates; the member owns the business.
 * Split workspace opens only when building, tracking, or reviewing matters.
 */

export type FacilitatedSectionStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "complete_for_now"
  | "skipped_for_now"
  | "needs_review";

export type FacilitatedCreationPhase =
  | "exploring"
  | "facilitating"
  | "workspace_pending_consent"
  | "workspace_active"
  | "review";

export type FacilitatedCreationSession = {
  artifactType: string;
  phase: FacilitatedCreationPhase;
  /** Index into facilitation question sequence */
  questionIndex: number;
  /** Section id currently being facilitated in workspace */
  activeSectionId: string | null;
  /** Answers captured during workspace facilitation (section id → content) */
  sectionAnswers: Record<string, string>;
  workspaceConsentOffered: boolean;
  reviewOffered: boolean;
  startedAt: string;
};

export const FACILITATED_SECTION_STATUS_LABELS: Record<
  FacilitatedSectionStatus,
  string
> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
  complete_for_now: "Complete for Now",
  skipped_for_now: "Skipped for Now",
  needs_review: "Needs Review",
};
