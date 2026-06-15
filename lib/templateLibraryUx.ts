import type { TemplateCategory, TemplateItem, TemplateStatus } from "./companionStore";
import { TEMPLATE_CATEGORY_LABEL } from "./companionStore";

export type TemplateStatusFilter = TemplateStatus | "all";

export const TEMPLATE_STATUS_OPTIONS: {
  value: TemplateStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "saved", label: "Saved" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

/** Category dropdown order — search first, filter second. */
export const TEMPLATE_CATEGORY_OPTIONS: {
  value: TemplateCategory | "all";
  label: string;
}[] = [
  { value: "all", label: "All Templates" },
  { value: "execution", label: "ADHD / Personal Execution" },
  { value: "systems", label: "Business Systems" },
  { value: "content", label: "Content" },
  { value: "emails", label: "Emails" },
  { value: "offers", label: "Offers" },
  { value: "strategy", label: "Strategy" },
  { value: "other", label: "Other" },
];

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
