/**
 * 080 — Work Type + Full Workshop Map configuration.
 * Behavior (open, save, complete, reopen) lives in shared Create runtime.
 * Work types only supply structure.
 */

export type WorkTypeId = string;

export type WorkTypeMapSectionDef = {
  id: string;
  title: string;
  optional?: boolean;
};

export type WorkTypeSchema = {
  workTypeId: WorkTypeId;
  /** Member-facing family name (e.g. Event Plan, SOP). */
  displayName: string;
  /** Ordered Full Workshop Map — 077/080. */
  sections: readonly WorkTypeMapSectionDef[];
  /** Sections emphasized at start; full map remains available. */
  defaultFocusSectionIds?: readonly string[];
};

export type WorkshopMapSectionState = {
  id: string;
  title: string;
  content: string;
  status?: string;
};
