/**
 * Estate Mount Registry™ — single room mount table (Phase 1).
 *
 * Maps canonical `placeId` → AppSection shell → experience tier → component.
 * **Additive** — does not replace CompanionPageClient mounts yet.
 *
 * Journal Gazebo™ is the reference Tier A immersive room.
 *
 * @see docs/estate/SPARK_ESTATE_MASTER_PLAN.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateMenuActionId } from "@/lib/estateMenu/menuConfig";
import type { EstateCollectionRoomId } from "@/lib/estate/collectionFramework/types";
import { resolveEstateLocationShell } from "./directory/shell";
import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";
import { resolvePlaceId } from "./placeIdAliases";

export type EstateExperienceTier =
  | "immersive"
  | "collection"
  | "scene-only"
  | "transition";

/** Component identity — string token; actual imports stay in mount consumers. */
export type EstateMountShellComponent =
  | "JournalGazeboExperience"
  | "EstateCollectionRoomEngine"
  | "EstateCollectionRoomPanel"
  | "profile-estate-overlay"
  | "estate-scene-only"
  | "unmounted";

export type EstateMountSpec = {
  /** Canonical place id — immutable */
  placeId: string;
  officialName: string;
  appSection: AppSection | null;
  experienceTier: EstateExperienceTier;
  shellComponent: EstateMountShellComponent;
  /** When tier is `collection`, the collection framework room id */
  collectionRoomId?: EstateCollectionRoomId;
  menuActionId?: EstateMenuActionId;
  navigable: boolean;
  /** Human notes for architects — not shown to members */
  architectNotes?: string;
};

/**
 * Phase 1 mount table — focus rooms + restorative places + swimming interim.
 * Expand as new rooms ship; do not duplicate CompanionPageClient logic here yet.
 */
export const ESTATE_MOUNT_REGISTRY: readonly EstateMountSpec[] = [
  {
    placeId: "journal",
    officialName: "Journal Gazebo™",
    appSection: "growth-journal",
    experienceTier: "immersive",
    shellComponent: "JournalGazeboExperience",
    collectionRoomId: "journal",
    menuActionId: "journal",
    navigable: true,
    architectNotes:
      "Reference Tier A immersive room. Collection adapter exists; UI bypasses engine.",
  },
  {
    placeId: "greenhouse",
    officialName: "Growth Greenhouse™",
    appSection: "growth-greenhouse",
    experienceTier: "collection",
    shellComponent: "EstateCollectionRoomEngine",
    collectionRoomId: "greenhouse",
    navigable: true,
  },
  {
    placeId: "evidence-vault",
    officialName: "Evidence Vault™",
    appSection: "evidence-bank",
    experienceTier: "collection",
    shellComponent: "EstateCollectionRoomEngine",
    collectionRoomId: "evidence-vault",
    menuActionId: "evidence-vault",
    navigable: true,
  },
  {
    placeId: "library",
    officialName: "Achievement Library™",
    appSection: "growth-library",
    experienceTier: "collection",
    shellComponent: "EstateCollectionRoomEngine",
    collectionRoomId: "achievement-library",
    menuActionId: "portfolio",
    navigable: true,
    architectNotes: "Collection room id achievement-library; canonical placeId library.",
  },
  {
    placeId: "gardens",
    officialName: "Celebration Garden™",
    appSection: "wins-this-week",
    experienceTier: "collection",
    shellComponent: "EstateCollectionRoomEngine",
    collectionRoomId: "celebration-garden",
    navigable: true,
  },
  {
    placeId: "celebration-room",
    officialName: "Celebration Hall™",
    appSection: "growth-reports",
    experienceTier: "collection",
    shellComponent: "EstateCollectionRoomEngine",
    collectionRoomId: "celebration-hall",
    navigable: true,
    architectNotes: "Collection room id celebration-hall; canonical place celebration-room.",
  },
  {
    placeId: "seat-at-pond",
    officialName: "Seat at the Pond™",
    appSection: "focus-audio",
    experienceTier: "scene-only",
    shellComponent: "estate-scene-only",
    navigable: true,
    architectNotes: "Restorative living place — atmosphere while conversation continues.",
  },
  {
    placeId: "tea-room",
    officialName: "Tea Room™",
    appSection: "focus-audio",
    experienceTier: "scene-only",
    shellComponent: "estate-scene-only",
    navigable: true,
    architectNotes: "Restorative; partial / planned asset.",
  },
  {
    placeId: "peaceful-places",
    officialName: "Peaceful Places™",
    appSection: "home",
    experienceTier: "scene-only",
    shellComponent: "estate-scene-only",
    navigable: true,
    architectNotes:
      "Audio / soundscape hub — rank below physical rooms for 'somewhere peaceful' needs.",
  },
  {
    placeId: "reading-nook",
    officialName: "Reading Nook™",
    appSection: "home",
    experienceTier: "scene-only",
    shellComponent: "estate-scene-only",
    navigable: true,
    architectNotes: "Restorative suggestion candidate.",
  },
  {
    placeId: "game-room",
    officialName: "Game Room™",
    appSection: "quick-recharge",
    experienceTier: "collection",
    shellComponent: "EstateCollectionRoomEngine",
    navigable: true,
    architectNotes: "Quick recharge / play collection — not a swimming pool substitute.",
  },
] as const;

