/**
 * 066 — Single Experience Workspace Standard
 */

export const SINGLE_EXPERIENCE_WORKSPACE_STANDARD_ID = "066" as const;

export const SINGLE_EXPERIENCE_WORKSPACE_RULE = {
  id: SINGLE_EXPERIENCE_WORKSPACE_STANDARD_ID,
  name: "Single Experience Workspace",
  /** Permanent: no Chat | Workspace dual pane for Creation. */
  legacySplitRetired: true,
  /** Creation opens as workspace-primary, never permanent split. */
  creationLayoutMode: "workspace-focus" as const,
  principle:
    "The workspace is the experience. Shari exists inside that experience.",
} as const;

export type CreationLayoutMode = "workspace-focus";
