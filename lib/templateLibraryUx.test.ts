import { describe, expect, it } from "vitest";
import { NO_CATEGORY } from "./categoryRevealUx";
import {
  filterTemplates,
  sortedTemplateDropdownOptions,
  templateDropdownLabel,
  templatePickerCategoryLabel,
} from "./templateLibraryUx";
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

describe("template picker dropdown", () => {
  it("formats labels as Template — Category", () => {
    expect(templateDropdownLabel(sample[0]!)).toBe("Welcome Email — Email");
    expect(templatePickerCategoryLabel("execution")).toBe(
      "ADHD / Personal Execution",
    );
    expect(templatePickerCategoryLabel("systems")).toBe("Operations");
  });

  it("sorts options alphabetically by full label", () => {
    const items: TemplateItem[] = [
      {
        id: "a",
        title: "Weekly Review",
        body: "",
        category: "execution",
        status: "saved",
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "b",
        title: "Follow-Up Email",
        body: "",
        category: "emails",
        status: "saved",
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "c",
        title: "Launch Checklist",
        body: "",
        category: "strategy",
        status: "saved",
        createdAt: "",
        updatedAt: "",
      },
    ];
    const labels = sortedTemplateDropdownOptions(items).map(templateDropdownLabel);
    expect(labels).toEqual([
      "Follow-Up Email — Email",
      "Launch Checklist — Strategy",
      "Weekly Review — ADHD / Personal Execution",
    ]);
  });
});
