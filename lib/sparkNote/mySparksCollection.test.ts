import { describe, expect, it } from "vitest";

import {
  filterMySparksCollection,
  type MySparkSavedItem,
} from "./mySparksCollection";

const items: MySparkSavedItem[] = [
  {
    id: "a",
    category: "history",
    categoryLabel: "History",
    title: "Ancient Libraries",
    shortTitle: "Ancient Libraries",
    teaser: "Where knowledge lived.",
    savedAtIso: "2026-07-01T12:00:00.000Z",
  },
  {
    id: "b",
    category: "creativity",
    categoryLabel: "Creativity",
    title: "Color Theory",
    shortTitle: "Color Theory",
    teaser: "Why certain palettes feel warm.",
    savedAtIso: "2026-06-15T12:00:00.000Z",
  },
];

describe("filterMySparksCollection", () => {
  it("filters by search query and category", () => {
    const filtered = filterMySparksCollection({
      items,
      query: "color",
      category: "Creativity",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("b");
  });

  it("sorts by newest saved date first", () => {
    const filtered = filterMySparksCollection({ items, sort: "newest" });
    expect(filtered[0]?.id).toBe("a");
    expect(filtered[1]?.id).toBe("b");
  });
});
