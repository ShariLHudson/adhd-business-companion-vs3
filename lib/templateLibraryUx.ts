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
    .sort((a, b) => {
      const touch = b.updatedAt.localeCompare(a.updatedAt);
      if (touch !== 0) return touch;
      return a.title.localeCompare(b.title);
    });
}

export function groupTemplatesByCategory(
  items: TemplateItem[],
): { category: TemplateCategory; label: string; templates: TemplateItem[] }[] {
  const buckets = new Map<TemplateCategory, TemplateItem[]>();
  for (const item of items) {
    const list = buckets.get(item.category) ?? [];
    list.push(item);
    buckets.set(item.category, list);
  }
  return TEMPLATE_CATEGORY_OPTIONS.map((opt) => ({
    category: opt.value,
    label: `${opt.label} Templates`,
    templates: buckets.get(opt.value) ?? [],
  })).filter((g) => g.templates.length > 0);
}

/** Short category label for the template picker dropdown. */
export function templatePickerCategoryLabel(
  category: TemplateCategory,
): string {
  switch (category) {
    case "offers":
      return "Sales";
    case "emails":
      return "Email";
    case "systems":
      return "Operations";
    case "execution":
      return "ADHD / Personal Execution";
    case "content":
      return "Content";
    case "strategy":
      return "Strategy";
    default:
      return TEMPLATE_CATEGORY_LABEL[category];
  }
}

export function templateDropdownLabel(template: TemplateItem): string {
  return `${template.title} — ${templatePickerCategoryLabel(template.category)}`;
}

/** All templates for the picker — alphabetical by full dropdown label. */
export function sortedTemplateDropdownOptions(
  items: TemplateItem[],
): TemplateItem[] {
  return sortByDropdownLabel(items, templateDropdownLabel);
}

/** Templates shown in the default picker — saved and drafts, not archived. */
export function templatesForDefaultPicker(items: TemplateItem[]): TemplateItem[] {
  return items.filter((t) => t.status !== "archived");
}
