/**
 * Spec 133 — One search → one result list (Search OR Category).
 */

import { listActiveCreationPickerCatalog } from "@/lib/createEstate/activeCreationTypes";
import type { CreateSuggestionContext } from "@/lib/createEstate/contextAwareSuggestions";
import { filterCatalogByWorkContext } from "@/lib/createEstate/contextAwareSuggestions";
import { exploreIdeaCategoryById } from "./categories";
import type {
  ExploreIdeaCategoryId,
  ExploreIdeaResult,
  ExploreIdeaSourceId,
} from "./types";

function slugId(label: string, categoryId: string): string {
  return `${categoryId}:${label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function defaultSourceForItem(label: string): ExploreIdeaSourceId {
  // Catalog ideas are Spark Estate structures until personal/company libraries land.
  void label;
  return "spark_recommended";
}

/** Flatten active catalog into the unified Explore Ideas result model. */
export function listExploreIdeaResults(
  suggestionContext?: CreateSuggestionContext | null,
): ExploreIdeaResult[] {
  const base = listActiveCreationPickerCatalog();
  const catalog = suggestionContext
    ? filterCatalogByWorkContext(base, suggestionContext)
    : base;

  const out: ExploreIdeaResult[] = [];
  for (const cat of catalog) {
    for (const item of cat.items) {
      out.push({
        id: slugId(item.label, cat.id),
        label: item.label,
        emoji: item.emoji,
        categoryId: cat.id,
        categoryLabel: cat.label,
        source: defaultSourceForItem(item.label),
        catalogItem: item,
        matchTerms: [
          item.label.toLowerCase(),
          ...(item.matchTerms ?? []).map((t) => t.toLowerCase()),
          cat.label.toLowerCase(),
        ],
      });
    }
  }
  return out;
}

export type ExploreIdeasQuery = {
  search?: string;
  categoryId?: ExploreIdeaCategoryId | null;
  source?: ExploreIdeaSourceId | "all";
  suggestionContext?: CreateSuggestionContext | null;
  /** Labels recently used — marked / filterable as Recent. */
  recentLabels?: readonly string[];
};

function markRecent(
  results: ExploreIdeaResult[],
  recentLabels: readonly string[],
): ExploreIdeaResult[] {
  if (recentLabels.length === 0) return results;
  const recent = new Set(recentLabels.map((l) => l.trim().toLowerCase()));
  return results.map((r) =>
    recent.has(r.label.toLowerCase()) ? { ...r, source: "recent" as const } : r,
  );
}

/**
 * Unified query — search OR category feeds the same list.
 * Source chip filters the list; never a second browse mental model.
 */
export function queryExploreIdeas(query: ExploreIdeasQuery): ExploreIdeaResult[] {
  const {
    search = "",
    categoryId = null,
    source = "all",
    suggestionContext = null,
    recentLabels = [],
  } = query;

  let results = markRecent(
    listExploreIdeaResults(suggestionContext),
    recentLabels,
  );

  const q = search.trim().toLowerCase();
  if (q) {
    results = results.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.matchTerms.some((t) => t.includes(q)) ||
        r.categoryLabel.toLowerCase().includes(q),
    );
  } else if (categoryId) {
    const card = exploreIdeaCategoryById(categoryId);
    if (card) {
      const catIds = new Set(card.catalogCategoryIds.map((id) => id.toLowerCase()));
      const terms = (card.matchTerms ?? []).map((t) => t.toLowerCase());
      results = results.filter((r) => {
        if (catIds.has(r.categoryId.toLowerCase())) {
          // Events / Learning share catalog buckets — tighten with match terms when present.
          if (
            (categoryId === "events" || categoryId === "learning") &&
            terms.length > 0
          ) {
            return terms.some(
              (t) =>
                r.label.toLowerCase().includes(t) ||
                r.matchTerms.some((m) => m.includes(t)),
            );
          }
          if (categoryId === "writing") {
            // Prefer writing-shaped items from shared content/documents buckets.
            return terms.some(
              (t) =>
                r.label.toLowerCase().includes(t) ||
                r.matchTerms.some((m) => m.includes(t)),
            );
          }
          return true;
        }
        return terms.some(
          (t) =>
            r.label.toLowerCase().includes(t) ||
            r.matchTerms.some((m) => m.includes(t)),
        );
      });
    }
  }

  if (source !== "all") {
    results = results.filter((r) => r.source === source);
  }

  return results.sort((a, b) => a.label.localeCompare(b.label));
}
