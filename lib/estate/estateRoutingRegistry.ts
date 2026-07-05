/**
 * Estate Routing Registry™ — single canonical routing map for every place,
 * subspace, object, and experience.
 *
 * All routing decisions derive from CANONICAL_ESTATE_REGISTRY + ambiguity groups here.
 * Do not hardcode room names in other files.
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see lib/estate/goToPlace.ts
 */

import {
  CANONICAL_ESTATE_REGISTRY,
  getCanonicalEstatePlaceById,
  inferRouteType,
  resolveCanonicalPlaceIdFromAlias,
  type CanonicalEstatePlace,
} from "./canonicalEstateRegistry";
import { formatEstatePlaceSuggestionMenu } from "./estatePlaceIdentityLock";
import { isPresenceModeRequest } from "./justBeHere";
import type { EstatePlaceResolution } from "./resolveEstatePlace";

export type EstateRoutingDecisionKind =
  | "navigate"
  | "suggest"
  | "presence"
  | "none";

export type EstateRoutingDecision = {
  kind: EstateRoutingDecisionKind;
  /** Resolved target — may be subspace/object id before parent resolution */
  placeId?: string;
  /** Parent room when navigating to subspace/object */
  parentPlaceId?: string;
  /** Subspace or object focus within parent */
  subspaceId?: string;
  sceneViewId?: string;
  suggestedPlaceIds?: readonly string[];
  menuIntro?: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  matchedAlias?: string;
  explicitActivityRequested?: boolean;
};

export type EstateRoutingContext = {
  /** Room the member is currently in — enables in-room subspace routing */
  currentPlaceId?: string | null;
};

/** Exclusive phrases → canonical place id (longest match wins). */
export const ESTATE_ROUTING_EXCLUSIVE_PHRASES: Readonly<Record<string, string>> =
  {
    "celebration garden": "gardens",
    "the celebration garden": "gardens",
    "estate garden": "estate-gardens",
    "the estate garden": "estate-gardens",
    "estate gardens": "estate-gardens",
    "the estate gardens": "estate-gardens",
    "butterfly conservatory": "conservatory",
    "the butterfly conservatory": "conservatory",
    "personal library": "personal-library",
    "the personal library": "personal-library",
    "estate library": "library",
    "the estate library": "library",
    "reading nook by the window": "window-seat",
    "the reading nook by the window": "window-seat",
    "stairway reading nook": "stairway-reading-nook",
    "the stairway reading nook": "stairway-reading-nook",
    "back deck": "back-deck",
    "the back deck": "back-deck",
    "personal deck": "personal-deck",
    "the personal deck": "personal-deck",
    "fireside deck": "fireside-deck",
    "the fireside deck": "fireside-deck",
    "seat at the pond": "seat-at-pond",
    "reflection pond": "reflection-pond",
    "the reflection pond": "reflection-pond",
    "music room": "music-room",
    "the music room": "music-room",
    pool: "summer-terrace",
    "the pool": "summer-terrace",
    "swimming pool": "summer-terrace",
    "the swimming pool": "summer-terrace",
    "discovery chest": "house-possibility-discovery-chest",
    "the discovery chest": "house-possibility-discovery-chest",
    "cabinet of chapters": "house-possibility-cabinet-of-chapters",
    "the cabinet of chapters": "house-possibility-cabinet-of-chapters",
    "legacy desk": "legacy-room-legacy-desk",
    "the legacy desk": "legacy-room-legacy-desk",
    "possibility house": "house-possibility-outside",
    "the possibility house": "house-possibility-outside",
    "legacy room": "house-possibility-legacy-room",
    "the legacy room": "house-possibility-legacy-room",
    "possibility observatory": "house-possibility-observatory",
    "the possibility observatory": "house-possibility-observatory",
    "treehouse observatory": "house-possibility-observatory",
    "the treehouse observatory": "house-possibility-observatory",
    "possibility staircase": "house-possibility-staircase",
    "the possibility staircase": "house-possibility-staircase",
    "possibility studio": "house-possibility-studio",
    "the possibility studio": "house-possibility-studio",
    "reflection desk": "house-possibility-reflection-desk",
    "the reflection desk": "house-possibility-reflection-desk",
    "reflection tree": "reflection-tree-main",
    "the reflection tree": "reflection-tree-main",
    "show me the greenhouse": "greenhouse",
    "the greenhouse": "greenhouse",
    greenhouse: "greenhouse",
  };

export type EstateRoutingAmbiguityGroup = {
  id: string;
  patterns: readonly RegExp[];
  intro: string;
  placeIds: readonly string[];
};

