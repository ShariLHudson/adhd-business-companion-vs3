/**
 * Spark Estate — exact room alias registry.
 * Room name match overrides feeling/activity routing.
 *
 * **Adapter (Phase B):** Aliases and `AppSection` overrides should eventually derive from
 * `canonicalEstateRegistry.ts`. Do not add new place ids here without updating canon first.
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

import type { AppSection } from "@/lib/companionUi";
import { isMetaNavigationDestinationPhrase } from "./estateMetaNavigationPhrases";
import {
  findPlaceByAlias,
  findPlacesByIntent,
  getNavigationOptions,
  resolveManifestExactLegacyPlaceId,
  resolveSingleManifestLegacyPlaceFromPhrase,
} from "./manifest/estatePlaceMasterManifest";
import { ESTATE_ROOM_ALIAS_CATALOG } from "./estateRoomAliasCatalog";
import { ESTATE_ROOM_BG_BY_ROOM_ID } from "./estateRoomAssets";
import { getEstateRoomById } from "./estateRoomRegistry";
import { normalizeSpokenPlaceText } from "./estateSpokenPlaceNormalize";
import type { EstateRoomType } from "./types";

export type { EstateRoomAliasSpec } from "./estateRoomAliasCatalog";
export { ESTATE_ROOM_ALIAS_CATALOG } from "./estateRoomAliasCatalog";

export type EstateRoomAliasEntry = {
  /** Stable registry id */
  roomId: string;
  /** Member-facing official name */
  officialName: string;
  /** Spoken / typed aliases — longest phrases should win at match time */
  aliases: readonly string[];
  /** Primary AppSection when visiting this place */
  route: AppSection | null;
  /** Background plate when known */
  backgroundImage: string | null;
  roomType: EstateRoomType;
  /** Key in estateRoomInvitationCatalog */
  invitationCatalogId: string;
};

/** Sections when room.route is null but direct navigation is still valid. */
export const ESTATE_ROOM_DIRECT_SECTION_OVERRIDES: Partial<
  Record<string, AppSection>
> = {
  conservatory: "home",
  "clear-my-mind": "brain-dump",
  "butterfly-house": "focus",
  "coffee-house": "focus-audio",
  "estate-soundscapes": "focus-audio",
  "apple-orchard": "home",
  "music-room": "focus-audio",
  sunroom: "welcome-room",
  "momentum-institute": "chamber-of-momentum",
  stables: "stables",
  "game-room": "quick-recharge",
  journal: "growth-journal",
  greenhouse: "growth-greenhouse",
  "reading-nook": "home",
  "study-hall": "chamber-of-momentum",
  "momentum-room": "chamber-of-momentum",
  "personal-deck": "home",
  "estate-kitchen": "home",
  "summer-terrace": "home",
  "grand-terrace": "home",
  "lakeside-verandah": "home",
  "lakeside-hammock": "home",
  "fireside-deck": "home",
  "estate-gardens": "home",
  gardens: "wins-this-week",
  "discovery-room": "home",
  "art-studio": "content-generator",
  "strategy-studio": "content-generator",
  "round-table": "boardroom",
  "dining-room": "home",
  "stairway-reading-nook": "home",
  "spark-estate": "home",
  /** Hall of Accomplishments ≠ Portfolio / Achievement Library */
  "gallery-of-firsts": "home",
  "destination-gallery": "destination-gallery",
};

function entry(
  roomId: string,
  officialName: string,
  aliases: readonly string[],
  route: AppSection | null,
  roomType: EstateRoomType,
  invitationCatalogId?: string,
): EstateRoomAliasEntry {
  const room = getEstateRoomById(roomId);
  return {
    roomId,
    officialName,
    aliases,
    route: ESTATE_ROOM_DIRECT_SECTION_OVERRIDES[roomId] ?? route ?? room?.route ?? null,
    backgroundImage:
      ESTATE_ROOM_BG_BY_ROOM_ID[roomId] ??
      room?.backgroundImage ??
      room?.intendedBackgroundImage ??
      null,
    roomType: room?.roomType ?? roomType,
    invitationCatalogId: invitationCatalogId ?? roomId,
  };
}

/** Canonical exact-room registry — every navigable Estate place. */
export const ESTATE_ROOM_ALIAS_REGISTRY: readonly EstateRoomAliasEntry[] =
  ESTATE_ROOM_ALIAS_CATALOG.map((spec) =>
    entry(
      spec.roomId,
      spec.officialName,
      spec.aliases,
      spec.route,
      spec.roomType,
      spec.invitationCatalogId,
    ),
  );

