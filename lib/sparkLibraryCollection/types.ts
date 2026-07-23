/**
 * Global Library & Collection Standard™ (133) — types.
 * @see docs/constitution/133_GLOBAL_LIBRARY_AND_COLLECTION_STANDARD.md
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

/**
 * Actions that must be available from card/row when they do not require
 * the item interior (Standard 133 Rule 1).
 */
export type SparkLibraryCardActionId =
  | "continue"
  | "open"
  | "resume"
  | "rename"
  | "favorite"
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
  | "delete";

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
