/**
 * resolveEstatePlace™ — natural language → canonical place (Phase C).
 *
 * Routing priority:
 * 1. Exact canonical place name / alias (with navigation or bare destination)
 * 2. Explicit Estate object request
 * 3. Explicit activity request
 * 4. Shari suggestion (feelings / needs — never forced navigation)
 * 5. General conversation (none)
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see lib/estate/goToPlace.ts
 */

import {
  CANONICAL_ESTATE_REGISTRY,
  getCanonicalEstatePlaceById,
  resolveCanonicalPlaceIdFromAlias,
  type CanonicalEstatePlace,
} from "./canonicalEstateRegistry";
import {
  suggestCanonicalPlaceIds,
  suggestCanonicalPlaces,
} from "./canonicalPlaceSuggestions";
import {
  evaluateConversationEnvironmentNeed,
  isConversationEnvironmentOffer,
} from "./conversationDrivesNavigation";
import { toCanonicalEstatePlace } from "./directory";
import { extractRoomPhraseFromNavigation } from "./estateRoomAliasRegistry";
import { formatEstatePlaceSuggestionMenu } from "./estatePlaceIdentityLock";

export type EstatePlaceResolutionKind =
  | "exact-place"
  | "explicit-object"
  | "explicit-activity"
  | "suggestion"
  | "none";

export type EstatePlaceResolution = {
  kind: EstatePlaceResolutionKind;
  /** Set when navigation is approved (kinds 1–3) */
  placeId?: string;
  place?: CanonicalEstatePlace;
  /** Feeling-based suggestions — member chooses */
  suggestedPlaceIds?: readonly string[];
  suggestedPlaces?: readonly CanonicalEstatePlace[];
  confidence: "high" | "medium" | "low";
  reason: string;
  matchedAlias?: string;
  /** Pass through to goToPlace for activity workspaces */
  explicitActivityRequested?: boolean;
};

