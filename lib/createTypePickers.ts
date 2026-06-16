/**
 * Create flow pickers — item type first, then subtype (both alphabetical + Other).
 */

import { findCatalogItem } from "./createCatalog";
import { sortDropdownLabels } from "./dropdownSort";
import type { AppSection } from "./companionUi";

export const OTHER_OPTION = "Other";

/** Curated primary create types — alphabetical, with Other last. */
const PRIMARY_ITEMS_SORTED = sortDropdownLabels([
  "Blog Post",
  "Business Plan",
  "Client Avatar",
  "Document",
  "Email",
  "Newsletter",
  "Offer",
  "Presentation",
  "Proposal",
  "Sales Page",
  "Social Post",
  "SOP",
  "Training Guide",
  "Video Script",
  "Workshop",
]);

export const PRIMARY_CREATE_ITEMS: string[] = [
  ...PRIMARY_ITEMS_SORTED,
  OTHER_OPTION,
];

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

export function subtypeOptionsForItem(itemLabel: string): string[] {
  const base = SUBTYPES[itemLabel];
  if (!base) {
    return [
      ...sortDropdownLabels(["Detailed", "Quick Start", "Standard"]),
      OTHER_OPTION,
    ];
  }
  return [
    ...sortDropdownLabels(base.filter((s) => s !== OTHER_OPTION)),
    OTHER_OPTION,
  ];
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
