/**
 * Build the master Estate Directory from canonical places + derived maps.
 */

import {
  CANONICAL_ESTATE_REGISTRY,
  resolveCanonicalPlaceId,
  type CanonicalEstatePlace,
  type CanonicalSuggestionProfile,
} from "../canonicalEstateRegistry";
import { getEstateRoomById } from "../estateRoomRegistry";
import { resolveEstateLocationMedia } from "./media";
import { resolveEstateLocationShell } from "./shell";
import type {
  EstateDirectoryEntry,
  EstateDirectoryStats,
} from "./types";

const PROFILE_RECOMMEND_HINTS: Readonly<
  Record<CanonicalSuggestionProfile, string>
> = {
  quiet: "member wants quiet, calm, or peaceful atmosphere",
  stressed: "member feels stressed and needs a softer space",
  overwhelmed: "member feels overwhelmed and needs restoration",
  celebrate: "member wants to celebrate or honor a win",
  learn: "member wants to learn or study",
  think: "member wants to think something through",
  rest: "member wants rest or recharge",
  curious: "member is curious and wants to explore",
  reflective: "member wants reflection or journaling",
  creative: "member wants to create or make something",
  uncertain: "member is unsure where to go",
  orient: "member needs orientation on the Estate",
};

function buildRecommendWhen(place: CanonicalEstatePlace): string[] {
  const hints = new Set<string>();
  const legacy = getEstateRoomById(place.id);
  for (const line of legacy?.whenToRecommend ?? []) {
    hints.add(line);
  }
  for (const profile of place.suggestionProfiles ?? []) {
    const hint = PROFILE_RECOMMEND_HINTS[profile];
    if (hint) hints.add(hint);
  }
  return [...hints];
}

function buildDirectoryEntry(
  place: CanonicalEstatePlace,
  knownIds: ReadonlySet<string>,
): EstateDirectoryEntry {
  const shell = resolveEstateLocationShell(place.id);
  const media = resolveEstateLocationMedia(place);
  const connections = place.relatedPlaces.filter((id) => knownIds.has(id));

  return {
    id: place.id,
    officialName: place.officialName,
    category: place.category,
    primaryFeeling: place.primaryFeeling,
    aliases: place.aliases,
    arrivalBehavior: place.arrivalBehavior,
    conversationStyle: place.conversationStyle,
    permanentObjects: place.permanentObjects,
    seasonalObjects: place.seasonalObjects,
    interactiveObjects: place.interactiveObjects,
    relatedPlaces: place.relatedPlaces,
    status: place.status,
    suggestionProfiles: place.suggestionProfiles,
    expansionNotes: place.expansionNotes,
    shell,
    media,
    recommendWhen: buildRecommendWhen(place),
    connections,
  };
}

function buildEstateDirectoryMap(): ReadonlyMap<string, EstateDirectoryEntry> {
  const knownIds = new Set(
    CANONICAL_ESTATE_REGISTRY.map((place) => place.id),
  );
  const map = new Map<string, EstateDirectoryEntry>();
  for (const place of CANONICAL_ESTATE_REGISTRY) {
    map.set(place.id, buildDirectoryEntry(place, knownIds));
  }
  return map;
}

/** Master Estate Directory — every background, room, and space in Spark Estate. */
export const ESTATE_DIRECTORY: ReadonlyMap<string, EstateDirectoryEntry> =
  buildEstateDirectoryMap();

export function getEstateDirectoryEntry(
  placeId: string,
): EstateDirectoryEntry | undefined {
  return ESTATE_DIRECTORY.get(resolveCanonicalPlaceId(placeId));
}

export function requireEstateDirectoryEntry(
  placeId: string,
): EstateDirectoryEntry {
  const entry = getEstateDirectoryEntry(placeId);
  if (!entry) {
    throw new Error(`Unknown estate directory location: ${placeId}`);
  }
  return entry;
}

export function getAllEstateDirectoryEntries(): readonly EstateDirectoryEntry[] {
  return [...ESTATE_DIRECTORY.values()];
}

export function getEstateDirectoryEntriesByCategory(
  category: EstateDirectoryEntry["category"],
): EstateDirectoryEntry[] {
  return getAllEstateDirectoryEntries().filter(
    (entry) => entry.category === category,
  );
}

export function getNavigableEstateDirectoryEntries(): EstateDirectoryEntry[] {
  return getAllEstateDirectoryEntries().filter(
    (entry) => entry.shell.navigable,
  );
}

export function getEstateDirectoryEntriesForProfile(
  profile: CanonicalSuggestionProfile,
  max = 3,
): EstateDirectoryEntry[] {
  const matches: EstateDirectoryEntry[] = [];
  for (const entry of ESTATE_DIRECTORY.values()) {
    if (!entry.suggestionProfiles?.includes(profile)) continue;
    matches.push(entry);
    if (matches.length >= max) break;
  }
  return matches;
}

export function getEstateDirectoryConnections(
  placeId: string,
): EstateDirectoryEntry[] {
  const entry = getEstateDirectoryEntry(placeId);
  if (!entry) return [];
  return entry.connections
    .map((id) => getEstateDirectoryEntry(id))
    .filter((e): e is EstateDirectoryEntry => Boolean(e));
}

export function estateDirectoryStats(): EstateDirectoryStats {
  const byCategory: EstateDirectoryStats["byCategory"] = {
    "living-place": 0,
    destination: 0,
    collection: 0,
    "transition-space": 0,
  };
  let navigable = 0;
  let withBackground = 0;
  let withAmbience = 0;

  for (const entry of ESTATE_DIRECTORY.values()) {
    byCategory[entry.category] += 1;
    if (entry.shell.navigable) navigable += 1;
    if (entry.media.backgroundUrl) withBackground += 1;
    if (entry.media.ambience) withAmbience += 1;
  }

  return {
    total: ESTATE_DIRECTORY.size,
    navigable,
    withBackground,
    withAmbience,
    byCategory,
  };
}

export function validateEstateDirectoryIntegrity(): string[] {
  const errors: string[] = [];
  for (const entry of ESTATE_DIRECTORY.values()) {
    if (entry.shell.navigable && !entry.shell.section && !entry.shell.menuActionId) {
      errors.push(`${entry.id}: navigable but no section or menu action`);
    }
    for (const related of entry.relatedPlaces) {
      if (!ESTATE_DIRECTORY.has(related)) {
        errors.push(`${entry.id}: unknown relatedPlace ${related}`);
      }
    }
    for (const connection of entry.connections) {
      if (!ESTATE_DIRECTORY.has(connection)) {
        errors.push(`${entry.id}: invalid connection ${connection}`);
      }
    }
  }
  return errors;
}
