/**
 * Estate Navigation Canon — one name, one ID, one route, one owner per room.
 *
 * Authority chain:
 * 1. Identity:  lib/estate/canonicalEstateRegistry.ts (+ canonicalEstatePlaces)
 * 2. Redirects: lib/estate/placeIdAliases.ts (legacy → canonical only)
 * 3. Routing:   lib/estate/estateRoutingRegistry.ts → goToPlace
 * 4. Shell:     lib/estate/directory/shell.ts (placeId → AppSection)
 * 5. Mount:     lib/estate/estateMountRegistry.ts (owner UI)
 *
 * @see docs/estate/ESTATE_NAVIGATION_CLEANUP.md
 */

import type { AppSection } from "@/lib/companionUi";

export type EstateNavigationCanonEntry = {
  placeId: string;
  officialName: string;
  /** Primary AppSection — the only navigable route */
  section: AppSection;
  /** Module that owns the mounted experience */
  owner:
    | "collection"
    | "portfolio"
    | "immersive"
    | "scene"
    | "workspace"
    | "presence";
  /** Legacy ids that redirect here — never shown as primary labels */
  legacyIds: readonly string[];
  /** Deprecated member-facing labels */
  deprecatedNames: readonly string[];
};

/**
 * Critical rooms cleaned in the navigation audit.
 * Full place list remains in canonicalEstateRegistry.
 */
export const ESTATE_NAVIGATION_CANON: readonly EstateNavigationCanonEntry[] = [
  {
    placeId: "evidence-vault",
    officialName: "Evidence Vault",
    section: "evidence-bank",
    owner: "collection",
    legacyIds: ["evidence-bank"],
    deprecatedNames: ["Evidence Bank"],
  },
  {
    placeId: "gardens",
    officialName: "Celebration Garden",
    section: "wins-this-week",
    owner: "collection",
    legacyIds: ["celebration-garden", "wins-this-week"],
    deprecatedNames: ["Wins This Week", "The Gardens"],
  },
  {
    placeId: "estate-gardens",
    officialName: "Estate Gardens",
    section: "home",
    owner: "scene",
    legacyIds: [],
    deprecatedNames: [],
  },
  {
    placeId: "celebration-room",
    officialName: "Celebration Room",
    section: "growth-reports",
    owner: "collection",
    legacyIds: ["celebration-hall", "growth-reports"],
    deprecatedNames: ["Celebration Hall"],
  },
  {
    placeId: "gallery-of-firsts",
    officialName: "Gallery",
    section: "home",
    owner: "presence",
    legacyIds: ["gallery", "the-gallery"],
    deprecatedNames: ["Gallery of Firsts"],
  },
  {
    placeId: "portfolio",
    officialName: "Hall of Accomplishments",
    section: "growth-portfolio",
    owner: "portfolio",
    legacyIds: [
      "growth-portfolio",
      "hall-of-accomplishments",
      "hall-of-achievements",
    ],
    deprecatedNames: ["Portfolio", "Achievement Library"],
  },
  {
    placeId: "library",
    officialName: "Estate Library",
    section: "growth-library",
    owner: "collection",
    legacyIds: ["achievement-library", "growth-library", "estate-library"],
    deprecatedNames: ["The Library", "Library"],
  },
  {
    placeId: "journal",
    officialName: "Journal Gazebo",
    section: "growth-journal",
    owner: "immersive",
    legacyIds: ["growth-journal", "journal-gazebo", "gazebo-journal"],
    deprecatedNames: [],
  },
  {
    placeId: "greenhouse",
    officialName: "Greenhouse",
    section: "growth-greenhouse",
    owner: "collection",
    legacyIds: ["growth-greenhouse"],
    deprecatedNames: ["Growth Greenhouse"],
  },
  {
    placeId: "momentum-institute",
    officialName: "Momentum Institute",
    section: "chamber-of-momentum",
    owner: "workspace",
    legacyIds: ["chamber-of-momentum", "study-hall", "momentum-room"],
    deprecatedNames: [],
  },
] as const;

/** Pairs that must never share a route or be treated as equivalent. */
export const ESTATE_NAVIGATION_NON_EQUIVALENT: readonly (readonly [
  string,
  string,
])[] = [
  ["gallery-of-firsts", "portfolio"],
  ["gallery-of-firsts", "growth-portfolio"],
  ["gallery-of-firsts", "library"],
  ["gardens", "estate-gardens"],
  ["celebration-room", "gallery-of-firsts"],
  ["celebration-room", "portfolio"],
  ["portfolio", "library"],
  ["evidence-vault", "confidence-vault"],
] as const;

export function getNavigationCanon(
  placeId: string,
): EstateNavigationCanonEntry | undefined {
  return ESTATE_NAVIGATION_CANON.find((e) => e.placeId === placeId);
}
