/**
 * Facilitated Creation Flow — Shari facilitates; the member owns the business.
 * Split workspace opens only when building, tracking, or reviewing matters.
 */

import {
  CREATE_SECTION_LIFECYCLE_LABELS,
  type CreateSectionLifecycleStatus,
} from "@/lib/createSectionLifecycle";

/** @deprecated Prefer CreateSectionLifecycleStatus from createSectionLifecycle. */
export type FacilitatedSectionStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "complete_for_now"
  | "skipped_for_now"
  | "reopened"
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
  not_started: CREATE_SECTION_LIFECYCLE_LABELS.not_started,
  in_progress: CREATE_SECTION_LIFECYCLE_LABELS.in_progress,
  complete: "Complete",
  complete_for_now: CREATE_SECTION_LIFECYCLE_LABELS.complete_for_now,
  skipped_for_now: CREATE_SECTION_LIFECYCLE_LABELS.skipped_for_now,
  reopened: CREATE_SECTION_LIFECYCLE_LABELS.reopened,
  needs_review: CREATE_SECTION_LIFECYCLE_LABELS.needs_review,
};

export type { CreateSectionLifecycleStatus };
