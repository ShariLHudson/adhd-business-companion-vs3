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
    updatedAt: "",
  },
  {
    id: "2",
    title: "Workshop SOP",
    body: "steps",
    category: "systems",
    status: "draft",
    createdAt: "",
    updatedAt: "",
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

  it("returns empty until category or search", () => {
    const out = filterTemplates(sample, {
      query: "",
      status: "all",
      category: NO_CATEGORY,
    });
    expect(out).toHaveLength(0);
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
