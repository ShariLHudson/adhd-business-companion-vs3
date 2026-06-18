import { describe, expect, it } from "vitest";
import { NO_CATEGORY } from "./categoryRevealUx";
import { filterTemplates } from "./templateLibraryUx";
import type { TemplateItem } from "./companionStore";

const sample: TemplateItem[] = [
  {
    id: "1",
    title: "Welcome Email",
    body: "Hello",
    category: "emails",
    status: "saved",
    createdAt: "",
    updatedAt: "2026-01-02",
  },
  {
    id: "2",
    title: "Workshop SOP",
    body: "steps",
    category: "systems",
    status: "draft",
    createdAt: "",
    updatedAt: "2026-06-01",
  },
];

describe("filterTemplates", () => {
  it("filters by search query across categories", () => {
    const out = filterTemplates(sample, {
      query: "welcome",
      status: "all",
      category: NO_CATEGORY,
    });
    expect(out).toHaveLength(1);
    expect(out[0]?.title).toBe("Welcome Email");
  });

  it("shows all templates when no category or search filter", () => {
    const out = filterTemplates(sample, {
      query: "",
      status: "all",
      category: NO_CATEGORY,
    });
    expect(out).toHaveLength(2);
  });

  it("sorts by updatedAt descending when no search", () => {
    const out = filterTemplates(sample, {
      query: "",
      status: "all",
      category: NO_CATEGORY,
    });
    expect(out[0]?.title).toBe("Workshop SOP");
    expect(out[1]?.title).toBe("Welcome Email");
  });

  it("filters by category without accordions", () => {
    const out = filterTemplates(sample, {
      query: "",
      status: "all",
      category: "emails",
    });
    expect(out).toHaveLength(1);
  });
});
