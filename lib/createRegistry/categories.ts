/**
 * Nine master Create categories — canonical domain records only.
 * Does not drive Browse UI (still seven categories) in this foundation PR.
 */

import type { CreationRegistryCategory } from "./types";

export const CREATE_REGISTRY_CATEGORY_IDS = [
  "write_communicate",
  "market_grow",
  "sell_convert",
  "work_with_clients",
  "plan_an_experience",
  "build_run_the_business",
  "organize_knowledge",
  "develop_ideas",
  "personal_community",
] as const;

export type CreateRegistryCategoryId =
  (typeof CREATE_REGISTRY_CATEGORY_IDS)[number];

export const CREATE_REGISTRY_CATEGORIES: readonly CreationRegistryCategory[] = [
  {
    id: "write_communicate",
    label: "Write & Communicate",
    hint: "Emails, posts, articles, scripts, and presentations",
    sortOrder: 1,
  },
  {
    id: "market_grow",
    label: "Market & Grow",
    hint: "Plans, campaigns, community, and audience growth",
    sortOrder: 2,
  },
  {
    id: "sell_convert",
    label: "Sell & Convert",
    hint: "Offers, pages, funnels, and conversion assets",
    sortOrder: 3,
  },
  {
    id: "work_with_clients",
    label: "Work With Clients",
    hint: "Onboarding, proposals, and client care",
    sortOrder: 4,
  },
  {
    id: "plan_an_experience",
    label: "Plan an Experience",
    hint: "Events, workshops, courses, and learning journeys",
    sortOrder: 5,
  },
  {
    id: "build_run_the_business",
    label: "Build & Run the Business",
    hint: "Strategy, operations, and business planning",
    sortOrder: 6,
  },
  {
    id: "organize_knowledge",
    label: "Organize Knowledge",
    hint: "Guides, checklists, templates, and reference systems",
    sortOrder: 7,
  },
  {
    id: "develop_ideas",
    label: "Develop Ideas",
    hint: "Exploration, framing, and early thinking",
    sortOrder: 8,
  },
  {
    id: "personal_community",
    label: "Personal & Community",
    hint: "Personal creations and community life",
    sortOrder: 9,
  },
] as const;

const BY_ID = new Map(
  CREATE_REGISTRY_CATEGORIES.map((c) => [c.id, c] as const),
);

export function getCreateRegistryCategory(
  id: string,
): CreationRegistryCategory | undefined {
  return BY_ID.get(id);
}

export function isCreateRegistryCategoryId(
  id: string,
): id is CreateRegistryCategoryId {
  return BY_ID.has(id);
}