/** Ambiguous destination phrases → numbered choices (never guess). */
export const ESTATE_ROUTING_AMBIGUITY_GROUPS: readonly EstateRoutingAmbiguityGroup[] =
  [
    {
      id: "garden",
      patterns: [/^(?:the\s+)?garden$/i, /^(?:the\s+)?gardens$/i],
      intro: "We have a few garden spaces. Which one would you like?",
      placeIds: [
        "estate-gardens",
        "gardens",
        "conservatory",
        "greenhouse",
        "reflection-tree-main",
      ],
    },
    {
      id: "reading-nook",
      patterns: [/^(?:the\s+)?reading nook$/i, /^(?:the\s+)?nook$/i],
      intro: "We have a couple of reading nooks. Which one would you like?",
      placeIds: ["reading-nook", "stairway-reading-nook", "window-seat"],
    },
    {
      id: "telescope",
      patterns: [
        /^(?:the\s+)?telescope$/i,
        /\b(?:take me to|go to|show me|visit)\s+(?:the\s+)?telescope\b/i,
      ],
      intro: "A couple of places with a telescope — which one?",
      placeIds: [
        "observatory-telescope-window",
        "house-possibility-telescope-deck",
      ],
    },
    {
      id: "observatory",
      patterns: [
        /^(?:the\s+)?observatory$/i,
        /\b(?:take me to|go to|show me|visit)\s+(?:the\s+)?observatory\b/i,
      ],
      intro: "We have two observatories — the Treehouse and the main Estate. Which one?",
      placeIds: ["house-possibility-observatory", "observatory"],
    },
    {
      id: "pond",
      patterns: [/^(?:the\s+)?pond$/i],
      intro: "We have a couple of pond spaces — which sounds better?",
      placeIds: ["seat-at-pond", "reflection-pond"],
    },
  ];

