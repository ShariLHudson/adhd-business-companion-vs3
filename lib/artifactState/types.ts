/**
 * Spark Estate™ — Universal Artifact State Model
 * Artifact memory for facilitated creation — not UI.
 *
 * Shari tracks work-in-progress; the member owns the artifact.
 */

import type { AppSection } from "@/lib/companionUi";
import type { IntelligenceReadyHooks } from "@/lib/intelligence/intelligenceReadyTypes";

/** Lifecycle of the whole artifact */
export type ArtifactStatus =
  | "exploring"
  | "ready_to_build"
  | "building"
  | "working_draft"
  | "needs_review"
  | "ready_to_finalize"
  | "finalized"
  | "saved"
  | "paused";

/** Per-section progress — distinguishes member vs Shari contributions */
export type ArtifactSectionStatus =
  | "not_started"
  | "in_progress"
  | "answered_by_user"
  | "drafted_by_shari"
  | "user_edited"
  | "needs_review"
  | "approved";

/** Where section content originated */
export type ArtifactSource =
  | "user"
  | "shari_suggestion"
  | "imported_research"
  | "previous_artifact"
  | "momentum_institute"
  | "template"
  | "manual_edit";

export type ArtifactNextAction =
  | "continue_section"
  | "review_section"
  | "skip_section"
  | "pause"
  | "save_paused"
  | "finalize"
  | "export"
  | "print"
  | "publish"
  | "research"
  | "lesson"
  | "start_over_section"
  | "compare_versions"
  | "keep_both_options";

export type ArtifactRevision = {
  id: string;
  sectionId: string;
  content: string;
  source: ArtifactSource;
  createdAt: string;
  /** Optional label when keeping parallel options */
  label?: string;
};

export type ArtifactQuestion = {
  id: string;
  sectionId: string;
  prompt: string;
  answered: boolean;
  revisitRequested: boolean;
};

export type ArtifactSection = {
  id: string;
  label: string;
  status: ArtifactSectionStatus;
  content: string;
  /** Primary origin of current active content */
  primarySource: ArtifactSource;
  skipped: boolean;
  unsure: boolean;
  activeRevisionId: string | null;
};

export type Artifact = {
  id: string;
  type: string;
  title: string;
  status: ArtifactStatus;
  sections: ArtifactSection[];
  questions: ArtifactQuestion[];
  revisions: ArtifactRevision[];
  /** Room member left from when paused */
  pausedFromSection: AppSection | null;
  pauseReason: string | null;
  /** Section ids member asked to revisit */
  revisitSectionIds: string[];
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
  /** Links to Create workflow session */
  workflowSessionId: string | null;
  intelligence?: IntelligenceReadyHooks;
};

export const ARTIFACT_STATUS_LABELS: Record<ArtifactStatus, string> = {
  exploring: "Exploring",
  ready_to_build: "Ready to build",
  building: "Building",
  working_draft: "Working draft",
  needs_review: "Needs review",
  ready_to_finalize: "Ready to finalize",
  finalized: "Finalized",
  saved: "Saved",
  paused: "Paused",
};

export const ARTIFACT_SECTION_STATUS_LABELS: Record<
  ArtifactSectionStatus,
  string
> = {
  not_started: "Not started",
  in_progress: "In progress",
  answered_by_user: "Answered",
  drafted_by_shari: "Working draft",
  user_edited: "Edited by you",
  needs_review: "Needs review",
  approved: "Approved",
};

export const ARTIFACT_SOURCE_LABELS: Record<ArtifactSource, string> = {
  user: "You",
  shari_suggestion: "Shari suggested",
  imported_research: "Research",
  previous_artifact: "Previous artifact",
  momentum_institute: "Momentum Institute™",
  template: "Template",
  manual_edit: "Your edit",
};