const NAV_VERB_RE =
  /\b(?:take me to|go to|let(?:'s| us) go to|open|show me|visit|head to|bring me to)\b/i;

const VAGUE_FEELING_RE =
  /\b(?:i want|i need|i'd like|i would like|i'm feeling|i feel|somewhere|something)\b/i;

const QUIET_FEELING_RE =
  /\b(?:quiet|peaceful|peace|calm|silence|stillness|somewhere quiet|need quiet|want quiet|sit somewhere)\b/i;

const CELEBRATE_FEELING_RE =
  /\b(?:celebrate|celebration|mark this moment|something to celebrate|want to celebrate)\b/i;

const LEARN_FEELING_RE =
  /\b(?:learn something|want to learn|need to learn|study something|discover something)\b/i;

/** Explicit object phrases → canonical collection / destination */
const EXPLICIT_OBJECT_RULES: {
  pattern: RegExp;
  placeId: string;
  reason: string;
}[] = [
  {
    pattern:
      /\b(?:accomplishments?\s+book|my\s+accomplishments?\s+book|the\s+accomplishments?\s+book|show\s+me\s+my\s+accomplishments)\b/i,
    placeId: "accomplishments-shelf",
    reason: "explicit object → Accomplishments Book™",
  },
  {
    pattern: /\b(?:celebration\s+room|celebration\s+garden|open\s+(?:the\s+)?celebration)\b/i,
    placeId: "celebration-room",
    reason: "explicit object → Celebration Room™",
  },
  {
    pattern: /\b(?:institute\s+cabinet|my\s+cabinet)\b/i,
    placeId: "institute-cabinet",
    reason: "explicit object → Institute Cabinet™",
  },
];

/** Wins vs proof routing (P0 canon — see docs/estate/P0_CANON_ERRATA.md) */
const WINS_AND_PROOF_RULES: {
  pattern: RegExp;
  placeId: string;
  reason: string;
}[] = [
  {
    pattern:
      /\b(?:evidence\s+vault|proof\s+of\s+(?:growth|impact)|proof\b|impact\s+stories?|people\s+(?:i|I've|I\s+have)\s+helped|difference\s+(?:i|I)\s+made|impact\s+(?:i|I've)\s+made)\b/i,
    placeId: "evidence-vault",
    reason: "impact/proof → Evidence Vault™",
  },
  {
    pattern: /\b(?:my\s+wins|show\s+(?:me\s+)?my\s+wins|story\s+of\s+my\s+wins)\b/i,
    placeId: "celebration-room",
    reason: "wins → Celebration Room™",
  },
];

/** Explicit activity — navigates only when member names the activity */
const EXPLICIT_ACTIVITY_RULES: {
  pattern: RegExp;
  placeId: string;
  reason: string;
}[] = [
  {
    pattern: /\b(?:clear\s+(?:my\s+)?mind|brain\s+dump)\b/i,
    placeId: "clear-my-mind",
    reason: "explicit activity → Clear My Mind™",
  },
  {
    pattern: /\bplan\s+my\s+day\b/i,
    placeId: "momentum-builder",
    reason: "explicit activity → Plan My Day / Momentum Builder™",
  },
  {
    pattern: /\bdecision\s+compass\b/i,
    placeId: "decision-compass",
    reason: "explicit activity → Decision Compass™",
  },
];

const FEELING_SUGGESTION_RE =
  /\b(?:quiet|quieter|peaceful|peace|calm|silence|stillness|celebrate|celebration|learn something|want to learn|need to learn|study something|fresh air|outside|outdoors|relax|unwind|inspiration|inspired|focus|concentrate|journal|think(?:ing)?)\b/i;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function stripPunctuation(text: string): string {
  return text.replace(/[™®.!?]+$/g, "").trim();
}

function hasNavigationIntent(text: string): boolean {
  return NAV_VERB_RE.test(text);
}

/** Member wants named place options — not navigation yet. */
export const PLACE_SUGGESTION_REQUEST_RE =
  /\b(?:suggest(?:ions?)?|recommend(?:ations?)?|give me|show me).{0,90}(?:places?|rooms?|spots?|where)\b/i;

export function isPlaceSuggestionRequest(text: string): boolean {
  if (hasNavigationIntent(text)) return false;
  const t = text.trim();
  if (!t) return false;
  if (PLACE_SUGGESTION_REQUEST_RE.test(t)) return true;
  if (
    /\b(?:quiet|peaceful|calm).{0,40}(?:places?|rooms?|spots?)\b/i.test(t) &&
    /\b(?:property|estate|go|suggest|where)\b/i.test(t)
  ) {
    return true;
  }
  if (/\bwhere (?:might|should|could) i go\b/i.test(t)) return true;
  if (/\bfew.{0,25}(?:quiet|peaceful).{0,25}places?\b/i.test(t)) return true;
  if (
    /\bwhat do you suggest\b/i.test(t) &&
    /\b(?:property|estate|somewhere|someplace|place to go|go)\b/i.test(t)
  ) {
    return true;
  }
  if (
    /\bwhat do you suggest\b/i.test(t) &&
    /\b(?:stress|stressed|quiet|peaceful|calm|overwhelm)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

function isVagueFeelingRequest(text: string): boolean {
  return VAGUE_FEELING_RE.test(text) && !hasNavigationIntent(text);
}

const QUIET_PHYSICAL_RE =
  /\b(?:somewhere|some place|a place|need somewhere|want somewhere).{0,40}(?:quiet|peaceful|calm)\b/i;

const STRESSED_QUIET_RE =
  /\b(?:stressed|stressful|overwhelm(?:ed)?|frazzled|anxious).{0,60}(?:quiet|peaceful|calm|somewhere)\b/i;

const UNSURE_PEACEFUL_RE =
  /\b(?:peaceful|quiet|calm).{0,50}(?:not sure|unsure|don't know|do not know)\b/i;

const AUDIO_MEDIA_RE =
  /\b(?:music|audio|soundscape|soundscapes|sounds?|listen|playlist|lo-?fi)\b/i;

/** PATH B — member wants a physical Estate place, not soundscapes. */
export function isPhysicalQuietPlaceRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (
    AUDIO_MEDIA_RE.test(t) &&
    !QUIET_PHYSICAL_RE.test(t) &&
    !STRESSED_QUIET_RE.test(t)
  ) {
    return false;
  }
  if (
    QUIET_PHYSICAL_RE.test(t) ||
    STRESSED_QUIET_RE.test(t) ||
    UNSURE_PEACEFUL_RE.test(t)
  ) {
    return true;
  }
  if (
    isVagueFeelingRequest(t) &&
    QUIET_FEELING_RE.test(t) &&
    !AUDIO_MEDIA_RE.test(t)
  ) {
    return true;
  }
  return false;
}

function buildNavigateResult(
  placeId: string,
  kind: Exclude<EstatePlaceResolutionKind, "suggestion" | "none">,
  reason: string,
  opts?: { matchedAlias?: string; explicitActivityRequested?: boolean },
): EstatePlaceResolution {
  const place = getCanonicalEstatePlaceById(placeId);
  return {
    kind,
    placeId,
    place,
    confidence: "high",
    reason,
    matchedAlias: opts?.matchedAlias,
    explicitActivityRequested: opts?.explicitActivityRequested,
  };
}

function longestAliasInText(
  text: string,
  opts?: { minLength?: number },
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
    for (const alias of place.aliases) {
      const normalizedAlias = normalize(alias);
      if (normalizedAlias.length < minLength) continue;
      if (!normalized.includes(normalizedAlias)) continue;
      if (
        best &&
        normalizedAlias.length === best.len &&
        place.category === "living-place" &&
        getCanonicalEstatePlaceById(best.placeId)?.category === "transition-space"
      ) {
        best = { placeId: place.id, alias: normalizedAlias, len: normalizedAlias.length };
        continue;
      }
      if (!best || normalizedAlias.length > best.len) {
        best = { placeId: place.id, alias: normalizedAlias, len: normalizedAlias.length };
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

function matchBareDestination(text: string): EstatePlaceResolution | null {
  const stripped = stripPunctuation(text);
  const normalized = normalize(stripped);
  if (!normalized || normalized.split(/\s+/).length > 8) return null;

  const exactId = resolveCanonicalPlaceIdFromAlias(normalized);
  if (exactId) {
    return buildNavigateResult(exactId, "exact-place", "bare destination alias", {
      matchedAlias: normalized,
    });
  }

  const withThe = resolveCanonicalPlaceIdFromAlias(`the ${normalized}`);
  if (withThe) {
    return buildNavigateResult(withThe, "exact-place", "bare destination alias", {
      matchedAlias: normalized,
    });
  }

  return null;
}

function matchWinsAndProof(text: string): EstatePlaceResolution | null {
  for (const rule of WINS_AND_PROOF_RULES) {
    if (!rule.pattern.test(text)) continue;
    return buildNavigateResult(rule.placeId, "explicit-object", rule.reason);
  }
  return null;
}

function matchExplicitObject(text: string): EstatePlaceResolution | null {
  for (const rule of EXPLICIT_OBJECT_RULES) {
    if (!rule.pattern.test(text)) continue;
    return buildNavigateResult(rule.placeId, "explicit-object", rule.reason);
  }
  return null;
}

function matchExplicitActivity(text: string): EstatePlaceResolution | null {
  for (const rule of EXPLICIT_ACTIVITY_RULES) {
    if (!rule.pattern.test(text)) continue;
    return buildNavigateResult(rule.placeId, "explicit-activity", rule.reason, {
      explicitActivityRequested: true,
    });
  }
  return null;
}

function matchConversationEnvironmentNeed(
  text: string,
): EstatePlaceResolution | null {
  const evaluation = evaluateConversationEnvironmentNeed(text);
  if (!isConversationEnvironmentOffer(evaluation)) return null;
  return {
    kind: "suggestion",
    suggestedPlaceIds: [...evaluation.suggestedPlaceIds],
    suggestedPlaces: evaluation.suggestedPlaces.map(toCanonicalEstatePlace),
    confidence: "medium",
    reason: evaluation.reasoning,
  };
}

function buildSuggestionFromRegistry(
  userText: string,
  reason: string,
): EstatePlaceResolution | null {
  const placeIds = suggestCanonicalPlaceIds(userText);
  if (!placeIds.length) return null;
  const suggestedPlaces = suggestCanonicalPlaces(userText);
  return {
    kind: "suggestion",
    suggestedPlaceIds: placeIds,
    suggestedPlaces,
    confidence: "medium",
    reason,
  };
}

function matchFeelingSuggestion(text: string): EstatePlaceResolution | null {
  const wantsSuggestions = isPlaceSuggestionRequest(text);
  const wantsQuietPlace = isPhysicalQuietPlaceRequest(text);

  const environmentNeed = matchConversationEnvironmentNeed(text);
  if (environmentNeed) return environmentNeed;

  if (!wantsQuietPlace && !wantsSuggestions) {
    if (!FEELING_SUGGESTION_RE.test(text)) return null;
  }

  return buildSuggestionFromRegistry(
    text,
    wantsQuietPlace
      ? "quiet/restorative request → canonical Estate places"
      : wantsSuggestions
        ? "place suggestion request → canonical registry menu"
        : "feeling → canonical registry suggestions",
  );
}

function matchNavigationDestination(text: string): EstatePlaceResolution | null {
  const destinationPhrase =
    extractRoomPhraseFromNavigation(text) ?? stripPunctuation(text);
  const match = longestAliasInText(destinationPhrase);
  if (!match) return null;

  return buildNavigateResult(match.placeId, "exact-place", "explicit navigation → place", {
    matchedAlias: match.alias,
  });
}

/**
 * Resolve member text to a canonical place decision.
 * Use `goToPlace` when kind is exact-place, explicit-object, or explicit-activity.
 */
export function resolveEstatePlace(userText: string): EstatePlaceResolution {
  const text = userText.trim();
  if (!text) {
    return { kind: "none", confidence: "low", reason: "empty text" };
  }

  if (isPlaceSuggestionRequest(text)) {
    const suggestion = matchFeelingSuggestion(text);
    if (suggestion) return suggestion;
  }

  // Priority 1: explicit navigation verb + place
  if (hasNavigationIntent(text)) {
    const nav = matchNavigationDestination(text);
    if (nav) return nav;
  }

  // Priority 2: wins / proof (P0) then explicit object
  const winsProof = matchWinsAndProof(text);
  if (winsProof) return winsProof;

  const objectMatch = matchExplicitObject(text);
  if (objectMatch) return objectMatch;

  // Bare destination without feeling wrapper ("apple orchard", "greenhouse")
  if (!isVagueFeelingRequest(text) && !isPlaceSuggestionRequest(text)) {
    const bare = matchBareDestination(text);
    if (bare) return bare;

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount <= 8) {
      const substring = longestAliasInText(text, { minLength: 4 });
      if (substring && !isVagueFeelingRequest(text)) {
        return buildNavigateResult(
          substring.placeId,
          "exact-place",
          "exact place alias in text",
          { matchedAlias: substring.alias },
        );
      }
    }
  }

  // Priority 3: explicit activity (may overlap place id)
  const activity = matchExplicitActivity(text);
  if (activity) return activity;

  // Priority 4: feelings → suggest only, never force
  const suggestion = matchFeelingSuggestion(text);
  if (suggestion) return suggestion;

  return { kind: "none", confidence: "low", reason: "no place match" };
}

/** True when resolution approves immediate navigation via goToPlace. */
export function shouldNavigateFromResolution(
  resolution: EstatePlaceResolution,
): resolution is EstatePlaceResolution & { placeId: string } {
  return (
    resolution.kind === "exact-place" ||
    resolution.kind === "explicit-object" ||
    resolution.kind === "explicit-activity"
  );
}

export function formatPlaceSuggestionLine(
  resolution: EstatePlaceResolution,
): string | null {
  if (resolution.kind !== "suggestion" || !resolution.suggestedPlaceIds?.length) {
    return null;
  }
  return formatEstatePlaceSuggestionMenu(resolution.suggestedPlaceIds);
}
