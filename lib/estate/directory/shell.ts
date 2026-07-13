/**
 * Estate Directory — place id → UI shell (AppSection, menu actions).
 *
 * Single source for shell mapping. Legacy adapters read from here.
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateMenuActionId } from "@/lib/estateMenu/menuConfig";
import { estateSectionForEntryId } from "@/lib/estateMemory/estateSectionMap";
import { isProfileEstateRoomId } from "@/lib/growth/profileEstateRooms";
import { ESTATE_ROOM_DIRECT_SECTION_OVERRIDES } from "../estateRoomAliasRegistry";
import { getEstateRoomById } from "../estateRoomRegistry";
import type { EstateLocationShell } from "./types";

/** Canonical place id → primary AppSection for existing shells. */
export const ESTATE_DIRECTORY_PLACE_SECTION: Partial<
  Record<string, AppSection>
> = {
  "welcome-home": "welcome-room",
  conservatory: "home",
  "clear-my-mind": "brain-dump",
  "butterfly-house": "focus",
  "coffee-house": "focus-audio",
  "apple-orchard": "home",
  "the-swing-beneath-the-oak": "home",
  "music-room": "focus-audio",
  "peaceful-places": "home",
  "estate-soundscapes": "focus-audio",
  sunroom: "welcome-room",
  "momentum-institute": "chamber-of-momentum",
  "chamber-of-momentum": "chamber-of-momentum",
  stables: "stables",
  "game-room": "quick-recharge",
  journal: "growth-journal",
  greenhouse: "growth-greenhouse",
  library: "growth-library",
  "personal-library": "growth-library",
  "creative-studio": "content-generator",
  "focus-studio": "visual-focus",
  "cartographers-studio": "visual-focus",
  observatory: "grow-observatory",
  "observatory-day-inside": "grow-observatory",
  "observatory-day-outside": "grow-observatory",
  "observatory-night-outside": "grow-observatory",
  "momentum-builder": "momentum-builder",
  "decision-compass": "decision-compass",
  "evidence-vault": "evidence-bank",
  /** Member-facing Hall of Accomplishments (legacy portfolio section). */
  portfolio: "growth-portfolio",
  "goals-projects": "project-homes",
  "my-estate": "home",
  "growth-profile": "home",
  gardens: "wins-this-week",
  "reading-nook": "home",
  "study-hall": "chamber-of-momentum",
  "momentum-room": "chamber-of-momentum",
  "personal-deck": "home",
  "estate-kitchen": "home",
  "seat-at-pond": "home",
  "garden-bench": "home",
  "back-deck": "home",
  "porch-swing": "home",
  "window-seat": "home",
  "main-hallway": "home",
  "main-staircase": "home",
  "front-drive": "home",
  "garden-path": "home",
  "woodland-path": "home",
  balcony: "home",
  bridge: "home",
  "accomplishments-shelf": "growth-library",
  "celebration-room": "growth-reports",
  "celebration-garden": "wins-this-week",
  "institute-cabinet": "home",
  "seeds-planted": "home",
  "tea-room": "focus-audio",
  "summer-terrace": "home",
  "grand-terrace": "home",
  "lakeside-verandah": "home",
  "lakeside-hammock": "home",
  "reflection-pond": "home",
  "fireside-deck": "home",
  "estate-gardens": "home",
  "dining-room": "home",
  "stairway-reading-nook": "home",
  "spark-estate": "home",
  "discovery-room": "home",
  "art-studio": "content-generator",
  "strategy-studio": "content-generator",
  "round-table": "boardroom",
  /** Gallery — not Hall of Accomplishments. */
  "gallery-of-firsts": "home",
  "destination-gallery": "destination-gallery",
  "writing-room": "home",
  "house-possibility-outside": "home",
  "house-possibility-discovery-chest": "home",
  "house-possibility-reflection-desk": "home",
  "house-possibility-staircase": "home",
  "house-possibility-studio": "home",
  "house-possibility-window-nook": "home",
  "legacy-room-main": "home",
  "reflection-tree-main": "home",
};

export const ESTATE_DIRECTORY_MENU_ACTION: Partial<
  Record<string, EstateMenuActionId>
> = {
  settings: "settings",
  "my-estate": "estate-profile",
  "growth-profile": "growth-profile",
  journal: "journal",
  portfolio: "portfolio",
  "evidence-vault": "evidence-vault",
};

export function resolveEstateLocationShell(placeId: string): EstateLocationShell {
  const override =
    ESTATE_ROOM_DIRECT_SECTION_OVERRIDES[placeId] ??
    ESTATE_DIRECTORY_PLACE_SECTION[placeId];
  if (override) {
    return {
      section: override,
      menuActionId: ESTATE_DIRECTORY_MENU_ACTION[placeId],
      navigable: true,
    };
  }

  const legacyRoom = getEstateRoomById(placeId);
  if (legacyRoom?.route) {
    return {
      section: legacyRoom.route,
      menuActionId:
        legacyRoom.menuActionId ?? ESTATE_DIRECTORY_MENU_ACTION[placeId],
      navigable: true,
    };
  }
  if (legacyRoom?.routes?.[0]) {
    return {
      section: legacyRoom.routes[0],
      menuActionId:
        legacyRoom.menuActionId ?? ESTATE_DIRECTORY_MENU_ACTION[placeId],
      navigable: true,
    };
  }

  const fromMemory = estateSectionForEntryId(placeId);
  if (fromMemory) {
    return {
      section: fromMemory,
      menuActionId: ESTATE_DIRECTORY_MENU_ACTION[placeId],
      navigable: true,
    };
  }

  if (isProfileEstateRoomId(placeId)) {
    return {
      section: "home",
      menuActionId: ESTATE_DIRECTORY_MENU_ACTION[placeId],
      navigable: true,
    };
  }

  const fallback = ESTATE_DIRECTORY_PLACE_SECTION[placeId] ?? "home";
  return {
    section: fallback,
    menuActionId: ESTATE_DIRECTORY_MENU_ACTION[placeId],
    navigable: Boolean(fallback),
  };
}
