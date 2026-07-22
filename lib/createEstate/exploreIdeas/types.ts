/**
 * Spec 133 — Create Explore Ideas discovery models.
 * Member language only — no Blueprint / Work Type jargon.
 */

import type { CreateCatalogItem } from "@/lib/createCatalog";

/** Explained source chips — never bare Spark / Company / Personal. */
export type ExploreIdeaSourceId =
  | "spark_recommended"
  | "company"
  | "personal"
  | "recent";

export type ExploreIdeaSourceChip = {
  id: ExploreIdeaSourceId;
  emoji: string;
  label: string;
  explanation: string;
};

export const EXPLORE_IDEA_SOURCE_CHIPS: readonly ExploreIdeaSourceChip[] = [
  {
    id: "spark_recommended",
    emoji: "⭐",
    label: "Spark Recommended",
    explanation: "Built by Spark Estate",
  },
  {
    id: "company",
    emoji: "🏢",
    label: "Company",
    explanation: "Created by your organization",
  },
  {
    id: "personal",
    emoji: "👤",
    label: "Personal",
    explanation: "Created by you",
  },
  {
    id: "recent",
    emoji: "🕘",
    label: "Recent",
    explanation: "Used recently",
  },
] as const;

/** Visual category cards — outcomes, not framework families. */
export type ExploreIdeaCategoryId =
  | "marketing"
  | "planning"
  | "writing"
  | "business"
  | "events"
  | "learning"
  | "relationships";

export type ExploreIdeaCategoryCard = {
  id: ExploreIdeaCategoryId;
  label: string;
  /** Short calm cue — one job per card. */
  hint: string;
  /** Catalog category ids that feed this card. */
  catalogCategoryIds: readonly string[];
  /** Extra label/match heuristics when catalog id alone is incomplete. */
  matchTerms?: readonly string[];
};

/** Unified result — one list for search and category browse. */
export type ExploreIdeaResult = {
  id: string;
  label: string;
  emoji: string;
  categoryId: string;
  categoryLabel: string;
  source: ExploreIdeaSourceId;
  /** Catalog item used for confirm → create (130/131). */
  catalogItem: CreateCatalogItem;
  matchTerms: readonly string[];
};

export type ExploreIdeaPreview = {
  label: string;
  emoji: string;
  whoFor: string;
  time: string;
  difficulty: string;
  expectedOutcome: string;
  bestWhen: string;
};

export type ExploreIdeaRecommendation = {
  result: ExploreIdeaResult;
  reason: string;
};
