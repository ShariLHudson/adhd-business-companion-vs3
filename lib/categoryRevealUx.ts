/**
 * Global UX: category libraries never open with every section expanded.
 * Default = picker only; reveal items after one category is chosen.
 *
 * Collapsed-by-default: accordions, hub sections, filter panels, and nested
 * menus start closed on page load. Deep-link navigation may open one target.
 */

/** Empty value — no category selected yet. */
export const NO_CATEGORY = "" as const;

export type CategoryPickerValue = string | typeof NO_CATEGORY;

export const CATEGORY_PICKER_HINT =
  "Choose one category — we'll show only what fits.";

export const CATEGORY_PICKER_EMPTY_LIST_HINT =
  "Pick a category above to see options.";
