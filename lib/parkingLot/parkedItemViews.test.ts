import { describe, expect, it } from "vitest";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import {
  buildParkingLotSummary,
  filterParkedItems,
  groupParkedItems,
  paginateItems,
  sortParkedItems,
} from "./parkedItemViews";

function item(
  overrides: Partial<PlanDayItem> & { id: string; title: string },
): PlanDayItem {
  return {
    column: "ready",
    done: false,
    source: "park-it",
    parkStatus: "parked",
    createdAt: "2026-07-01T12:00:00.000Z",
    updatedAt: "2026-07-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("parkedItemViews", () => {
  it("builds a calm summary without implying everything needs attention", () => {
    const items = [
      item({ id: "1", title: "A" }),
      item({
        id: "2",
        title: "B",
        reviewDate: new Date().toISOString().slice(0, 10),
      }),
      item({ id: "3", title: "C", parkStatus: "needs-decision" }),
      item({ id: "4", title: "D", parkStatus: "archived" }),
    ];
    const summary = buildParkingLotSummary(items);
    expect(summary.totalParked).toBe(3);
    expect(summary.attentionToday).toBeGreaterThanOrEqual(1);
    expect(summary.resolvedThisMonth).toBeGreaterThanOrEqual(0);
  });

  it("filters by source and search", () => {
    const items = [
      item({ id: "1", title: "Client call", source: "park-it", notes: "follow up" }),
      item({
        id: "2",
        title: "Newsletter idea",
        source: "clear-my-mind",
      }),
    ];
    const bySource = filterParkedItems(items, {
      statusFilter: "all-parked",
      sourceFilter: "clear-my-mind",
      search: "",
      sort: "newest",
    });
    expect(bySource).toHaveLength(1);
    expect(bySource[0]?.title).toBe("Newsletter idea");

    const bySearch = filterParkedItems(items, {
      statusFilter: "all-parked",
      sourceFilter: "all",
      search: "follow",
      sort: "newest",
    });
    expect(bySearch).toHaveLength(1);
    expect(bySearch[0]?.id).toBe("1");
  });

  it("groups into collapsed sections and paginates large lists", () => {
    const items = Array.from({ length: 60 }, (_, i) =>
      item({
        id: `i-${i}`,
        title: `Thought ${i}`,
        createdAt: new Date(Date.now() - i * 60_000).toISOString(),
      }),
    );
    const sorted = sortParkedItems(items, "newest");
    expect(sorted[0]?.id).toBe("i-0");
    const groups = groupParkedItems(sorted);
    expect(groups.some((g) => g.id === "recently-parked")).toBe(true);
    const page = paginateItems(sorted, 0, 25);
    expect(page.pageItems).toHaveLength(25);
    expect(page.totalPages).toBe(3);
    const page2 = paginateItems(sorted, 2, 25);
    expect(page2.pageItems).toHaveLength(10);
  });

  it("keeps 100 and 300 item filters responsive (smoke)", () => {
    for (const n of [100, 300]) {
      const items = Array.from({ length: n }, (_, i) =>
        item({
          id: `n-${i}`,
          title: `Item ${i}`,
          source: i % 2 === 0 ? "park-it" : "clear-my-mind",
          notes: i % 5 === 0 ? "tag note" : undefined,
        }),
      );
      const start = performance.now();
      const filtered = filterParkedItems(items, {
        statusFilter: "all-parked",
        sourceFilter: "park-it",
        search: "Item 1",
        sort: "newest",
      });
      const groups = groupParkedItems(filtered);
      const page = paginateItems(
        groups.flatMap((g) => g.items),
        0,
        25,
      );
      const elapsed = performance.now() - start;
      expect(page.pageItems.length).toBeLessThanOrEqual(25);
      expect(elapsed).toBeLessThan(250);
    }
  });
});