const NAV_VERB_RE =
  /\b(?:take me to|go to|let(?:'s| us) go to|open|show me|visit|head to|bring me to)\b/i;

const OBJECT_VERB_RE =
  /\b(?:open|show me|show|view|bring me to|take me to)\b/i;

/** Story/orientation about a place — not navigation (Spec 108, estate guide). */
const ESTATE_INFORMATIONAL_PLACE_RE =
  /\b(?:tell me about|what is|what's|why was|history of|what(?:'s| is) special about)\s+(?:the\s+)?/i;

function isInformationalPlaceQuestion(text: string): boolean {
  if (!ESTATE_INFORMATIONAL_PLACE_RE.test(text)) return false;
  if (hasNavigationIntent(text)) return false;
  return Boolean(longestAliasInText(text, { minLength: 3 }));
}

/** Exported for resolveEstatePlace — story questions must not navigate. */
export function isInformationalEstatePlaceQuestion(text: string): boolean {
  return isInformationalPlaceQuestion(text);
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function stripPunctuation(text: string): string {
  return text.replace(/[™®.!?]+$/g, "").trim();
}

function stripNavigationVerbs(text: string): string {
  return stripPunctuation(
    text
      .replace(
        /\b(?:take me to|go to|let(?:'s| us) go to|open|show me|visit|head to|bring me to|can we go to)\s+(?:the\s+)?/i,
        "",
      )
      .trim(),
  );
}

function hasNavigationIntent(text: string): boolean {
  return NAV_VERB_RE.test(text);
}

function matchExclusivePhrase(text: string): EstateRoutingDecision | null {
  const normalized = normalize(stripPunctuation(text));
  if (!normalized) return null;

  let best: { phrase: string; placeId: string } | null = null;
  for (const [phrase, placeId] of Object.entries(
    ESTATE_ROUTING_EXCLUSIVE_PHRASES,
  )) {
    const np = normalize(phrase);
    if (normalized === np || normalized.includes(np)) {
      if (!best || np.length > best.phrase.length) {
        best = { phrase: np, placeId };
      }
    }
  }
  if (!best) return null;

  return buildNavigateDecision(best.placeId, "exclusive phrase match", {
    matchedAlias: best.phrase,
  });
}

function longestAliasInText(
  text: string,
  opts?: { minLength?: number; parentPlaceId?: string | null },
): { placeId: string; alias: string } | null {
  const normalized = normalize(stripPunctuation(text));
  if (!normalized) return null;

  const exactId = resolveCanonicalPlaceIdFromAlias(normalized);
  if (exactId) {
    return { placeId: exactId, alias: normalized };
  }

  const minLength = opts?.minLength ?? 3;
  let best: { placeId: string; alias: string; len: number } | null = null;

  for (const place of CANONICAL_ESTATE_REGISTRY) {
    if (
      opts?.parentPlaceId &&
      place.parentPlaceId &&
      place.parentPlaceId !== opts.parentPlaceId
    ) {
      continue;
    }

    for (const alias of place.aliases) {
      const normalizedAlias = normalize(alias);
      if (normalizedAlias.length < minLength) continue;
      if (!normalized.includes(normalizedAlias)) continue;
      if (!best || normalizedAlias.length > best.len) {
        best = {
          placeId: place.id,
          alias: normalizedAlias,
          len: normalizedAlias.length,
        };
      }
    }
    const official = normalize(place.officialName);
    if (official.length >= minLength && normalized.includes(official)) {
      if (!best || official.length > best.len) {
        best = { placeId: place.id, alias: official, len: official.length };
      }
    }
  }

  if (!best) return null;
  return { placeId: best.placeId, alias: best.alias };
}

function matchAmbiguityGroup(
  text: string,
  context?: EstateRoutingContext,
): EstateRoutingDecision | null {
  const stripped = stripNavigationVerbs(text);
  const probe = stripped || text.trim();

  for (const group of ESTATE_ROUTING_AMBIGUITY_GROUPS) {
    if (!group.patterns.some((p) => p.test(probe))) continue;

    const placeIds = group.placeIds.filter(
      (id) => id !== context?.currentPlaceId,
    );
    if (placeIds.length < 2) continue;

    return {
      kind: "suggest",
      suggestedPlaceIds: placeIds.slice(0, 4),
      menuIntro: formatEstatePlaceSuggestionMenu(placeIds.slice(0, 4), {
        intro: group.intro,
      }),
      confidence: "high",
      reason: `ambiguous destination → ${group.id}`,
    };
  }
  return null;
}

function resolveInRoomSubspace(
  text: string,
  currentPlaceId: string,
): EstateRoutingDecision | null {
  const parentId = resolveCanonicalParentId(currentPlaceId);
  const match = longestAliasInText(text, {
    minLength: 4,
    parentPlaceId: parentId,
  });
  if (!match) return null;

  const place = getCanonicalEstatePlaceById(match.placeId);
  if (!place) return null;

  const routeType = inferRouteType(place);
  if (
    place.parentPlaceId === parentId &&
    (routeType === "subspace" || routeType === "object")
  ) {
    return buildNavigateDecision(match.placeId, "in-room subspace/object", {
      matchedAlias: match.alias,
    });
  }
  return null;
}

/** Parent room id for a place (self if top-level room). */
export function resolveCanonicalParentId(placeId: string): string {
  const place = getCanonicalEstatePlaceById(placeId);
  if (!place) return placeId;
  const routeType = inferRouteType(place);
  if (
    (routeType === "subspace" || routeType === "object") &&
    place.parentPlaceId
  ) {
    return place.parentPlaceId;
  }
  return place.id;
}

export type EstateNavigationTarget = {
  navigatePlaceId: string;
  subspaceId?: string;
  sceneViewId?: string;
  focusPlace: CanonicalEstatePlace;
};

/** Resolve subspace/object → parent navigation target. */
export function resolveNavigationTarget(
  placeId: string,
): EstateNavigationTarget | null {
  const place = getCanonicalEstatePlaceById(placeId);
  if (!place) return null;

  const routeType = inferRouteType(place);
  if (
    (routeType === "subspace" || routeType === "object") &&
    place.parentPlaceId
  ) {
    const parent = getCanonicalEstatePlaceById(place.parentPlaceId);
    if (!parent) return null;
    return {
      navigatePlaceId: parent.id,
      subspaceId: place.id,
      sceneViewId: place.sceneViewId,
      focusPlace: place,
    };
  }

  return {
    navigatePlaceId: place.id,
    focusPlace: place,
    sceneViewId: place.sceneViewId,
  };
}

function buildNavigateDecision(
  placeId: string,
  reason: string,
  opts?: { matchedAlias?: string; explicitActivityRequested?: boolean },
): EstateRoutingDecision {
  const target = resolveNavigationTarget(placeId);
  if (!target) {
    return { kind: "none", confidence: "low", reason: `unknown place ${placeId}` };
  }

  return {
    kind: "navigate",
    placeId: target.navigatePlaceId,
    parentPlaceId: target.subspaceId ? target.navigatePlaceId : undefined,
    subspaceId: target.subspaceId,
    sceneViewId: target.sceneViewId,
    confidence: "high",
    reason,
    matchedAlias: opts?.matchedAlias,
    explicitActivityRequested: opts?.explicitActivityRequested,
  };
}

/**
 * Single routing entry point — registry-driven decisions only.
 * Never routes to Home on uncertainty; returns suggest or none instead.
 */
export function resolveEstateRoutingDecision(
  userText: string,
  context: EstateRoutingContext = {},
): EstateRoutingDecision {
  const text = userText.trim();
  if (!text) {
    return { kind: "none", confidence: "low", reason: "empty text" };
  }

  if (isPresenceModeRequest(text)) {
    return {
      kind: "presence",
      confidence: "high",
      reason: "presence mode — enjoy the room",
    };
  }

  if (isInformationalPlaceQuestion(text)) {
    return {
      kind: "none",
      confidence: "high",
      reason: "informational place question — estate guide, not navigation",
    };
  }

  if (context.currentPlaceId) {
    const inRoom = resolveInRoomSubspace(text, context.currentPlaceId);
    if (inRoom) return inRoom;
  }

  const exclusive = matchExclusivePhrase(text);
  if (exclusive) return exclusive;

  if (hasNavigationIntent(text) || OBJECT_VERB_RE.test(text)) {
    const phrase = stripNavigationVerbs(text) || text;
    const match = longestAliasInText(phrase, { minLength: 3 });
    if (match) {
      return buildNavigateDecision(match.placeId, "navigation → registry alias", {
        matchedAlias: match.alias,
      });
    }
  }

  const ambiguous = matchAmbiguityGroup(text, context);
  if (ambiguous) return ambiguous;

  const bare = stripPunctuation(text);
  const bareNorm = normalize(bare);
  if (bareNorm && bareNorm.split(/\s+/).length <= 6) {
    const exactId = resolveCanonicalPlaceIdFromAlias(bareNorm);
    if (exactId) {
      return buildNavigateDecision(exactId, "bare destination alias", {
        matchedAlias: bareNorm,
      });
    }
    const withThe = resolveCanonicalPlaceIdFromAlias(`the ${bareNorm}`);
    if (withThe) {
      return buildNavigateDecision(withThe, "bare destination alias", {
        matchedAlias: bareNorm,
      });
    }
  }

  if (!hasNavigationIntent(text)) {
    const substring = longestAliasInText(text, { minLength: 5 });
    if (substring) {
      return buildNavigateDecision(substring.placeId, "registry alias in text", {
        matchedAlias: substring.alias,
      });
    }
  }

  return { kind: "none", confidence: "low", reason: "no registry routing match" };
}

/** Adapter — convert routing decision to existing place resolution shape. */
export function routingDecisionToPlaceResolution(
  decision: EstateRoutingDecision,
): EstatePlaceResolution {
  if (decision.kind === "presence") {
    return {
      kind: "none",
      confidence: "high",
      reason: decision.reason,
    };
  }

  if (decision.kind === "suggest") {
    const suggestedPlaces = (decision.suggestedPlaceIds ?? [])
      .map((id) => getCanonicalEstatePlaceById(id))
      .filter((p): p is CanonicalEstatePlace => Boolean(p));
    return {
      kind: "suggestion",
      suggestedPlaceIds: decision.suggestedPlaceIds,
      suggestedPlaces,
      confidence: decision.confidence,
      reason: decision.reason,
    };
  }

  if (decision.kind === "navigate" && decision.placeId) {
    const focusId = decision.subspaceId ?? decision.placeId;
    const place = getCanonicalEstatePlaceById(focusId);
    const routeType = place ? inferRouteType(place) : "room";
    const kind =
      routeType === "object"
        ? "explicit-object"
        : routeType === "subspace"
          ? "exact-place"
          : "exact-place";

    return {
      kind,
      placeId: decision.subspaceId ?? decision.placeId,
      place,
      confidence: decision.confidence,
      reason: decision.reason,
      matchedAlias: decision.matchedAlias,
      explicitActivityRequested: decision.explicitActivityRequested,
    };
  }

  return {
    kind: "none",
    confidence: decision.confidence,
    reason: decision.reason,
  };
}

/** Lookup place by id — re-export for routing consumers. */
export function getEstateRoutingPlace(
  placeId: string,
): CanonicalEstatePlace | undefined {
  return getCanonicalEstatePlaceById(placeId);
}

/** All registered place ids. */
export function listEstateRoutingPlaceIds(): readonly string[] {
  return CANONICAL_ESTATE_REGISTRY.map((p) => p.id);
}
