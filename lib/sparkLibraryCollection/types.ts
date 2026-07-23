/**
 * Global Library & Collection Standard™ (133) — types.
 * @see docs/constitution/133_GLOBAL_LIBRARY_AND_COLLECTION_STANDARD.md
 * @see docs/create-projects/shared-library-management.md
 */

/** Surfaces that list multiple user-owned records. */
export type SparkLibraryCollectionSurface =
  | "create"
  | "projects"
  | "journal"
  | "evidence-vault"
  | "spark-cards"
  | "business-estate"
  | "marketing"
  | "founder-workspace"
  | "learning"
  | "documents"
  | "conversations"
  | "chamber-library"
  | "other";

export type LibraryRecordKind = "creation" | "project";

/**
 * Actions that must be available from card/row when they do not require
 * the item interior (Standard 133 Rule 1).
 */
export type SparkLibraryCardActionId =
  | "continue"
  | "open"
  | "resume"
  | "rename"
  | "edit_details"
  | "favorite"
  | "unfavorite"
  | "pin"
  | "archive"
  | "restore"
  | "duplicate"
  | "move"
  | "export"
  | "download"
  | "print"
  | "mark_complete"
  | "change_status"
  | "turn_into_project"
  | "view_linked_project"
  | "view_source_creation"
  | "trash"
  | "delete";

/** Capability flags — only show supported actions. */
export type LibraryItemCapabilities = {
  canRename: boolean;
  canEditDetails: boolean;
  canDuplicate: boolean;
  canArchive: boolean;
  canRestore: boolean;
  canTrash: boolean;
  canFavorite: boolean;
  canCreateProject: boolean;
  canViewLinkedProject: boolean;
  canViewSourceCreation: boolean;
  canChangeStatus: boolean;
  canContinue: boolean;
  canOpen: boolean;
};

export type LibraryCreationFilterId =
  | "all"
  | "in_progress"
  | "draft"
  | "completed"
  | "favorites"
  | "archived";

export type LibraryProjectFilterId =
  | "all"
  | "active"
  | "planning"
  | "waiting"
  | "completed"
  | "favorites"
  | "archived";

export type LibraryFilterId = LibraryCreationFilterId | LibraryProjectFilterId;

export type LibraryCreationSortId =
  | "recently_updated"
  | "recently_created"
  | "name_asc"
  | "name_desc"
  | "status"
  | "creation_type";

export type LibraryProjectSortId =
  | "recently_updated"
  | "recently_created"
  | "name_asc"
  | "name_desc"
  | "status"
  | "due_date";

export type LibrarySortId = LibraryCreationSortId | LibraryProjectSortId;

export type LibraryViewMode = "comfortable" | "compact";

export type LibraryRelationshipRef = {
  kind: "linked_project" | "source_creation";
  id: string;
  label: string;
};

/** Normalized library item — adapters map domain records into this shape. */
export type LibraryItem = {
  id: string;
  kind: LibraryRecordKind;
  title: string;
  description?: string | null;
  typeLabel?: string | null;
  statusId: string;
  statusLabel: string;
  tags?: readonly string[];
  clientOrAudience?: string | null;
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  dueAt?: string | null;
  nextMilestoneLabel?: string | null;
  relationship?: LibraryRelationshipRef | null;
  capabilities: LibraryItemCapabilities;
  primaryAction: SparkLibraryCardActionId;
  /** Opaque domain payload for adapters (workspace summary, project home, etc.). */
  sourceRef: unknown;
};

export type LibraryUiState = {
  surface: SparkLibraryCollectionSurface;
  search: string;
  filter: LibraryFilterId;
  sort: LibrarySortId;
  view: LibraryViewMode;
  scrollTop?: number;
  pageSize: number;
  visibleCount: number;
};

export type LibraryQueryResult<T extends LibraryItem = LibraryItem> = {
  items: T[];
  totalMatched: number;
  totalSource: number;
  hasMore: boolean;
  visibleCount: number;
};

export type SparkLibraryItemPresentation = {
  title: string;
  preview?: string | null;
  statusLabel?: string | null;
  primaryAction: SparkLibraryCardActionId;
  /** Secondary actions — overflow OK; keep ≤3 visible before disclosure */
  secondaryActions: readonly SparkLibraryCardActionId[];
};

/** Constitutional principle — permanent release reminder. */
export const SPARK_LIBRARY_CARD_ACTION_PRINCIPLE =
  "If a member can reasonably perform an action without opening an item, they must be able to do so from the item's card or list row." as const;

export const SPARK_LIBRARY_COLLECTION_CERTIFICATION_QUESTIONS = [
  "Common actions available from card/row without opening?",
  "One primary action obvious within ten seconds?",
  "Secondary actions disclosed without a button farm?",
  "Title + preview + status answer what is this without opening?",
  "Counts / filters / labels truthful?",
  "Loading / empty / error all resolve calmly?",
  "Destructive actions confirmed with hospitality language?",
  "Connection-gated / incompatible actions honest?",
  "Pattern matches other Estate libraries?",
  "Passes 128 ADHD / simplicity audit?",
] as const;

export const DEFAULT_LIBRARY_PAGE_SIZE = 12;

export const CREATION_FILTER_OPTIONS: ReadonlyArray<{
  id: LibraryCreationFilterId;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In Progress" },
  { id: "draft", label: "Draft" },
  { id: "completed", label: "Completed" },
  { id: "favorites", label: "Favorites" },
  { id: "archived", label: "Archived" },
];

export const PROJECT_FILTER_OPTIONS: ReadonlyArray<{
  id: LibraryProjectFilterId;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "planning", label: "Planning" },
  { id: "waiting", label: "Waiting" },
  { id: "completed", label: "Completed" },
  { id: "favorites", label: "Favorites" },
  { id: "archived", label: "Archived" },
];

export const CREATION_SORT_OPTIONS: ReadonlyArray<{
  id: LibraryCreationSortId;
  label: string;
}> = [
  { id: "recently_updated", label: "Recently Updated" },
  { id: "recently_created", label: "Recently Created" },
  { id: "name_asc", label: "Name A–Z" },
  { id: "name_desc", label: "Name Z–A" },
  { id: "status", label: "Status" },
  { id: "creation_type", label: "Creation Type" },
];

export const PROJECT_SORT_OPTIONS: ReadonlyArray<{
  id: LibraryProjectSortId;
  label: string;
}> = [
  { id: "recently_updated", label: "Recently Updated" },
  { id: "recently_created", label: "Recently Created" },
  { id: "name_asc", label: "Name A–Z" },
  { id: "name_desc", label: "Name Z–A" },
  { id: "status", label: "Status" },
  { id: "due_date", label: "Due Date" },
];