const ALIAS_REGISTRY_BY_ROOM_ID = new Map(
  ESTATE_ROOM_ALIAS_REGISTRY.map((row) => [row.roomId, row]),
);

/** Longest alias first — prevents "home" matching inside "greenhouse". */
const ALIASES_BY_LENGTH = [...ESTATE_ROOM_ALIAS_REGISTRY]
  .flatMap((row) =>
    row.aliases.map((phrase) => ({ phrase, roomId: row.roomId })),
  )
  .sort((a, b) => b.phrase.length - a.phrase.length);

const EXACT_ALIAS_TO_ROOM = new Map<string, string>();
for (const row of ESTATE_ROOM_ALIAS_REGISTRY) {
  for (const alias of row.aliases) {
    EXACT_ALIAS_TO_ROOM.set(normalizeAliasPhrase(alias), row.roomId);
  }
}

export function normalizeAliasPhrase(phrase: string): string {
  return phrase.trim().toLowerCase().replace(/[®.!?]+$/g, "");
}

function phraseContainsBoundedAlias(text: string, aliasPhrase: string): boolean {
  const escaped = aliasPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i").test(text);
}

/** Exact phrase → room id (full string or without leading "the "). Manifest first, legacy fallback. */
export function resolveEstateRoomAliasExact(phrase: string): string | null {
  const manifestExact = resolveManifestExactLegacyPlaceId(phrase);
  if (manifestExact) return manifestExact;

  const spoken = normalizeSpokenPlaceText(phrase);
  const normalized = normalizeAliasPhrase(spoken);
  if (!normalized) return null;
  if (EXACT_ALIAS_TO_ROOM.has(normalized)) {
    return EXACT_ALIAS_TO_ROOM.get(normalized)!;
  }
  if (normalized.startsWith("the ")) {
    const stripped = normalized.slice(4);
    if (EXACT_ALIAS_TO_ROOM.has(stripped)) {
      return EXACT_ALIAS_TO_ROOM.get(stripped)!;
    }
  }
  return null;
}

/** Bounded substring match — longest alias wins. Manifest first, legacy fallback. */
export function resolveEstateRoomAliasBounded(phrase: string): string | null {
  const manifestMatch = resolveSingleManifestLegacyPlaceFromPhrase(phrase);
  if (manifestMatch) return manifestMatch;

  const spoken = normalizeSpokenPlaceText(phrase);
  const exact = resolveEstateRoomAliasExact(spoken);
  if (exact) return exact;
  const normalized = normalizeAliasPhrase(spoken);
  if (!normalized) return null;
  for (const { phrase: aliasPhrase, roomId } of ALIASES_BY_LENGTH) {
    if (phraseContainsBoundedAlias(normalized, aliasPhrase)) {
      return roomId;
    }
  }
  return null;
}

/** All rooms matching the longest alias in text — for disambiguation menus. */
export function findAmbiguousPlaceMatches(phrase: string): string[] {
  const manifestAliasMatches = findPlaceByAlias(phrase);
  if (manifestAliasMatches.length > 1) {
    return manifestAliasMatches.map((p) => p.legacy_place_id);
  }

  const manifestIntentMatches = findPlacesByIntent(phrase);
  if (manifestIntentMatches.length > 1) {
    return manifestIntentMatches.map((p) => p.legacy_place_id);
  }

  const spoken = normalizeSpokenPlaceText(phrase);
  const normalized = normalizeAliasPhrase(spoken);
  if (!normalized) return [];

  const exact = resolveEstateRoomAliasExact(normalized);
  if (exact) return [exact];

  let bestLen = 0;
  const matches = new Set<string>();

  for (const { phrase: aliasPhrase, roomId } of ALIASES_BY_LENGTH) {
    if (!phraseContainsBoundedAlias(normalized, aliasPhrase)) continue;
    const len = aliasPhrase.length;
    if (len < bestLen) continue;
    if (len > bestLen) {
      matches.clear();
      bestLen = len;
    }
    matches.add(roomId);
  }

  return [...matches];
}

export function getEstateRoomAliasEntry(
  roomId: string,
): EstateRoomAliasEntry | null {
  return ALIAS_REGISTRY_BY_ROOM_ID.get(roomId) ?? null;
}

const ESTATE_NAVIGATION_VERB_RE =
  /\b(?:go to|take me to|bring me to|(?:take\s+)?me to|open|show me|let(?:'s| us) (?:go to|visit)|head to|visit|where(?:'s| is| are))\b/i;

