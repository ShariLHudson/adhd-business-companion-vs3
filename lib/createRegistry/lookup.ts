/**
 * Registry lookup helpers — Category → Subcategories → Builds.
 *
 * Phase 1 prep only (2026-08-05). Not wired to any live UI yet — these exist
 * so a future Browse Categories / Start With Guidance migration has a stable,
 * tested surface to call instead of reaching into the seed files directly.
 */

import { subcategoriesForCategory } from "./subcategories";
import type { CreationRegistryItem, CreationRegistrySubcategory } from "./types";

/**
 * Builds (items) directly under a category, across the given item list.
 * Defaults to the full registry (guided + V1 priority seeds) via the caller
 * passing listCreationRegistryItems() — kept explicit here (no import of
 * index.ts) to avoid a circular import, since index.ts re-exports this file.
 */
export function itemsForCategory(
  categoryId: string,
  items: readonly CreationRegistryItem[],
): CreationRegistryItem[] {
  return items.filter((item) => item.categoryId === categoryId);
}

/** Builds (items) directly under a subcategory, across the given item list. */
export function itemsForSubcategory(
  subcategoryId: string,
  items: readonly CreationRegistryItem[],
): CreationRegistryItem[] {
  return items.filter((item) => item.subcategoryId === subcategoryId);
}

/**
 * Category → Subcategory → Build tree for a single category, across the
 * given item list. Matches the approved max browse depth exactly.
 */
export type CategoryBuildTree = {
  categoryId: string;
  subcategories: Array<{
    subcategory: CreationRegistrySubcategory;
    items: CreationRegistryItem[];
  }>;
};

export function buildTreeForCategory(
  categoryId: string,
  items: readonly CreationRegistryItem[],
): CategoryBuildTree {
  const subs = subcategoriesForCategory(categoryId);
  return {
    categoryId,
    subcategories: subs.map((subcategory) => ({
      subcategory,
      items: itemsForSubcategory(subcategory.id, items),
    })),
  };
}
