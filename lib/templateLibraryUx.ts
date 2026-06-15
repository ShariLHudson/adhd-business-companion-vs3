import type { TemplateCategory, TemplateItem, TemplateStatus } from "./companionStore";
import { TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_LABEL } from "./companionStore";
import { sortByDropdownLabel, sortWithPinnedValues } from "./dropdownSort";

export type TemplateStatusFilter = TemplateStatus | "all";

export const TEMPLATE_STATUS_OPTIONS: {
  value: TemplateStatusFilter;
  label: string;
}[] = sortWithPinnedValues(
  [
    { value: "all", label: "All" },
    { value: "saved", label: "Saved" },
    { value: "draft", label: "Drafts" },
    { value: "archived", label: "Archived" },
  ],
  (o) => o.value,
  ["all"],
  (o) => o.label,
);

/** Category dropdown — "All" pinned first, then alphabetical. */
export const TEMPLATE_CATEGORY_OPTIONS: {
  value: TemplateCategory | "all";
  label: string;
}[] = sortWithPinnedValues(
  [
    { value: "all", label: "All Templates" },
    ...TEMPLATE_CATEGORIES.map((c) => ({
      value: c,
      label: TEMPLATE_CATEGORY_LABEL[c],
    })),
  ],
  (o) => o.value,
  ["all"],
  (o) => o.label,
);

export function filterTemplates(
  items: TemplateItem[],
  opts: {
    query: string;
    status: TemplateStatusFilter;
    category: TemplateCategory | "all";
  },
): TemplateItem[] {
  const q = opts.query.trim().toLowerCase();
  return items
    .filter((t) => {
      if (opts.status !== "all" && t.status !== opts.status) return false;
      if (opts.category !== "all" && t.category !== opts.category) return false;
      if (!q) return true;
      const hay = [
        t.title,
        t.subcategory ?? "",
        t.body,
        TEMPLATE_CATEGORY_LABEL[t.category],
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
