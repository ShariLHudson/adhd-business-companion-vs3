import { describe, expect, it } from "vitest";
import {
  filterCollectionItems,
  itemMatchesSearch,
  paginateCollectionItems,
} from "./collectionQuery";
import type { EstateCollectionItem } from "./types";

const SAMPLE: EstateCollectionItem[] = [
  {
    id: "1",
    body: "Grateful for a quiet morning",
    createdAt: "2026-01-01T00:00:00.000Z",
    category: "gratitude",
    favorite: true,
    title: "Morning",
  },
  {
    id: "2",
    body: "Launched the course",
    createdAt: "2026-02-01T00:00:00.000Z",
    category: "milestone",
    favorite: false,
    title: "Course",
  },
];

describe("collectionQuery", () => {
  it("matches search across title and body", () => {
    expect(itemMatchesSearch(SAMPLE[0]!, "quiet")).toBe(true);
    expect(itemMatchesSearch(SAMPLE[1]!, "course")).toBe(true);
    expect(itemMatchesSearch(SAMPLE[0]!, "launch")).toBe(false);
  });

  it("filters favorites and categories", () => {
    const favorites = filterCollectionItems(SAMPLE, {
      search: "",
      favoritesOnly: true,
      category: null,
      visibleCount: 24,
    });
    expect(favorites).toHaveLength(1);
    expect(favorites[0]?.id).toBe("1");

    const milestones = filterCollectionItems(SAMPLE, {
      search: "",
      favoritesOnly: false,
      category: "milestone",
      visibleCount: 24,
    });
    expect(milestones).toHaveLength(1);
    expect(milestones[0]?.id).toBe("2");
  });

  it("paginates for large collections", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      body: `Entry ${i}`,
      createdAt: new Date().toISOString(),
    }));
    const page = paginateCollectionItems(many, 24);
    expect(page.visible).toHaveLength(24);
    expect(page.hasMore).toBe(true);
    expect(page.total).toBe(30);
  });
});
