/**
 * @vitest-environment jsdom
 * Private review store — status + notes persist (localStorage, survives refresh
 * and logout), stay separate from the member note, and drive progress + recent.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { SPARK_NOTE_CATALOG } from "@/lib/sparkNote/catalog";
import {
  computeSparkReviewProgress,
  getAllSparkReviews,
  getReviewRecentlyOpened,
  getSparkReview,
  recordReviewRecentlyOpened,
  resetSparkReviewStoreForTests,
  setSparkReviewNote,
  setSparkReviewStatus,
} from "./reviewStore";

const A = "SPARK-INV-001";
const B = "SPARK-INV-002";

describe("spark review store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSparkReviewStoreForTests();
  });

  it("defaults every card to needs_review", () => {
    expect(getSparkReview(A).status).toBe("needs_review");
    expect(getSparkReview(A).note).toBe("");
  });

  it("persists a status to localStorage (survives refresh/logout/reopen)", () => {
    setSparkReviewStatus(A, "approved");
    // A fresh read (as after a refresh) still sees it.
    expect(getSparkReview(A).status).toBe("approved");
    expect(getAllSparkReviews()[A]?.status).toBe("approved");
    // It really lives in localStorage under the private review namespace.
    expect(localStorage.getItem("spark-card-review:v1")).toContain("approved");
  });

  it("saves a review note per specific card, isolated from other cards", () => {
    setSparkReviewNote(A, "Category looks wrong.");
    expect(getSparkReview(A).note).toBe("Category looks wrong.");
    expect(getSparkReview(B).note).toBe("");
  });

  it("keeps review notes in a namespace separate from the member note", () => {
    const secret = "internal-review-note-text";
    setSparkReviewNote(A, secret);
    expect(localStorage.getItem("spark-card-review:v1")).toContain(secret);
    // The review note must not leak into any other localStorage key.
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)!;
      if (key === "spark-card-review:v1") continue;
      expect(localStorage.getItem(key) ?? "").not.toContain(secret);
    }
  });

  it("computes progress and per-category approval totals", () => {
    const disc = SPARK_NOTE_CATALOG.filter((c) => c.category === "001");
    expect(disc.length).toBeGreaterThan(0);
    setSparkReviewStatus(disc[0]!.id, "approved");
    setSparkReviewStatus(B, "wrong_image"); // B is 001 too
    const progress = computeSparkReviewProgress(SPARK_NOTE_CATALOG);
    expect(progress.total).toBe(112);
    expect(progress.reviewed).toBeGreaterThanOrEqual(2);
    expect(progress.approved).toBeGreaterThanOrEqual(1);
    expect(progress.needsChanges).toBeGreaterThanOrEqual(1);
    expect(progress.byCategoryApproved["001"]?.total).toBe(disc.length);
    expect(progress.byCategoryApproved["001"]?.approved).toBeGreaterThanOrEqual(1);
  });

  it("tracks recently-opened cards most-recent-first and deduped", () => {
    recordReviewRecentlyOpened(A);
    recordReviewRecentlyOpened(B);
    recordReviewRecentlyOpened(A);
    expect(getReviewRecentlyOpened()).toEqual([A, B]);
  });
});
