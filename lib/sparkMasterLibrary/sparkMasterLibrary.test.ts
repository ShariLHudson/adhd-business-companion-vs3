import { describe, expect, it } from "vitest";

import { ALL_MASTER_LIBRARY_ITEMS, composeMasterLibraryView, MASTER_LIBRARY_CATEGORIES } from "./index";

describe("Spark Master Library", () => {
  it("composeMasterLibraryView returns indexed categories", () => {
    const view = composeMasterLibraryView();
    expect(view.headline).toContain("Master Library");
    expect(view.totalItems).toBeGreaterThan(10);
    expect(view.categories.some((c) => c.id === "constitutions")).toBe(true);
  });

  it("MASTER_LIBRARY_ITEMS includes V1 implementation transition", () => {
    const item = ALL_MASTER_LIBRARY_ITEMS.find((i) => i.id === "ml-v1-transition");
    expect(item?.location).toContain("FOUNDER_V1_IMPLEMENTATION_TRANSITION");
  });

  it("MASTER_LIBRARY_CATEGORIES supports future growth with empty categories", () => {
    const emptyCategories = MASTER_LIBRARY_CATEGORIES.filter((c) => c.items.length === 0);
    expect(emptyCategories.some((c) => c.id === "workshops")).toBe(true);
    expect(emptyCategories.some((c) => c.id === "courses")).toBe(true);
  });
});
