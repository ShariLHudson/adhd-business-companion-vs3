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
  "coffee-house": "focus-audio",
  "apple-orchard": "focus-audio",
  "music-room": "focus-audio",
  "peaceful-places": "home",
  "estate-soundscapes": "focus-audio",
  sunroom: "welcome-room",
  "momentum-institute": "momentum-institute",
  stables: "stables",
  "game-room": "quick-recharge",
  journal: "growth-journal",
  greenhouse: "growth-greenhouse",
  library: "growth-library",
  "creative-studio": "content-generator",
  observatory: "grow-observatory",
  "momentum-builder": "momentum-builder",
  "decision-compass": "decision-compass",
  "evidence-vault": "evidence-bank",
  portfolio: "growth-portfolio",
  "goals-projects": "projects",
  "my-estate": "home",
  "growth-profile": "home",
  gardens: "wins-this-week",
  "reading-nook": "home",
  "celebration-room": "growth-reports",
  "celebration-garden": "wins-this-week",
  "accomplishments-shelf": "growth-library",
  "institute-cabinet": "home",
  "seeds-planted": "home",
  "tea-room": "focus-audio",
  "seat-at-pond": "focus-audio",
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
