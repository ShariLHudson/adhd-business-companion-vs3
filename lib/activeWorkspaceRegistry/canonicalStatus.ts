/**
 * 073/074 — One canonical member-facing status for every surface.
 * Never "Shaping" in one place and "Draft ready" in another.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflowState";
import type { ActiveWorkspaceDraftState, ActiveWorkspaceEntry } from "./types";

export type CanonicalWorkspaceStatus =
  | "Getting Started"
  | "In Progress"
  | "Draft Ready"
  | "Needs Review"
  | "Ready to Use"
  | "Paused"
  | "Completed";

export type CanonicalStatusInput = {
  draftState?: ActiveWorkspaceDraftState | string | null;
  progressLabel?: string | null;
  hasDraft?: boolean;
  draftContent?: string | null;
  draftStatus?: CreateWorkflowState["draftStatus"] | null;
  /** Internal phase labels like "Shaping" are ignored for member status. */
  workspacePhaseLabel?: string | null;
};

const INTERNAL_PHASE_IGNORE =
  /^(shaping|foundation|discovery|viability|strategy|experience design|planning)$/i;

/**
 * Single status resolver for Welcome Home, Create, Projects, chat, header.
 */
export function resolveCanonicalWorkspaceStatus(
  input: CanonicalStatusInput,
): CanonicalWorkspaceStatus {
  const draftReady =
    input.hasDraft ||
    Boolean(input.draftContent?.trim()) ||
    input.draftState === "ready" ||
    input.draftStatus === "ready" ||
    /draft ready/i.test(input.progressLabel || "");

  if (input.draftState === "error" || input.draftStatus === "error") {
    return "Needs Review";
  }
  if (draftReady) return "Draft Ready";
  if (
    /ready to (?:build|use)/i.test(input.progressLabel || "") ||
    /^completed$/i.test(input.progressLabel || "")
  ) {
    return "Ready to Use";
  }
  if (/paused/i.test(input.progressLabel || "")) return "Paused";
  if (/needs review/i.test(input.progressLabel || "")) return "Needs Review";

  const progress = (input.progressLabel || "").trim();
  if (/\d+ of \d+/i.test(progress)) return "In Progress";
  if (
    /getting started|0 of /i.test(progress) ||
    input.draftState === "none" ||
    !progress
  ) {
    // Ignore internal "Shaping" / "Foundation" as member status
    if (
      input.workspacePhaseLabel &&
      !INTERNAL_PHASE_IGNORE.test(input.workspacePhaseLabel)
    ) {
      // fall through
    }
    if (!progress || /getting started/i.test(progress)) {
      return "Getting Started";
    }
  }
  if (input.draftState === "building" || input.draftStatus === "building") {
    return "In Progress";
  }
  return "In Progress";
}

export function canonicalStatusFromEntry(
  entry: ActiveWorkspaceEntry,
): CanonicalWorkspaceStatus {
  return resolveCanonicalWorkspaceStatus({
    draftState: entry.draftState,
    progressLabel: entry.progressLabel,
    hasDraft: entry.hasDraft,
  });
}

export function canonicalStatusFromWorkflow(
  workflow: CreateWorkflowState,
): CanonicalWorkspaceStatus {
  return resolveCanonicalWorkspaceStatus({
    draftStatus: workflow.draftStatus,
    draftContent: workflow.draftContent,
    hasDraft: Boolean(workflow.draftContent?.trim()),
    workspacePhaseLabel: workflow.workspacePhaseLabel,
    progressLabel: workflow.draftContent?.trim()
      ? "Draft ready for review"
      : null,
  });
}
