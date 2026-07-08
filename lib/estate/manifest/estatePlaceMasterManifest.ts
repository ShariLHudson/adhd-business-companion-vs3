/**
 * Estate Place Master Manifest — runtime reader.
 *
 * Single source of truth for place identity, aliases, intent tags, and media filenames.
 * Legacy adapters (canonicalEstatePlaces, estateRoomAliasCatalog) remain until verified.
 *
 * @see docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json
 * @see docs/estate/ESTATE_PLACE_MASTER_MANIFEST_PROTOCOL.md
 */

import manifestDocument from "@/docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json";
import { MANIFEST_NAVIGATION_AMBIGUITY_GROUPS } from "./manifestNavigationGroups";
import type {
  EstateManifestAmbiguityGroup,
  EstateManifestNavigationOption,
  EstateManifestNavigationResult,
  EstateManifestPlaceMedia,
  EstateManifestPlaceRecord,
  EstatePlaceMasterManifest,
} from "./types";

const MANIFEST = manifestDocument as EstatePlaceMasterManifest;

const NAV_VERB_RE =
  /\b(?:take me to|go to|let(?:'s| us) go to|open|show me|visit|head to|bring me to|want to go to|i want|i need)\b/i;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeManifestPhrase(phrase: string): string {
  return phrase
    .trim()
    .toLowerCase()
    .replace(/[™®.!?]+$/g, "")
    .replace(/\s+/g, " ");
}

function phraseContainsBoundedAlias(text: string, aliasPhrase: string): boolean {
  const escaped = escapeRegExp(aliasPhrase);
  return new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i").test(text);
}

function parseManifestRoute(route: string): string | null {
  const match = route.match(/[?&]section=([^&]+)/);
  return match?.[1] ?? null;
}

function buildIndexes() {
  const byManifestId = new Map<string, EstateManifestPlaceRecord>();
  const byLegacyId = new Map<string, EstateManifestPlaceRecord>();
  const aliasToLegacyIds = new Map<string, Set<string>>();
  const intentTagToLegacyIds = new Map<string, Set<string>>();
  const mergeRedirects = new Map<string, string>();

  const allRecords: EstateManifestPlaceRecord[] = [
    ...MANIFEST.places,
    ...(MANIFEST.removed_places ?? []),
  ];

  for (const place of allRecords) {
    byManifestId.set(place.place_id, place);
    byLegacyId.set(place.legacy_place_id, place);

    if (place.merged_into_place_id) {
      const target = byManifestId.get(place.merged_into_place_id);
      if (target) {
        mergeRedirects.set(place.legacy_place_id, target.legacy_place_id);
      }
    }
  }

  for (const place of MANIFEST.places) {
    if (!place.navigable) continue;

    const registerAlias = (raw: string) => {
      const normalized = normalizeManifestPhrase(raw);
      if (!normalized) return;
      const bucket = aliasToLegacyIds.get(normalized) ?? new Set<string>();
      bucket.add(place.legacy_place_id);
      aliasToLegacyIds.set(normalized, bucket);
    };

    registerAlias(place.official_name);
    registerAlias(place.display_name);
    for (const alias of place.aliases) registerAlias(alias);

    for (const tag of place.intent_tags) {
      const normalized = normalizeManifestPhrase(tag);
      if (!normalized) continue;
      const bucket = intentTagToLegacyIds.get(normalized) ?? new Set<string>();
      bucket.add(place.legacy_place_id);
      intentTagToLegacyIds.set(normalized, bucket);
    }
  }

  const aliasesByLength = [...aliasToLegacyIds.entries()]
    .flatMap(([phrase, legacyIds]) =>
      [...legacyIds].map((legacyPlaceId) => ({ phrase, legacyPlaceId })),
    )
    .sort((a, b) => b.phrase.length - a.phrase.length);

  return {
    byManifestId,
    byLegacyId,
    aliasToLegacyIds,
    intentTagToLegacyIds,
    mergeRedirects,
    aliasesByLength,
    navigablePlaces: MANIFEST.places.filter((p) => p.navigable),
  };
}

const INDEX = buildIndexes();

/** Resolve removed / merged legacy ids to their navigable target. */
export function resolveManifestLegacyPlaceId(
  legacyOrManifestId: string,
): string {
  let current = legacyOrManifestId;
  const seen = new Set<string>();

  while (!seen.has(current)) {
    seen.add(current);
    const asLegacy = INDEX.byLegacyId.get(current);
    if (asLegacy?.merged_into_place_id) {
      const target = INDEX.byManifestId.get(asLegacy.merged_into_place_id);
      if (target) {
        current = target.legacy_place_id;
        continue;
      }
    }
    const redirect = INDEX.mergeRedirects.get(current);
    if (redirect && redirect !== current) {
      current = redirect;
      continue;
    }
    break;
  }

  return current;
}

export function getManifestDocument(): EstatePlaceMasterManifest {
  return MANIFEST;
}

export function getPlaceById(
  legacyOrManifestId: string,
): EstateManifestPlaceRecord | null {
  const resolvedLegacy = resolveManifestLegacyPlaceId(legacyOrManifestId);
  return (
    INDEX.byLegacyId.get(resolvedLegacy) ??
    INDEX.byManifestId.get(legacyOrManifestId) ??
    null
  );
}

function resolveIdToLegacy(id: string): string {
  const place = getPlaceById(id);
  if (place) return place.legacy_place_id;
  return resolveManifestLegacyPlaceId(id);
}

function collectAliasMatches(normalized: string): Map<string, number> {
  const matches = new Map<string, number>();

  const exactBucket = INDEX.aliasToLegacyIds.get(normalized);
  if (exactBucket) {
    for (const legacyId of exactBucket) {
      matches.set(legacyId, Math.max(matches.get(legacyId) ?? 0, normalized.length));
    }
  }

  if (normalized.startsWith("the ")) {
    const stripped = normalized.slice(4);
    const strippedBucket = INDEX.aliasToLegacyIds.get(stripped);
    if (strippedBucket) {
      for (const legacyId of strippedBucket) {
        matches.set(legacyId, Math.max(matches.get(legacyId) ?? 0, stripped.length));
      }
    }
  }

  for (const { phrase, legacyPlaceId } of INDEX.aliasesByLength) {
    if (!phraseContainsBoundedAlias(normalized, phrase)) continue;
    const len = phrase.length;
    if (len < (matches.get(legacyPlaceId) ?? 0)) continue;
    matches.set(legacyPlaceId, len);
  }

  return matches;
}

/** All manifest places whose alias matches the phrase (longest alias wins per place). */
export function findPlaceByAlias(phrase: string): EstateManifestPlaceRecord[] {
  const normalized = normalizeManifestPhrase(phrase);
  if (!normalized) return [];

  const matches = collectAliasMatches(normalized);
  if (matches.size === 0) return [];

  const bestLen = Math.max(...matches.values());
  return [...matches.entries()]
    .filter(([, len]) => len === bestLen)
    .map(([legacyId]) => getPlaceById(legacyId))
    .filter((p): p is EstateManifestPlaceRecord => Boolean(p?.navigable));
}

/** Match intent tags as whole words in member text. */
export function findPlacesByIntent(text: string): EstateManifestPlaceRecord[] {
  const normalized = normalizeManifestPhrase(text);
  if (!normalized) return [];

  const matches = new Map<string, EstateManifestPlaceRecord>();

  for (const place of INDEX.navigablePlaces) {
    for (const tag of place.intent_tags) {
      const tagNorm = normalizeManifestPhrase(tag);
      if (!tagNorm) continue;
      const re = new RegExp(`\\b${escapeRegExp(tagNorm)}\\b`, "i");
      if (re.test(normalized)) {
        matches.set(place.legacy_place_id, place);
      }
    }
  }

  return [...matches.values()];
}

export function getPlaceMedia(
  legacyOrManifestId: string,
): EstateManifestPlaceMedia {
  const place = getPlaceById(legacyOrManifestId);
  if (!place) {
    return {
      primaryImage: null,
      imageVariants: [],
      video: null,
      audio: null,
      backgroundUrl: null,
      videoUrl: null,
      audioUrl: null,
    };
  }

  const backgroundUrl = place.primary_image
    ? `/backgrounds/${encodeURI(place.primary_image)}`
    : null;
  const videoUrl = place.video ? `/Videos/${encodeURI(place.video)}` : null;
  const audioUrl = place.audio ? `/audio/${encodeURI(place.audio)}` : null;

  return {
    primaryImage: place.primary_image,
    imageVariants: place.image_variants,
    video: place.video,
    audio: place.audio,
    backgroundUrl,
    videoUrl,
    audioUrl,
  };
}

export function getRelatedPlaces(
  legacyOrManifestId: string,
): EstateManifestPlaceRecord[] {
  const place = getPlaceById(legacyOrManifestId);
  if (!place) return [];

  return place.related_places
    .map((id) => getPlaceById(id))
    .filter((p): p is EstateManifestPlaceRecord => Boolean(p?.navigable));
}

export function getManifestAppSection(
  legacyOrManifestId: string,
): string | null {
  const place = getPlaceById(legacyOrManifestId);
  if (!place?.route) return null;
  return parseManifestRoute(place.route);
}

function toNavigationOption(id: string): EstateManifestNavigationOption | null {
  const legacyPlaceId = resolveIdToLegacy(id) ?? id;
  const place = getPlaceById(legacyPlaceId);
  if (!place) {
    return {
      legacyPlaceId,
      placeId: id,
      officialName: legacyPlaceId,
      displayName: legacyPlaceId,
    };
  }
  return {
    legacyPlaceId: place.legacy_place_id,
    placeId: place.place_id,
    officialName: place.official_name,
    displayName: place.display_name,
  };
}

export function stripManifestNavigationVerbs(text: string): string {
  return text
    .replace(
      /\b(?:take me to|go to|let(?:'s| us) go to|open|show me|visit|head to|bring me to|i want to go to|i need to go to|want to go to)\s+(?:the\s+)?/gi,
      "",
    )
    .replace(/[™®.!?]+$/g, "")
    .trim();
}

/** Ambiguous phrases → choice list; never random selection. */
export function getNavigationOptions(
  userText: string,
  context?: { currentPlaceId?: string },
): EstateManifestNavigationResult {
  const stripped = stripManifestNavigationVerbs(userText);
  const probe = stripped || userText.trim();

  for (const group of MANIFEST_NAVIGATION_AMBIGUITY_GROUPS) {
    if (!group.patterns.some((pattern) => pattern.test(probe))) continue;

    const options = group.placeIds
      .map((id) => resolveIdToLegacy(id))
      .filter((id) => id !== context?.currentPlaceId)
      .map((id) => toNavigationOption(id))
      .filter((opt): opt is EstateManifestNavigationOption => Boolean(opt));

    const unique = [
      ...new Map(options.map((opt) => [opt.legacyPlaceId, opt])).values(),
    ];

    if (unique.length >= 2) {
      return {
        kind: "suggest",
        options: unique,
        intro: group.intro,
        reason: `ambiguous destination → ${group.id}`,
      };
    }
  }

  return { kind: "none" };
}

/** Exact manifest alias → single legacy place id, or null when none / ambiguous. */
export function resolveManifestExactLegacyPlaceId(phrase: string): string | null {
  const normalized = normalizeManifestPhrase(phrase);
  if (!normalized) return null;

  const bucket = INDEX.aliasToLegacyIds.get(normalized);
  if (bucket?.size === 1) {
    return resolveManifestLegacyPlaceId([...bucket][0]!);
  }

  if (normalized.startsWith("the ")) {
    const stripped = INDEX.aliasToLegacyIds.get(normalized.slice(4));
    if (stripped?.size === 1) {
      return resolveManifestLegacyPlaceId([...stripped][0]!);
    }
  }

  return null;
}

/** Single navigable legacy id from phrase, or null when none / ambiguous. */
export function resolveSingleManifestLegacyPlaceFromPhrase(
  phrase: string,
): string | null {
  const exact = resolveManifestExactLegacyPlaceId(phrase);
  if (exact) return exact;

  const aliasMatches = findPlaceByAlias(phrase);
  if (aliasMatches.length === 1) {
    return aliasMatches[0]!.legacy_place_id;
  }
  if (aliasMatches.length > 1) return null;

  const intentMatches = findPlacesByIntent(phrase);
  if (intentMatches.length === 1) {
    return intentMatches[0]!.legacy_place_id;
  }

  return null;
}

/**
 * Manifest-first navigation resolution.
 * User language → alias / intent → manifest → legacy place id.
 */
export function resolveManifestNavigation(
  userText: string,
  context?: { currentPlaceId?: string },
): EstateManifestNavigationResult {
  const ambiguity = getNavigationOptions(userText, context);
  if (ambiguity.kind === "suggest") return ambiguity;

  const stripped = stripManifestNavigationVerbs(userText);
  const probe = normalizeManifestPhrase(stripped || userText);

  const aliasMatches = findPlaceByAlias(probe);
  if (aliasMatches.length === 1) {
    return {
      kind: "navigate",
      legacyPlaceId: aliasMatches[0]!.legacy_place_id,
      place: aliasMatches[0]!,
      matchedBy: "alias",
      matchedPhrase: probe,
    };
  }
  if (aliasMatches.length > 1) {
    return {
      kind: "suggest",
      options: aliasMatches.map((place) => ({
        legacyPlaceId: place.legacy_place_id,
        placeId: place.place_id,
        officialName: place.official_name,
        displayName: place.display_name,
      })),
      intro: "I found a few places that could match. Which one did you mean?",
      reason: "ambiguous manifest alias",
    };
  }

  if (NAV_VERB_RE.test(userText) || probe.split(/\s+/).length <= 8) {
    const intentMatches = findPlacesByIntent(probe);
    if (intentMatches.length === 1) {
      return {
        kind: "navigate",
        legacyPlaceId: intentMatches[0]!.legacy_place_id,
        place: intentMatches[0]!,
        matchedBy: "intent",
        matchedPhrase: probe,
      };
    }
    if (intentMatches.length > 1) {
      return {
        kind: "suggest",
        options: intentMatches.map((place) => ({
          legacyPlaceId: place.legacy_place_id,
          placeId: place.place_id,
          officialName: place.official_name,
          displayName: place.display_name,
        })),
        intro: "A few places might fit. Which sounds right?",
        reason: "ambiguous manifest intent",
      };
    }
  }

  return { kind: "none" };
}

export function getManifestNavigationAmbiguityGroups(): readonly EstateManifestAmbiguityGroup[] {
  return MANIFEST_NAVIGATION_AMBIGUITY_GROUPS;
}

export type {
  EstateManifestPlaceRecord,
  EstateManifestPlaceMedia,
  EstateManifestNavigationResult,
  EstateManifestNavigationOption,
} from "./types";
