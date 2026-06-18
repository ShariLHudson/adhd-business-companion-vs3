/**
 * Create flow pickers — item type first, then subtype (both alphabetical + Other).
 */

import { findCatalogItem } from "./createCatalog";
import { sortDropdownLabels } from "./dropdownSort";
import type { AppSection } from "./companionUi";

export const OTHER_OPTION = "Other";

/** Internal generation depth — never shown in Create UI. */
export const INTERNAL_GENERATION_DEPTH_OPTIONS = [
  "Detailed",
  "Quick Start",
  "Standard",
] as const;

export const DEFAULT_INTERNAL_GENERATION_DEPTH = "Standard";

const UNRESOLVED_CREATE_TYPES = new Set([
  "",
  "content",
  "general",
  "new piece",
  "draft",
  "untitled",
]);

/** Catalog label → user-facing label in workspace and chat. */
export const USER_FACING_CREATE_LABELS: Record<string, string> = {
  "Social Post": "Social Media Post",
  "Training Guide": "Training",
  "Sales Funnel": "Funnel",
  "Lead Magnet": "Lead Magnet",
  "Landing Page": "Landing Page",
};

/** Curated primary create outcomes — user-facing order, Other last. */
export const PRIMARY_CREATE_ITEMS: string[] = [
  "Social Post",
  "Email",
  "Newsletter",
  "Workshop",
  "SOP",
  "Sales Funnel",
  "Marketing Plan",
  "Lead Magnet",
  "Landing Page",
  OTHER_OPTION,
];

export function isUnresolvedCreateType(type: string | null | undefined): boolean {
  return UNRESOLVED_CREATE_TYPES.has((type ?? "").trim().toLowerCase());
}

export function isInternalGenerationDepth(label: string | null | undefined): boolean {
  if (!label?.trim()) return false;
  return (
    INTERNAL_GENERATION_DEPTH_OPTIONS.includes(
      label as (typeof INTERNAL_GENERATION_DEPTH_OPTIONS)[number],
    ) || label.trim().toLowerCase() === "general"
  );
}

export function userFacingCreateTypeLabel(
  catalogLabel: string | null | undefined,
): string | null {
  const raw = catalogLabel?.trim();
  if (!raw || isUnresolvedCreateType(raw)) return null;
  return USER_FACING_CREATE_LABELS[raw] ?? raw;
}

export function catalogTypeFromUserPhrase(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  for (const [catalog, label] of Object.entries(USER_FACING_CREATE_LABELS)) {
    if (t === label.toLowerCase()) return catalog;
  }
  return null;
}

const SUBTYPES: Record<string, string[]> = {
  "Blog Post": [
    "How-To",
    "Listicle",
    "Personal Story",
    "Thought Leadership",
    "Tutorial",
    OTHER_OPTION,
  ],
  "Business Plan": [
    "Lean",
    "One-Page",
    "Startup",
    "Traditional",
    OTHER_OPTION,
  ],
  Document: ["General", "Policy", "Report", "Template", OTHER_OPTION],
  Email: [
    "Follow-Up",
    "Newsletter",
    "Outreach",
    "Sales",
    "Welcome",
    OTHER_OPTION,
  ],
  Newsletter: [
    "Announcement",
    "Educational",
    "Monthly Update",
    "Nurture",
    "Promotional",
    "Weekly Tips",
    OTHER_OPTION,
  ],
  Offer: [
    "Bonus Stack",
    "Core Offer",
    "Downsell",
    "Tripwire",
    "Upsell",
    OTHER_OPTION,
  ],
  Presentation: [
    "Client Pitch",
    "Keynote",
    "Sales Deck",
    "Training",
    "Webinar",
    OTHER_OPTION,
  ],
  Proposal: [
    "Custom Project",
    "Retainer",
    "Scope of Work",
    "Template",
    OTHER_OPTION,
  ],
  "Sales Page": [
    "Long-Form",
    "Short-Form",
    "VSL Script",
    "Webinar Registration",
    OTHER_OPTION,
  ],
  "Social Post": [
    "Carousel",
    "Educational",
    "Engagement",
    "Promotional",
    "Story",
    OTHER_OPTION,
  ],
  SOP: [
    "Admin",
    "Client Onboarding",
    "Content Process",
    "Customer Support",
    "Delivery Process",
    "Marketing",
    "Sales",
    OTHER_OPTION,
  ],
  "Training Guide": [
    "Client Training",
    "Internal Team Training",
    "New User Guide",
    "Process Training",
    "Product Training",
    "Step-by-Step Tutorial",
    OTHER_OPTION,
  ],
  "Video Script": [
    "Educational",
    "Promo",
    "Tutorial",
    "Vlog",
    "Webinar",
    OTHER_OPTION,
  ],
  Workshop: [
    "Full-Day",
    "Half-Day",
    "Masterclass",
    "Mini Workshop",
    "Webinar",
    OTHER_OPTION,
  ],
};

export function userFacingSubtypeOptionsForItem(_itemLabel: string): string[] {
  return [];
}

export function subtypeOptionsForItem(itemLabel: string): string[] {
  const base = SUBTYPES[itemLabel];
  if (!base) {
    return [...INTERNAL_GENERATION_DEPTH_OPTIONS];
  }
  return sortDropdownLabels(base.filter((s) => s !== OTHER_OPTION));
}

export function defaultInternalSubtypeForItem(itemLabel: string): string | null {
  const options = subtypeOptionsForItem(itemLabel);
  if (!options.length) return DEFAULT_INTERNAL_GENERATION_DEPTH;
  return options.includes(DEFAULT_INTERNAL_GENERATION_DEPTH)
    ? DEFAULT_INTERNAL_GENERATION_DEPTH
    : options[0] ?? null;
}

export function subtypePickerLabel(itemLabel: string): string {
  return `What kind of ${itemLabel.toLowerCase()}?`;
}

export function resolveCreateItemRoute(itemLabel: string): AppSection | undefined {
  return findCatalogItem(itemLabel)?.route;
}

export function isPrimaryCreateItem(label: string): boolean {
  return PRIMARY_CREATE_ITEMS.includes(label) || label === OTHER_OPTION;
}

/** Effective type label for generation — custom Other text or catalog label. */
export function effectiveCreateTypeLabel(
  selectedTypeLabel: string | null,
  customTypeLabel: string | null,
): string {
  if (selectedTypeLabel === OTHER_OPTION && customTypeLabel?.trim()) {
    return customTypeLabel.trim();
  }
  return selectedTypeLabel?.trim() ?? "";
}

/** Human-readable subtype for briefs and summaries. */
export function effectiveSubtypeLabel(
  selectedSubtype: string | null,
  customSubtype: string | null,
): string | null {
  if (!selectedSubtype) return null;
  if (selectedSubtype === OTHER_OPTION && customSubtype?.trim()) {
    return customSubtype.trim();
  }
  if (selectedSubtype === OTHER_OPTION) return null;
  return selectedSubtype;
}

/** Subtype line in Create UI — hides auto-assigned internal depths. */
export function userFacingSubtypeLabel(
  selectedSubtype: string | null,
  customSubtype: string | null,
  opts?: { userSelected?: boolean },
): string | null {
  if (!opts?.userSelected) return null;
  const raw = effectiveSubtypeLabel(selectedSubtype, customSubtype);
  if (!raw || isInternalGenerationDepth(raw)) return null;
  return raw;
}
