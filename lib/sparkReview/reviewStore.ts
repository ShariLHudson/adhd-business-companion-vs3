/**
 * Private Spark Card Review store - internal review/QA only.
 *
 * Review status + review notes are persisted in localStorage under a namespace
 * that is completely separate from the member's personal Spark Card note
 * (savedSparksDurable). This data must NEVER surface in the normal member
 * experience. localStorage keeps it on the device across refresh, logout, and
 * reopening the review page (it is not tied to the member auth session).
 */

import type { SparkNoteCatalogEntry } from "@/lib/sparkNote/types";

export type SparkReviewStatus =
  | "needs_review" // default - never marked
  | "approved"
  | "needs_changes"
  | "wrong_category"
  | "wrong_image"
  | "content_issue"
  | "technical_problem";

export const SPARK_REVIEW_STATUSES: readonly SparkReviewStatus[] = [
  "needs_review",
  "approved",
  "needs_changes",
  "wrong_category",
  "wrong_image",
  "content_issue",
  "technical_problem",
];

/** Marks the reviewer can apply (everything except the default "needs_review"). */
export const SPARK_REVIEW_MARKS: readonly {
  status: SparkReviewStatus;
  label: string;
}[] = [
  { status: "approved", label: "Approved" },
  { status: "needs_changes", label: "Needs Changes" },
  { status: "wrong_category", label: "Wrong Category" },
  { status: "wrong_image", label: "Wrong Image" },
  { status: "content_issue", label: "Content Issue" },
  { status: "technical_problem", label: "Technical Problem" },
];

export const SPARK_REVIEW_STATUS_LABEL: Record<SparkReviewStatus, string> = {
  needs_review: "Needs Review",
  approved: "Approved",
  needs_changes: "Needs Changes",
  wrong_category: "Wrong Category",
  wrong_image: "Wrong Image",
  content_issue: "Content Issue",
  technical_problem: "Technical Problem",
};

/** Any marked-for-change status (used by the "Needs Changes" filter + progress). */
export function isNeedsChangesStatus(status: SparkReviewStatus): boolean {
  return (
    status === "needs_changes" ||
    status === "wrong_category" ||
    status === "wrong_image" ||
    status === "content_issue" ||
    status === "technical_problem"
  );
}

export type SparkReviewRecord = {
  status: SparkReviewStatus;
  note: string;
  updatedAtIso: string | null;
};

const DEFAULT_RECORD: SparkReviewRecord = {
  status: "needs_review",
  note: "",
  updatedAtIso: null,
};

const STORAGE_KEY = "spark-card-review:v1";
const RECENT_KEY = "spark-card-review-recent:v1";
const RECENT_LIMIT = 50;

type ReviewMap = Record<string, SparkReviewRecord>;

// In-memory fallback for non-browser (test/SSR) contexts without localStorage.
let memoryReviews: ReviewMap = {};
let memoryRecent: string[] = [];

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readMap(): ReviewMap {
  if (!hasStorage()) return { ...memoryReviews };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: ReviewMap): void {
  if (!hasStorage()) {
    memoryReviews = { ...map };
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / disabled storage */
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getSparkReview(cardId: string): SparkReviewRecord {
  const map = readMap();
  return map[cardId] ?? { ...DEFAULT_RECORD };
}

export function getAllSparkReviews(): ReviewMap {
  return readMap();
}

export function setSparkReviewStatus(
  cardId: string,
  status: SparkReviewStatus,
): SparkReviewRecord {
  const map = readMap();
  const existing = map[cardId] ?? { ...DEFAULT_RECORD };
  const next: SparkReviewRecord = {
    ...existing,
    status,
    updatedAtIso: nowIso(),
  };
  map[cardId] = next;
  writeMap(map);
  return next;
}

export function setSparkReviewNote(
  cardId: string,
  note: string,
): SparkReviewRecord {
  const map = readMap();
  const existing = map[cardId] ?? { ...DEFAULT_RECORD };
  const next: SparkReviewRecord = {
    ...existing,
    note,
    updatedAtIso: nowIso(),
  };
  map[cardId] = next;
  writeMap(map);
  return next;
}

export type SparkReviewProgress = {
  total: number;
  reviewed: number;
  approved: number;
  needsChanges: number;
  needsReview: number;
  byCategoryApproved: Record<string, { approved: number; total: number }>;
};

export function computeSparkReviewProgress(
  cards: readonly SparkNoteCatalogEntry[],
  reviews: ReviewMap = readMap(),
): SparkReviewProgress {
  const byCategoryApproved: Record<string, { approved: number; total: number }> =
    {};
  let reviewed = 0;
  let approved = 0;
  let needsChanges = 0;

  for (const card of cards) {
    const status = reviews[card.id]?.status ?? "needs_review";
    const bucket =
      byCategoryApproved[card.category] ??
      (byCategoryApproved[card.category] = { approved: 0, total: 0 });
    bucket.total += 1;

    if (status !== "needs_review") reviewed += 1;
    if (status === "approved") {
      approved += 1;
      bucket.approved += 1;
    }
    if (isNeedsChangesStatus(status)) needsChanges += 1;
  }

  return {
    total: cards.length,
    reviewed,
    approved,
    needsChanges,
    needsReview: cards.length - reviewed,
    byCategoryApproved,
  };
}

/** Recently-opened review cards, most-recent first (deduped, capped). */
export function recordReviewRecentlyOpened(cardId: string): string[] {
  const current = getReviewRecentlyOpened().filter((id) => id !== cardId);
  const next = [cardId, ...current].slice(0, RECENT_LIMIT);
  if (!hasStorage()) {
    memoryRecent = next;
    return next;
  }
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function getReviewRecentlyOpened(): string[] {
  if (!hasStorage()) return [...memoryRecent];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Test helper - clear all review state (memory + storage). */
export function resetSparkReviewStoreForTests(): void {
  memoryReviews = {};
  memoryRecent = [];
  if (hasStorage()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  }
}
