/**
 * Estate Memory — AppSection ↔ Registry entry mapping.
 *
 * **Adapter (Phase B):** Section ↔ place links should eventually resolve through
 * `canonicalEstateRegistry.ts` + a single routing layer. Not authoritative for place identity.
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

import type { AppSection } from "@/lib/companionUi";
import { estateRegistryEntryById } from "@/lib/estateIntelligence/estateRegistry";

export const SECTION_TO_ESTATE_ENTRY: Partial<Record<AppSection, string>> = {
  home: "welcome-home",
  "focus-audio": "peaceful-places",
  "momentum-builder": "momentum-builder",
  "grow-momentum-builders": "momentum-builder",
  "brain-dump": "clear-my-mind",
  "grow-observatory": "observatory",
  "growth-library": "library",
  "how-do-i": "library",
  "momentum-institute": "momentum-institute",
  "content-generator": "creative-studio",
  "decision-compass": "decision-compass",
  "growth-journal": "journal",
  "stables": "stables",
};

/** Room ids that share a section with another entry (e.g. living places on home). */
const ENTRY_TO_SECTION_OVERRIDES: Record<string, AppSection> = {
  conservatory: "home",
  stables: "stables",
  "music-room": "focus-audio",
  "coffee-house": "focus-audio",
  /** Orchard redirects to The Swing Beneath the Oak (no dedicated plate yet). */
  "apple-orchard": "home",
  "the-swing-beneath-the-oak": "home",
  "my-estate": "home",
  settings: "settings",
};

const ENTRY_TO_SECTION: Record<string, AppSection> = {
  ...Object.fromEntries(
    Object.entries(SECTION_TO_ESTATE_ENTRY).map(([section, entryId]) => [
      entryId!,
      section as AppSection,
    ]),
  ),
  ...ENTRY_TO_SECTION_OVERRIDES,
} as Record<string, AppSection>;

export function estateEntryIdForSection(
  section: AppSection,
): string | undefined {
  return SECTION_TO_ESTATE_ENTRY[section];
}

export function estateSectionForEntryId(
  entryId: string,
): AppSection | undefined {
  const direct = ENTRY_TO_SECTION[entryId];
  if (direct) return direct;
  const entry = estateRegistryEntryById(entryId);
  return entry?.primarySection;
}

export function estateRoomDisplayName(entryId: string): string {
  return estateRegistryEntryById(entryId)?.name ?? entryId;
}
