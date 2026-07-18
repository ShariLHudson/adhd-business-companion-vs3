/**
 * Creation types eligible for the Create picker.
 * Only types with a real in-Create workflow are shown — no dead placeholders.
 * Strategy Library / advice destinations are never Create options (package 180).
 */

import {
  sortedCreateCatalog,
  type CreateCatalogCategory,
  type CreateCatalogItem,
} from "@/lib/createCatalog";
import { resolveCreateLauncherType } from "@/lib/createLauncherTypes";
import { hasLaunchableCreateWorkflow } from "@/lib/createWorkflow";

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

/** Labels that belong to Strategy Library / advice — never Create picker. */
const STRATEGY_LIBRARY_CREATE_ALIASES = new Set(
  [
    "Strategy",
    "Strategy Library",
    "ADHD Entrepreneur Strategy Library",
    "Browse Strategies",
    "Find a Strategy",
    "Build a Strategy",
    "Strategy Guide",
    "Strategy Concierge",
    "Recommended Strategies",
    "Saved Strategies",
    "Business Strategy",
    "Personal Companion Strategy",
  ].map((s) => s.toLowerCase()),
);

export function isStrategyLibraryCreateAlias(label: string): boolean {
  return STRATEGY_LIBRARY_CREATE_ALIASES.has(label.trim().toLowerCase());
}

export function isActiveCreationCatalogItem(item: CreateCatalogItem): boolean {
  // Routed tools open other rooms — not Create workflows.
  if (item.route) return false;
  if (!item.label.trim()) return false;
  if (isStrategyLibraryCreateAlias(item.label)) return false;
  // No complete guided workflow = not visible (package 180 click contract).
  return hasLaunchableCreateWorkflow(item.label);
}

/** Alphabetized categories with only clickable, workflow-backed items. */
export function listActiveCreationPickerCatalog(): CreateCatalogCategory[] {
  return sortedCreateCatalog()
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(isActiveCreationCatalogItem),
    }))
    .filter((cat) => cat.items.length > 0 && cat.id !== "strategies");
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
