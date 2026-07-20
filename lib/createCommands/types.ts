/**
 * 084 — Create Command Library (file / work-level + section lifecycle actions).
 */

export type CreateWorkCommandId =
  | "save"
  | "rename"
  | "duplicate"
  | "archive"
  | "restore"
  | "trash"
  | "permanently_delete"
  | "print"
  | "export"
  | "share"
  | "complete_for_now"
  | "reopen"
  | "skip_for_now"
  | "move_to_project";

export type CreateWorkCommandDef = {
  id: CreateWorkCommandId;
  label: string;
  /** When false, control is hidden (not merely disabled). */
  available: boolean;
  /** When true, control is visible but not actionable yet. */
  enabled: boolean;
  /** Truthful reason when disabled. */
  disabledReason?: string;
};

/** Estate toolbar order (work-level). */
export const CREATE_WORK_COMMAND_ORDER: readonly CreateWorkCommandId[] = [
  "save",
  "rename",
  "duplicate",
  "archive",
  "trash",
  "print",
  "export",
  "share",
] as const;

/** Full dispatcher catalog. */
export const CREATE_WORK_COMMAND_CATALOG: readonly CreateWorkCommandId[] = [
  "save",
  "rename",
  "duplicate",
  "archive",
  "restore",
  "trash",
  "permanently_delete",
  "print",
  "export",
  "share",
  "complete_for_now",
  "reopen",
  "skip_for_now",
  "move_to_project",
] as const;
