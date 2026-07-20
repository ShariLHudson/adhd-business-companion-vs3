/**
 * Standard 071 — Active Workspace Registry entry.
 * First-class platform object for Creation Destinations.
 */

export type ActiveWorkspaceDraftState =
  | "none"
  | "building"
  | "ready"
  | "error";

/**
 * 084 File commands — disposition (Continue Your Work).
 * Archive / Trash are recoverable. Deleted is permanent.
 * Work ID never changes across archive → restore.
 */
export type ActiveWorkspaceStatus =
  | "active"
  | "completed"
  | "archived"
  | "trashed"
  | "deleted";

export type ActiveWorkspaceEntry = {
  /** Canonical workspace id (same as Runtime Creation Record id when possible). */
  workspaceId: string;
  creationType: string;
  title: string;
  currentFocusTitle: string | null;
  currentFocusId: string | null;
  progressLabel: string;
  lastActivityAt: string;
  draftState: ActiveWorkspaceDraftState;
  hasDraft: boolean;
  /** Always Estate Create Destination for 066/071. */
  resumeTarget: "estate-create";
  runtimeCreationRecordId: string;
  eventRecordId: string | null;
  projectHomeId: string | null;
  sessionId: string | null;
  status: ActiveWorkspaceStatus;
  createdAt: string;
};

export type ActiveWorkspaceResumeResult = {
  entry: ActiveWorkspaceEntry;
  guidance: string;
};
