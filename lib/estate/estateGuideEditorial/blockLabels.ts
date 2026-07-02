import type { EstateGuideEditorialBlockType } from "./types";

/** Display labels — coffee-table editorial, not UI chrome. */
export const ESTATE_GUIDE_BLOCK_LABELS: Record<
  EstateGuideEditorialBlockType,
  string
> = {
  "around-the-estate": "Around the Estate",
  "estate-tradition": "Estate Tradition",
  "found-among-archives": "Found Among the Archives",
  "from-sharis-notebook": "From Shari's Notebook",
  "stewards-note": "Steward's Note",
  "curators-note": "Curator's Note",
  "leave-remembering-one-thing": "If You Leave Here Remembering One Thing",
  "estate-saying": "Estate Saying",
};

export function estateGuideBlockLabel(
  type: EstateGuideEditorialBlockType,
): string {
  return ESTATE_GUIDE_BLOCK_LABELS[type];
}
