/**
 * Creation types eligible for the Create picker.
 * Only types with a real in-Create workflow are shown — no dead placeholders.
 */

import {
  sortedCreateCatalog,
  type CreateCatalogCategory,
  type CreateCatalogItem,
} from "@/lib/createCatalog";
import { resolveCreateLauncherType } from "@/lib/createLauncherTypes";

export type ActiveCreationType = {
  id: string;
  label: string;
  categoryId: string;
  categoryLabel: string;
  alphabeticalLabel: string;
  workflowId: string;
  supportsPrint: boolean;
  supportsSave: boolean;
  status: "active";
};

function slugId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Printable document-style types (registry-controlled). */
const PRINT_SUPPORT_LABELS = new Set(
  [
    "Email",
    "Newsletter",
    "Blog Post",
    "Lead Magnet",
    "Workbook",
    "Workshop Outline",
    "Presentation",
    "Sales Page",
    "Landing Page",
    "Proposal",
    "Checklist",
    "SOP",
    "Business Plan",
    "One-Pager",
    "Script",
    "Video Script",
  ].map((s) => s.toLowerCase()),
);

export function isActiveCreationCatalogItem(item: CreateCatalogItem): boolean {
  // Routed tools open other rooms — not Create workflows.
  if (item.route) return false;
  return Boolean(item.label.trim());
}

/** Alphabetized categories with only clickable, workflow-backed items. */
export function listActiveCreationPickerCatalog(): CreateCatalogCategory[] {
  return sortedCreateCatalog()
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(isActiveCreationCatalogItem),
    }))
    .filter((cat) => cat.items.length > 0);
}

export function listActiveCreationTypes(): ActiveCreationType[] {
  const rows: ActiveCreationType[] = [];
  for (const cat of listActiveCreationPickerCatalog()) {
    for (const item of cat.items) {
      const { catalogLabel } = resolveCreateLauncherType(item.label);
      rows.push({
        id: slugId(catalogLabel),
        label: catalogLabel,
        categoryId: cat.id,
        categoryLabel: cat.label,
        alphabeticalLabel: catalogLabel,
        workflowId: `create-workflow:${slugId(catalogLabel)}`,
        supportsPrint: PRINT_SUPPORT_LABELS.has(catalogLabel.toLowerCase()),
        supportsSave: true,
        status: "active",
      });
    }
  }
  return rows.sort((a, b) =>
    a.alphabeticalLabel.localeCompare(b.alphabeticalLabel, undefined, {
      sensitivity: "base",
    }),
  );
}

export function resolveActiveCreationLabel(displayLabel: string): string {
  return resolveCreateLauncherType(displayLabel).catalogLabel;
}
