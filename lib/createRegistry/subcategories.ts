/**
 * Master subcategories referenced by registry seeds (and stubs for structure).
 * Expand as more creation types migrate into the registry.
 */

import type { CreationRegistrySubcategory } from "./types";

/** Subcategories needed for the four guided seeds + stable IDs for later. */
export const CREATE_REGISTRY_SUBCATEGORIES: readonly CreationRegistrySubcategory[] =
  [
    // Write & Communicate
    {
      id: "everyday_business_communication",
      categoryId: "write_communicate",
      label: "Everyday Business Communication",
      sortOrder: 1,
    },
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
    // Sell & Convert
    {
      id: "offers_and_packaging",
      categoryId: "sell_convert",
      label: "Offers and Packaging",
      sortOrder: 1,
    },
    {
      id: "sales_materials",
      categoryId: "sell_convert",
      label: "Sales Materials",
      sortOrder: 2,
    },
    // Work With Clients
    {
      id: "beginning_the_relationship",
      categoryId: "work_with_clients",
      label: "Beginning the Relationship",
      sortOrder: 1,
    },
    // Plan an Experience
    {
      id: "events",
      categoryId: "plan_an_experience",
      label: "Events",
      sortOrder: 1,
    },
    {
      id: "workshops_learning",
      categoryId: "plan_an_experience",
      label: "Workshops and Learning",
      sortOrder: 2,
    },
    // Build & Run the Business
    {
      id: "strategy_and_direction",
      categoryId: "build_run_the_business",
      label: "Strategy and Direction",
      sortOrder: 1,
    },
    {
      id: "operations_and_systems",
      categoryId: "build_run_the_business",
      label: "Operations and Systems",
      sortOrder: 2,
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
