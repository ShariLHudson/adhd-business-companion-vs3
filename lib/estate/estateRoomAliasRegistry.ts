/**
 * Spark Estate™ — exact room alias registry.
 * Room name match overrides feeling/activity routing.
 *
 * **Adapter (Phase B):** Aliases and `AppSection` overrides should eventually derive from
 * `canonicalEstateRegistry.ts`. Do not add new place ids here without updating canon first.
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

import type { AppSection } from "@/lib/companionUi";
import { ESTATE_ROOM_BG_BY_ROOM_ID } from "./estateRoomAssets";
import { getEstateRoomById } from "./estateRoomRegistry";
import type { EstateRoomType } from "./types";

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
  "coffee-house": "focus-audio",
  "estate-soundscapes": "focus-audio",
  "apple-orchard": "focus-audio",
  "music-room": "focus-audio",
  sunroom: "welcome-room",
  "momentum-institute": "momentum-institute",
  stables: "stables",
  "game-room": "quick-recharge",
  journal: "growth-journal",
  greenhouse: "growth-greenhouse",
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
export const ESTATE_ROOM_ALIAS_REGISTRY: readonly EstateRoomAliasEntry[] = [
  entry("welcome-home", "Welcome Home™", [
    "welcome home",
    "home",
  ], "welcome-room", "welcome"),
  entry("conservatory", "The Conservatory™", [
    "conservatory",
    "the conservatory",
    "conservatory room",
    "butterfly conservatory",
    "the butterfly conservatory",
  ], null, "reflection"),
  entry("momentum-institute", "Momentum Institute™", [
    "momentum institute",
    "the momentum institute",
    "institute",
    "the institute",
  ], "momentum-institute", "learning"),
  entry("creative-studio", "Creative Studio™", [
    "creative studio",
    "the creative studio",
    "studio",
    "the studio",
  ], "content-generator", "creation"),
  entry("observatory", "Observatory™", [
    "observatory",
    "the observatory",
  ], "grow-observatory", "research"),
  entry("coffee-house", "Coffee House™", [
    "coffee house",
    "the coffee house",
    "coffee shop",
    "the coffee shop",
    "cozy cafe",
    "cafe",
    "the cafe",
    "café",
    "the café",
  ], "focus-audio", "restoration"),
  entry("apple-orchard", "Apple Orchard™", [
    "apple orchard",
    "the apple orchard",
    "orchard",
    "the orchard",
  ], "focus-audio", "nature"),
  entry("stables", "The Stables™", [
    "stables",
    "the stables",
    "stable",
    "the stable",
  ], "stables", "reflection"),
  entry("gardens", "The Gardens™", [
    "gardens",
    "the gardens",
    "garden",
    "the garden",
  ], "wins-this-week", "nature"),
  entry("greenhouse", "Greenhouse™", [
    "greenhouse",
    "the greenhouse",
  ], null, "nature"),
  entry("music-room", "Music Room™", [
    "music room",
    "the music room",
  ], "focus-audio", "restoration"),
  entry("tea-room", "Tea Room™", [
    "tea room",
    "the tea room",
  ], "focus-audio", "restoration"),
  entry("library", "The Library™", [
    "library",
    "the library",
    "story library",
  ], "growth-library", "learning"),
  entry("journal", "Journal™", [
    "journal",
    "growth journal",
    "the journal",
    "my journal",
    "gazebo",
    "the gazebo",
    "gazebo journal",
  ], "growth-journal", "reflection"),
  entry("evidence-vault", "Evidence Vault™", [
    "evidence vault",
    "the evidence vault",
    "evidence bank",
  ], "evidence-bank", "archive"),
  entry("my-estate", "My Estate™", [
    "my estate",
    "estate profile",
  ], null, "profile"),
  entry("institute-cabinet", "My Institute Cabinet™", [
    "institute cabinet",
    "my institute cabinet",
    "my cabinet",
  ], null, "archive"),
  entry("portfolio", "Portfolio™", [
    "portfolio",
    "my portfolio",
  ], "growth-portfolio", "archive"),
  entry("seeds-planted", "Seeds Planted™", [
    "seeds planted",
    "planted seeds",
    "spark cards",
    "my spark cards",
  ], "grow-spark-cards", "archive"),
  entry("growth-profile", "Growth Profile™", [
    "growth profile",
    "my growth profile",
  ], null, "profile"),
  entry("goals-projects", "Goals & Projects™", [
    "goals and projects",
    "goals & projects",
    "my projects",
    "goals projects",
  ], "projects", "planning"),
  entry("decision-compass", "Decision Compass™", [
    "decision compass",
    "the decision compass",
  ], "decision-compass", "planning"),
  entry("peaceful-places", "Peaceful Places™", [
    "peaceful places",
    "peaceful place",
    "pleasure places",
    "pleasure place",
  ], "home", "restoration"),
  entry("estate-soundscapes", "Estate Soundscapes™", [
    "estate soundscapes",
    "soundscapes",
    "soundscape",
    "take me to soundscapes",
    "focus music",
    "focus sounds",
    "calming sounds",
    "relaxing music",
    "play focus music",
    "play something peaceful",
    "i want music",
    "play music",
    "audio",
  ], "focus-audio", "restoration"),
  entry("clear-my-mind", "Clear My Mind™", [
    "clear my mind",
    "brain dump",
    "clear my head",
  ], "brain-dump", "reflection"),
  entry("game-room", "Game Room™", [
    "game room",
    "the game room",
    "exercise room",
    "the exercise room",
  ], "quick-recharge", "play"),
  entry("sunroom", "Sunroom", [
    "sunroom",
    "the sunroom",
    "shari's sunroom",
  ], "welcome-room", "welcome"),
  entry("momentum-builder", "Momentum Builder™", [
    "momentum builder",
    "the momentum builder",
  ], "momentum-builder", "planning"),
] as const;

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
  return phrase.trim().toLowerCase().replace(/[™®.!?]+$/g, "");
}

function phraseContainsBoundedAlias(text: string, aliasPhrase: string): boolean {
  const escaped = aliasPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i").test(text);
}

/** Exact phrase → room id (full string or without leading "the "). */
export function resolveEstateRoomAliasExact(phrase: string): string | null {
  const normalized = normalizeAliasPhrase(phrase);
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

/** Bounded substring match — longest alias wins. */
export function resolveEstateRoomAliasBounded(phrase: string): string | null {
  const exact = resolveEstateRoomAliasExact(phrase);
  if (exact) return exact;
  const normalized = normalizeAliasPhrase(phrase);
  if (!normalized) return null;
  for (const { phrase: aliasPhrase, roomId } of ALIASES_BY_LENGTH) {
    if (phraseContainsBoundedAlias(normalized, aliasPhrase)) {
      return roomId;
    }
  }
  return null;
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

/** Pull destination from "take me to …" / "open …" — trim compound "and help me …". */
export function extractRoomPhraseFromNavigation(text: string): string | null {
  const patterns = [
    /\b(?:take\s+)?me\s+to\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\b(?:go to|take me to|bring me to|head to|visit)\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
    /\b(?:want|wanna|need)\s+to\s+go\s+to\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
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
      return trimCompoundDestinationPhrase(match[1].trim());
    }
  }
  return null;
}

function trimCompoundDestinationPhrase(phrase: string): string {
  const trimmed = phrase.replace(/[™®.!?]+$/g, "").trim();
  const parts = trimmed.split(
    /\s+and\s+(?:help me|then|also)\b/i,
  );
  return parts[0]?.trim() ?? trimmed;
}
