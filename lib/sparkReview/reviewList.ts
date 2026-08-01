/**
 * Pure review-list logic — filtering, sorting, alphabetical search, and
 * previous/next adjacency. Shared by the review UI and its validation tests so
 * behavior is verified independently of rendering.
 */
import type { SparkNoteCatalogEntry, SparkNoteCategory } from "@/lib/sparkNote/types";
import {
  isNeedsChangesStatus,
  SPARK_REVIEW_STATUSES,
  type SparkReviewRecord,
  type SparkReviewStatus,
} from "./reviewStore";

export type SparkReviewFilter =
  | "all"
  | SparkNoteCategory
  | "quick"
  | "story"
  | "deep"
  | "approved"
  | "needs_review"
  | "needs_changes";

export type SparkReviewSort = "id" | "title" | "category" | "status";

export type ReviewLookup = (cardId: string) => SparkReviewRecord;

const NUMBERED = new Set<string>([
  "001", "002", "003", "004", "005", "006",
  "007", "008", "009", "010", "011", "012",
]);

function statusOf(card: SparkNoteCatalogEntry, review: ReviewLookup): SparkReviewStatus {
  return review(card.id).status;
}

function matchesFilter(
  card: SparkNoteCatalogEntry,
  filter: SparkReviewFilter,
  review: ReviewLookup,
): boolean {
  if (filter === "all") return true;
  if (NUMBERED.has(filter)) return card.category === filter;
  if (filter === "quick" || filter === "story" || filter === "deep") {
    return card.sparkType === filter;
  }
  const status = statusOf(card, review);
  if (filter === "approved") return status === "approved";
  if (filter === "needs_review") return status === "needs_review";
  if (filter === "needs_changes") return isNeedsChangesStatus(status);
  return true;
}

/** Alphabetical / text search over title + id (case-insensitive substring). */
function matchesSearch(card: SparkNoteCatalogEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    card.title.toLowerCase().includes(q) ||
    card.id.toLowerCase().includes(q) ||
    (card.shortTitle?.toLowerCase().includes(q) ?? false)
  );
}

function sortComparator(
  sort: SparkReviewSort,
  review: ReviewLookup,
): (a: SparkNoteCatalogEntry, b: SparkNoteCatalogEntry) => number {
  return (a, b) => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
      case "category":
        return a.category.localeCompare(b.category) || a.id.localeCompare(b.id);
      case "status": {
        const ra = SPARK_REVIEW_STATUSES.indexOf(statusOf(a, review));
        const rb = SPARK_REVIEW_STATUSES.indexOf(statusOf(b, review));
        return ra - rb || a.id.localeCompare(b.id);
      }
      case "id":
      default:
        return a.id.localeCompare(b.id);
    }
  };
}

export function buildReviewList(
  cards: readonly SparkNoteCatalogEntry[],
  options: {
    filter?: SparkReviewFilter;
    sort?: SparkReviewSort;
    search?: string;
  },
  review: ReviewLookup,
): SparkNoteCatalogEntry[] {
  const filter = options.filter ?? "all";
  const sort = options.sort ?? "id";
  const search = options.search ?? "";
  return cards
    .filter((card) => matchesFilter(card, filter, review) && matchesSearch(card, search))
    .sort(sortComparator(sort, review));
}

/** Previous/next card ids relative to `currentId` within a rendered list. */
export function reviewAdjacent(
  list: readonly SparkNoteCatalogEntry[],
  currentId: string,
): { prevId: string | null; nextId: string | null; index: number } {
  const index = list.findIndex((c) => c.id === currentId);
  if (index < 0) return { prevId: null, nextId: null, index: -1 };
  return {
    index,
    prevId: index > 0 ? list[index - 1]!.id : null,
    nextId: index < list.length - 1 ? list[index + 1]!.id : null,
  };
}