/** True when the message names a specific Estate room (not a mood-only request). */
export function messageNamesExactEstateRoom(userText: string): boolean {
  const trimmed = userText.trim();
  if (!trimmed) return false;

  if (
    /\b(?:need to|want to|help me|let(?:'s| us))\s+clear my mind\b/i.test(
      trimmed,
    )
  ) {
    return false;
  }

  const destination = extractRoomPhraseFromNavigation(trimmed);
  if (destination && resolveEstateRoomAliasExact(destination)) return true;
  if (destination && resolveEstateRoomAliasBounded(destination)) return true;

  if (!ESTATE_NAVIGATION_VERB_RE.test(trimmed)) {
    const bare = normalizeAliasPhrase(trimmed);
    if (bare.split(/\s+/).length <= 6 && resolveEstateRoomAliasExact(bare)) {
      return true;
    }
  }

  if (resolveEstateRoomAliasBounded(trimmed)) return true;

  return false;
}

const PLACE_LOOK_LIKE_RE =
  /\bwhat does (?:the\s+)?(.+?)\s+look like\b/i;

const VISIT_WISH_RE =
  /\b(?:i(?:'d| would)?\s+like\s+to\s+visit|i want to visit|can we visit|let(?:'s| us) visit)\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i;

/** Extract destination phrase from navigation / look-like / visit patterns. */
export function extractEstateDestinationPhrase(userText: string): string | null {
  const trimmed = userText.trim();
  if (!trimmed) return null;

  const fromNav = extractRoomPhraseFromNavigation(trimmed);
  if (fromNav) return fromNav;

  const lookLike = trimmed.match(PLACE_LOOK_LIKE_RE);
  if (lookLike?.[1]?.trim()) {
    return lookLike[1].trim().replace(/[®.!?]+$/g, "");
  }

  const visitWish = trimmed.match(VISIT_WISH_RE);
  if (visitWish?.[1]?.trim()) {
    return visitWish[1].trim().replace(/[®.!?]+$/g, "");
  }

  return null;
}

/**
 * Resolve member text → canonical place id (alias registry).
 * Returns null when no named place is detected.
 */
export function resolveEstatePlaceIdFromUserText(userText: string): string | null {
  const trimmed = normalizeSpokenPlaceText(userText.trim());
  if (!trimmed) return null;

  const ambiguity = getNavigationOptions(trimmed);
  if (ambiguity.kind === "suggest") return null;

  const destination = extractEstateDestinationPhrase(trimmed);
  if (destination) {
    const spokenDestination = normalizeSpokenPlaceText(destination);
    return (
      resolveEstateRoomAliasExact(spokenDestination) ??
      resolveEstateRoomAliasBounded(spokenDestination)
    );
  }

  const bare = normalizeAliasPhrase(trimmed);
  if (bare.split(/\s+/).length <= 6) {
    const exact = resolveEstateRoomAliasExact(bare);
    if (exact) return exact;
  }

  return resolveEstateRoomAliasBounded(trimmed);
}

/** Pull destination from "take me to …" / "open …" — trim compound "and help me …". */
export function extractRoomPhraseFromNavigation(text: string): string | null {
  const patterns = [
    /\bwhat does (?:the\s+)?(.+?)\s+look like\b/i,
    /\b(?:take\s+)?me\s+to\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\b(?:go to|take me to|bring me to|head to|visit)\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\b(?:want|wanna|need)\s+to\s+go\s+to\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\b(?:would like|'d like)\s+to\s+visit\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\blet(?:'s| us) visit\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\b(?:would like|'d like)\s+to\s+go(?:\s+\w+){0,8}?\s+(?:to\s+(?:the\s+)?|in\s+(?:the\s+)?)(.+?)(?:[.!?]|$)/i,
    /\b(?:no|nope)[,.]?\s+(?:i\s+)?(?:want|need)\s+to\s+go\s+to\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\bdon'?t\s+want\s+to\s+stay\b[^.!?]*\b(?:want|need)\s+to\s+go\s+to\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\b(?:just\s+)?go\s+to\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\bopen\s+(?:the\s+)?(?:my\s+)?(.+?)(?:[.!?]|$)/i,
    /\blet(?:'s| us) (?:go to|visit)\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\bshow me\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\bwhere(?:'s| is| are)\s+(?:the\s+)?(.+?)(?:\?|$)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) {
      const phrase = trimCompoundDestinationPhrase(match[1].trim());
      if (isMetaNavigationDestinationPhrase(phrase)) return null;
      return phrase;
    }
  }
  return null;
}

function trimCompoundDestinationPhrase(phrase: string): string {
  const trimmed = phrase.replace(/[®.!?]+$/g, "").trim();
  const parts = trimmed.split(
    /\s+and\s+(?:help me|then|also)\b/i,
  );
  return parts[0]?.trim() ?? trimmed;
}
