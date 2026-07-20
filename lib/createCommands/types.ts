/**
 * 084 — Create Command Library (file / work-level actions for Estate Create).
 * Section commands live on Current Focus + Workshop Map.
 */

export type CreateWorkCommandId =
  | "save"
  | "rename"
  | "duplicate"
  | "archive"
  | "trash"
  | "print"
  | "export"
  | "share";

export type CreateWorkCommandDef = {
  id: CreateWorkCommandId;
  label: string;
  /** When false, control is hidden (not merely disabled). */
  available: boolean;
  /** When true, control is visible but not actionable yet. */
  enabled: boolean;
};

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
