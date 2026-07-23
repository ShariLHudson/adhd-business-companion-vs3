/**
 * Master subcategories referenced by registry seeds (and stubs for structure).
 * Expand as more creation types migrate into the registry.
 */

import type { CreationRegistrySubcategory } from "./types";

/** Subcategories needed for the four guided seeds + stable IDs for later. */
export const CREATE_REGISTRY_SUBCATEGORIES: readonly CreationRegistrySubcategory[] =
  [
    // Market & Grow
    {
      id: "marketing_planning",
      categoryId: "market_grow",
      label: "Marketing Planning",
      sortOrder: 1,
    },
    {
      id: "audience_community_building",
      categoryId: "market_grow",
      label: "Audience and Community Building",
      sortOrder: 3,
    },
    // Plan an Experience
    {
      id: "events",
      categoryId: "plan_an_experience",
      label: "Events",
      sortOrder: 1,
    },
    // Build & Run the Business
    {
      id: "strategy_and_direction",
      categoryId: "build_run_the_business",
      label: "Strategy and Direction",
      sortOrder: 1,
    },
    // Dual-read only — provisional adapter records (not Browse UI)
    {
      id: "unmigrated_legacy",
      categoryId: "develop_ideas",
      label: "Unmigrated Legacy",
      sortOrder: 99,
    },
  ] as const;

const BY_ID = new Map(
  CREATE_REGISTRY_SUBCATEGORIES.map((s) => [s.id, s] as const),
);

export function getCreateRegistrySubcategory(
  id: string,
): CreationRegistrySubcategory | undefined {
  return BY_ID.get(id);
}

export function isCreateRegistrySubcategoryId(id: string): boolean {
  return BY_ID.has(id);
}

export function subcategoriesForCategory(
  categoryId: string,
): CreationRegistrySubcategory[] {
  return CREATE_REGISTRY_SUBCATEGORIES.filter((s) => s.categoryId === categoryId);
}