const MOUNT_BY_PLACE_ID = new Map<string, EstateMountSpec>();

for (const spec of ESTATE_MOUNT_REGISTRY) {
  if (!MOUNT_BY_PLACE_ID.has(spec.placeId)) {
    MOUNT_BY_PLACE_ID.set(spec.placeId, spec);
  }
}

export function getEstateMountByPlaceId(
  placeId: string,
): EstateMountSpec | undefined {
  const canonical = resolvePlaceId(placeId);
  return MOUNT_BY_PLACE_ID.get(canonical);
}

export function getEstateMountByCollectionRoomId(
  collectionRoomId: EstateCollectionRoomId,
): EstateMountSpec | undefined {
  return ESTATE_MOUNT_REGISTRY.find(
    (spec) => spec.collectionRoomId === collectionRoomId,
  );
}

export function getEstateMountByAppSection(
  section: AppSection,
): EstateMountSpec | undefined {
  return ESTATE_MOUNT_REGISTRY.find((spec) => spec.appSection === section);
}

/** Merge mount table with directory shell — mount wins for tier/component metadata. */
export function resolveEstateMount(placeId: string): EstateMountSpec | null {
  const canonical = resolvePlaceId(placeId);
  const mount = getEstateMountByPlaceId(canonical);
  const shell = resolveEstateLocationShell(canonical);
  const place = getCanonicalEstatePlaceById(canonical);

  if (!mount && !place) return null;

  if (mount) {
    return {
      ...mount,
      appSection: mount.appSection ?? shell.section,
      menuActionId: mount.menuActionId ?? shell.menuActionId,
      navigable: mount.navigable && shell.navigable,
      officialName: place?.officialName ?? mount.officialName,
    };
  }

  return {
    placeId: canonical,
    officialName: place?.officialName ?? canonical,
    appSection: shell.section,
    experienceTier: "scene-only",
    shellComponent: "unmounted",
    menuActionId: shell.menuActionId,
    navigable: shell.navigable,
    architectNotes: "Canonical place without Phase 1 mount row — shell only.",
  };
}

export function listEstateMountsByTier(
  tier: EstateExperienceTier,
): EstateMountSpec[] {
  const seen = new Set<string>();
  const results: EstateMountSpec[] = [];
  for (const spec of ESTATE_MOUNT_REGISTRY) {
    if (spec.experienceTier !== tier) continue;
    if (seen.has(spec.placeId)) continue;
    seen.add(spec.placeId);
    results.push(spec);
  }
  return results;
}
