/**
 * Estate Intelligence™ — direct room command resolution.
 * Exact room name overrides feeling/activity routing.
 *
 * **Phase C:** Canonical resolution via `resolveEstatePlace` + `goToPlace` wins over
 * legacy alias/registry matching.
 *
 * @see lib/estate/goToPlace.ts
 * @see lib/estate/resolveEstatePlace.ts
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateMenuActionId } from "@/lib/estateMenu/menuConfig";
import {
  ESTATE_ROOM_DIRECT_SECTION_OVERRIDES,
  extractRoomPhraseFromNavigation,
  getEstateRoomAliasEntry,
  resolveEstateRoomAliasBounded,
  resolveEstateRoomAliasExact,
} from "./estateRoomAliasRegistry";
import { goToPlace } from "./goToPlace";
import {
  resolveEstatePlace,
  shouldNavigateFromResolution,
} from "./resolveEstatePlace";
import { estateRegistryEntryById } from "@/lib/estateIntelligence/estateRegistry";
import { getEstateRoomById } from "./estateRoomRegistry";
import { matchExplicitEstateRoomNavigation } from "./estateRoomRouting";
import type { EstateRoomDefinition } from "./types";

export type DirectRoomResolution = {
  entryId: string;
  roomId: string;
  section: AppSection | null;
  menuActionId?: EstateMenuActionId;
  displayName: string;
};

const MENU_ACTION_ALIASES: Record<string, EstateMenuActionId> = {
  settings: "settings",
  profile: "estate-profile",
};

function resolutionFromCanonicalPlace(
  placeId: string,
  userText?: string,
  explicitActivityRequested?: boolean,
): DirectRoomResolution | null {
  const outcome = goToPlace({
    placeId,
    userIntent: userText,
    explicitActivityRequested,
  });
  if (!outcome.ok) return null;
  return {
    entryId: outcome.placeId,
    roomId: outcome.placeId,
    section: outcome.section,
    menuActionId: outcome.menuActionId,
    displayName: outcome.officialName,
  };
}

function resolutionFromCanonicalText(
  userText: string,
): DirectRoomResolution | null {
  const resolution = resolveEstatePlace(userText);
  if (!shouldNavigateFromResolution(resolution) || !resolution.placeId) {
    return null;
  }
  return resolutionFromCanonicalPlace(
    resolution.placeId,
    userText,
    resolution.explicitActivityRequested,
  );
}

function displayNameForRoom(room: EstateRoomDefinition): string {
  return room.trademark ?? room.name;
}

function sectionForRoom(room: EstateRoomDefinition): AppSection | null {
  const override = ESTATE_ROOM_DIRECT_SECTION_OVERRIDES[room.id];
  if (override) return override;
  if (room.route) return room.route;
  return room.routes?.[0] ?? null;
}

function resolutionFromRoom(room: EstateRoomDefinition): DirectRoomResolution | null {
  const canonical = resolutionFromCanonicalPlace(room.id);
  if (canonical) return canonical;

  const menuActionId =
    room.menuActionId ?? MENU_ACTION_ALIASES[room.id] ?? undefined;
  const section = sectionForRoom(room);
  if (!section && !menuActionId) return null;

  const resolvedSection = section ?? (menuActionId === "settings" ? "settings" : null);
  if (!resolvedSection && !menuActionId) return null;

  return {
    entryId: room.id,
    roomId: room.id,
    section: resolvedSection ?? "home",
    menuActionId,
    displayName: displayNameForRoom(room),
  };
}

export function resolveDirectRoomFromRoomId(
  roomId: string,
): DirectRoomResolution | null {
  if (roomId === "settings") {
    return {
      entryId: "settings",
      roomId: "settings",
      section: "settings",
      menuActionId: "settings",
      displayName: "Settings",
    };
  }

  const canonical = resolutionFromCanonicalPlace(roomId);
  if (canonical) return canonical;

  const aliasEntry = getEstateRoomAliasEntry(roomId);
  const room = getEstateRoomById(roomId);
  if (room) {
    const resolved = resolutionFromRoom(room);
    if (resolved) return resolved;
  }

  const registryEntry = estateRegistryEntryById(roomId);
  if (registryEntry?.primarySection) {
    return {
      entryId: roomId,
      roomId,
      section: registryEntry.primarySection,
      displayName: aliasEntry?.officialName ?? registryEntry.name,
    };
  }

  if (aliasEntry?.route) {
    return {
      entryId: roomId,
      roomId,
      section: aliasEntry.route,
      displayName: aliasEntry.officialName,
    };
  }

  return null;
}

/** Resolve a spoken destination phrase to a visitable Estate room. */
export function resolveDirectRoomDestination(
  phrase: string,
  userText?: string,
): DirectRoomResolution | null {
  const fullText = userText ?? phrase;
  const canonical = resolutionFromCanonicalText(fullText);
  if (canonical) return canonical;

  const normalized = phrase.trim().toLowerCase().replace(/[™®.!?]+$/g, "");
  if (!normalized) return null;

  const exactRoomId = resolveEstateRoomAliasExact(normalized);
  if (exactRoomId) {
    const resolved = resolveDirectRoomFromRoomId(exactRoomId);
    if (resolved) return resolved;
  }

  const boundedRoomId = resolveEstateRoomAliasBounded(normalized);
  if (boundedRoomId) {
    const resolved = resolveDirectRoomFromRoomId(boundedRoomId);
    if (resolved) return resolved;
  }

  const explicitNav = matchExplicitEstateRoomNavigation(
    userText && userText !== phrase ? userText : phrase,
  );
  if (explicitNav) {
    return resolutionFromRoom(explicitNav.room);
  }

  return null;
}

/** Resolve full user message when it contains a navigation command. */
export function resolveDirectRoomFromUserText(
  userText: string,
): DirectRoomResolution | null {
  const canonical = resolutionFromCanonicalText(userText);
  if (canonical) return canonical;

  const destination =
    extractRoomPhraseFromNavigation(userText) ??
    userText.trim().replace(/[™®.!?]+$/g, "");
  return resolveDirectRoomDestination(destination, userText);
}
