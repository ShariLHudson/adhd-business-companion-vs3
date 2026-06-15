import type { TemplateCategory, TemplateItem, TemplateStatus } from "./companionStore";
import { TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_LABEL } from "./companionStore";
import { NO_CATEGORY } from "./categoryRevealUx";
import { sortByDropdownLabel, sortWithPinnedValues } from "./dropdownSort";

export type TemplateStatusFilter = TemplateStatus | "all";

export const TEMPLATE_STATUS_OPTIONS: {
  value: TemplateStatusFilter;
  label: string;
}[] = sortWithPinnedValues(
  [
    { value: "saved", label: "Saved" },
    { value: "draft", label: "Drafts" },
    { value: "archived", label: "Archived" },
    { value: "all", label: "All statuses" },
  ],
  (o) => o.value,
  [],
  (o) => o.label,
);

/** Category dropdown — alphabetical; no default “show everything”. */
export const TEMPLATE_CATEGORY_OPTIONS: {
  value: TemplateCategory;
  label: string;
}[] = sortByDropdownLabel(
  TEMPLATE_CATEGORIES.map((c) => ({
    value: c,
    label: TEMPLATE_CATEGORY_LABEL[c],
  })),
  (o) => o.label,
);

export function filterTemplates(
  items: TemplateItem[],
  opts: {
    query: string;
    status: TemplateStatusFilter;
    category: TemplateCategory | typeof NO_CATEGORY;
  },
): TemplateItem[] {
  const q = opts.query.trim().toLowerCase();
  if (!opts.category && !q) return [];
  return items
    .filter((t) => {
      if (opts.status !== "all" && t.status !== opts.status) return false;
      if (opts.category && t.category !== opts.category) return false;
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
