import type {
  LibraryItem,
  LibraryItemCapabilities,
  SparkLibraryCardActionId,
} from "./types";

export const EMPTY_CAPABILITIES: LibraryItemCapabilities = {
  canRename: false,
  canEditDetails: false,
  canDuplicate: false,
  canArchive: false,
  canRestore: false,
  canTrash: false,
  canFavorite: false,
  canCreateProject: false,
  canViewLinkedProject: false,
  canViewSourceCreation: false,
  canChangeStatus: false,
  canContinue: false,
  canOpen: false,
};

const ACTION_LABELS: Record<SparkLibraryCardActionId, string> = {
  continue: "Continue Editing",
  open: "Open Project",
  resume: "Continue Editing",
  rename: "Rename",
  edit_details: "Edit Details",
  favorite: "Favorite",
  unfavorite: "Remove Favorite",
  pin: "Pin",
  archive: "Archive",
  restore: "Restore",
  duplicate: "Duplicate",
  move: "Move",
  export: "Export",
  download: "Download",
  print: "Print",
  mark_complete: "Mark Complete",
  change_status: "Change Status",
  turn_into_project: "Turn Into Project",
  view_linked_project: "View Linked Project",
  view_source_creation: "View Source Creation",
  trash: "Move to Trash",
  delete: "Delete",
};

export function labelForLibraryAction(action: SparkLibraryCardActionId): string {
  return ACTION_LABELS[action] ?? action;
}

/** Map capabilities → ordered overflow menu actions (primary excluded). */
export function menuActionsForItem(
  item: LibraryItem,
): SparkLibraryCardActionId[] {
  const c = item.capabilities;
  const actions: SparkLibraryCardActionId[] = [];

  if (item.kind === "creation") {
    if (c.canContinue && item.primaryAction !== "continue") {
      actions.push("continue");
    }
    if (c.canRename) actions.push("rename");
    if (c.canEditDetails) actions.push("edit_details");
    if (c.canDuplicate) actions.push("duplicate");
    if (c.canCreateProject) actions.push("turn_into_project");
    if (c.canViewLinkedProject) actions.push("view_linked_project");
    if (c.canFavorite) {
      actions.push(item.favorite ? "unfavorite" : "favorite");
    }
    if (item.archived && c.canRestore) actions.push("restore");
    else if (c.canArchive) actions.push("archive");
    if (c.canTrash) actions.push("trash");
  } else {
    if (c.canOpen && item.primaryAction !== "open") actions.push("open");
    if (c.canRename) actions.push("rename");
    if (c.canEditDetails) actions.push("edit_details");
    if (c.canDuplicate) actions.push("duplicate");
    if (c.canViewSourceCreation) actions.push("view_source_creation");
    if (c.canChangeStatus) actions.push("change_status");
    if (c.canFavorite) {
      actions.push(item.favorite ? "unfavorite" : "favorite");
    }
    if (item.archived && c.canRestore) actions.push("restore");
    else if (c.canArchive) actions.push("archive");
    // Phase 1: no unsafe permanent delete for projects
  }

  return actions;
}

export function primaryActionLabel(item: LibraryItem): string {
  if (item.archived && item.capabilities.canRestore) return "Restore";
  if (item.primaryAction === "continue" || item.primaryAction === "resume") {
    return "Continue Editing";
  }
  if (item.primaryAction === "open") return "Open Project";
  return labelForLibraryAction(item.primaryAction);
}
