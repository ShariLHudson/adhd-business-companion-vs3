import { describe, expect, it } from "vitest";
import { SPARK_NOTE_CATALOG } from "@/lib/sparkNote/catalog";
import { sparkEditionForCategory } from "@/lib/sparkNote/sparkEditions";
import { resolveTodaysSpark } from "@/lib/sparkNote/sparkCardCollectibleDisplay";
import { buildReviewList, reviewAdjacent } from "./reviewList";
import type { SparkReviewRecord } from "./reviewStore";

const NEEDS_REVIEW: SparkReviewRecord = {
  status: "needs_review",
  note: "",
  updatedAtIso: null,
};
const lookup = () => NEEDS_REVIEW;

const NUMBERED = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012"];

describe("spark review — runtime data validation", () => {
  it("shows exactly 112 distinct runtime cards", () => {
    const list = buildReviewList(SPARK_NOTE_CATALOG, {}, lookup);
    expect(list.length).toBe(112);
    expect(new Set(list.map((c) => c.id)).size).toBe(112);
  });

  it("every card uses a numbered category 001–012", () => {
    for (const card of SPARK_NOTE_CATALOG) {
      expect(NUMBERED).toContain(card.category);
    }
  });

  it("every category has a registered edition image", () => {
    for (const card of SPARK_NOTE_CATALOG) {
      expect(sparkEditionForCategory(card.category)?.imageSrc).toMatch(
        /^\/spark-card-images\/[a-z]+\.png$/,
      );
    }
  });

  it("every card contains Story, Spark, and Action content", () => {
    for (const card of SPARK_NOTE_CATALOG) {
      expect(card.whatHappened.trim().length).toBeGreaterThan(0); // Story
      expect(resolveTodaysSpark(card).trim().length).toBeGreaterThan(0); // Spark
      expect(card.sparkApplication.trim().length).toBeGreaterThan(0); // Action
    }
  });
});

describe("spark review — filters, sort, search", () => {
  it("category filters return only that category", () => {
    for (const code of NUMBERED) {
      const list = buildReviewList(SPARK_NOTE_CATALOG, { filter: code as never }, lookup);
      expect(list.length).toBeGreaterThan(0);
      expect(list.every((c) => c.category === code)).toBe(true);
    }
  });

  it("type filters return only that spark type", () => {
    for (const type of ["quick", "story", "deep"] as const) {
      const list = buildReviewList(SPARK_NOTE_CATALOG, { filter: type }, lookup);
      expect(list.every((c) => c.sparkType === type)).toBe(true);
    }
  });

  it("status filters use the review lookup", () => {
    const approvedId = SPARK_NOTE_CATALOG[3]!.id;
    const review = (id: string): SparkReviewRecord =>
      id === approvedId
        ? { status: "approved", note: "", updatedAtIso: null }
        : NEEDS_REVIEW;
    const approved = buildReviewList(SPARK_NOTE_CATALOG, { filter: "approved" }, review);
    expect(approved.map((c) => c.id)).toEqual([approvedId]);
    const needsReview = buildReviewList(SPARK_NOTE_CATALOG, { filter: "needs_review" }, review);
    expect(needsReview.length).toBe(111);
  });

  it("sorts by id, title, and category", () => {
    const byId = buildReviewList(SPARK_NOTE_CATALOG, { sort: "id" }, lookup);
    expect(byId.map((c) => c.id)).toEqual([...byId.map((c) => c.id)].sort());
    const byTitle = buildReviewList(SPARK_NOTE_CATALOG, { sort: "title" }, lookup);
    for (let i = 1; i < byTitle.length; i += 1) {
      expect(byTitle[i - 1]!.title.localeCompare(byTitle[i]!.title)).toBeLessThanOrEqual(0);
    }
    const byCat = buildReviewList(SPARK_NOTE_CATALOG, { sort: "category" }, lookup);
    for (let i = 1; i < byCat.length; i += 1) {
      expect(byCat[i - 1]!.category.localeCompare(byCat[i]!.category)).toBeLessThanOrEqual(0);
    }
  });

  it("finds every card through alphabetical/title search", () => {
    for (const card of SPARK_NOTE_CATALOG) {
      const byTitle = buildReviewList(SPARK_NOTE_CATALOG, { search: card.title }, lookup);
      expect(byTitle.some((c) => c.id === card.id)).toBe(true);
      const byId = buildReviewList(SPARK_NOTE_CATALOG, { search: card.id }, lookup);
      expect(byId.some((c) => c.id === card.id)).toBe(true);
    }
  });
});

describe("spark review — previous/next adjacency", () => {
  it("Previous and Next resolve the correct adjacent cards", () => {
    const list = buildReviewList(SPARK_NOTE_CATALOG, { sort: "id" }, lookup);
    const mid = reviewAdjacent(list, list[5]!.id);
    expect(mid.prevId).toBe(list[4]!.id);
    expect(mid.nextId).toBe(list[6]!.id);
    expect(mid.index).toBe(5);

    const first = reviewAdjacent(list, list[0]!.id);
    expect(first.prevId).toBeNull();
    expect(first.nextId).toBe(list[1]!.id);

    const last = reviewAdjacent(list, list[list.length - 1]!.id);
    expect(last.nextId).toBeNull();
    expect(last.prevId).toBe(list[list.length - 2]!.id);
  });
});
