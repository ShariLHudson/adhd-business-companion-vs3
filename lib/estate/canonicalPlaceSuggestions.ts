/**
 * Canonical Place Suggestions — ALL menus from registry records only.
 *
 * @see canonicalEstateRegistry.ts
 */

import {
  getEstateDirectoryEntriesForProfile,
  getEstateDirectoryEntry,
  toCanonicalEstatePlace,
} from "./directory";
import type {
  CanonicalEstatePlace,
  CanonicalSuggestionProfile,
} from "./canonicalEstateRegistryTypes";
import {
  shouldBlockScenicOverwhelmMenu,
  wantsScenicCalmPlaces,
} from "@/lib/conversation/overwhelmNeedClassifier";
import {
  mayOfferScenicPlaceSuggestions,
  scenicPlaceSuggestionCount,
} from "@/lib/estate/scenicPlaceSuggestionPolicy";

export const CANONICAL_PLACE_SUGGESTION_MAX = 3;

export const NO_CANONICAL_PLACE_SUGGESTIONS_LINE =
  "No suggestions available right now — we can stay here or name a place from the Estate map.";

const PLACE_SUGGESTION_REQUEST_RE =
  /\b(?:suggest(?:ions?)?|recommend(?:ations?)?|give me|show me).{0,90}(?:places?|rooms?|spots?|where)\b/i;

const QUIET_PHYSICAL_RE =
  /\b(?:somewhere|some place|a place|need somewhere|want somewhere).{0,40}(?:quiet|peaceful|calm)\b/i;

const STRESSED_QUIET_RE =
  /\b(?:stress(?:ed|ful)?|anxious|overwhelm(?:ed|ing)?).{0,50}(?:quiet|peaceful|calm|somewhere)\b/i;

function isPlaceSuggestionRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/\b(?:take me to|go to|visit|head to|bring me to)\b/i.test(t)) return false;
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

function isPhysicalQuietPlaceRequest(text: string): boolean {
  const t = text.trim();
  if (!t || /\b(?:take me to|go to|visit)\b/i.test(t)) return false;
  return (
    QUIET_PHYSICAL_RE.test(t) ||
    STRESSED_QUIET_RE.test(t) ||
    /\b(?:need|want).{0,20}(?:quiet|peaceful|calm)\s+place\b/i.test(t)
  );
}

const QUIET_RE =
  /\b(?:quiet|peaceful|peace|calm|silence|stillness|somewhere quiet|need quiet|want quiet|hush|de-stress|destress)\b/i;

/** Scenic overwhelm only — not cognitive unload / task breakdown. */
const OVERWHELMED_RE =
  /\b(?:overwhelm(?:ed|ing)?|can'?t cope|drowning|fried|burnt?\s*out|shutdown)\b/i;

const STRESSED_RE =
  /\b(?:stress(?:ed|ful)?|anxious|anxiety|tense|on edge|wound up|frazzled)\b/i;

const CURIOUS_RE =
  /\b(?:curious|wonder(?:ing)?|explore|discover|learn more|what if)\b/i;

const CELEBRATORY_RE =
  /\b(?:celebrat(?:e|ion|ing)(?:\s+(?:this|that|it|my|our|a))|want to celebrate|something to celebrate|accomplish(?:ment|ed)|milestone|worth celebrating)\b/i;

const REFLECTIVE_RE =
  /\b(?:reflect(?:ion|ive)?|think(?:ing)? through|process this|sit with|ponder|journal)\b/i;

const CREATIVE_RE =
  /\b(?:creat(?:e|ive|ivity)|make something|design|draft|build something|art)\b/i;

const REST_RE =
  /\b(?:rest|restore|recover|recharge|breathe|unwind|wind down|slow down)\b/i;

const LEARN_ACTIVITY_RE =
  /\b(?:want to learn|need to learn|learn something|study|read up|understand more)\b/i;

const THINK_ACTIVITY_RE =
  /\b(?:want to think|need to think|think about|figure out|sort through|clear my head)\b/i;

const REST_ACTIVITY_RE =
  /\b(?:want to rest|need to rest|just rest|need a break|take a break)\b/i;

const CELEBRATE_ACTIVITY_RE =
  /\b(?:want to celebrate|celebrate something|something to celebrate)\b/i;

const UNCERTAIN_RE =
  /\b(?:don'?t know where|not sure where|where should i go|where do i go|no idea where|anywhere is fine)\b/i;

const PROFILE_DETECTORS: readonly {
  profile: CanonicalSuggestionProfile;
  pattern: RegExp;
}[] = [
  { profile: "quiet", pattern: QUIET_RE },
  { profile: "overwhelmed", pattern: OVERWHELMED_RE },
  { profile: "stressed", pattern: STRESSED_RE },
  { profile: "celebrate", pattern: CELEBRATORY_RE },
  { profile: "celebrate", pattern: CELEBRATE_ACTIVITY_RE },
  { profile: "learn", pattern: LEARN_ACTIVITY_RE },
  { profile: "think", pattern: THINK_ACTIVITY_RE },
  { profile: "rest", pattern: REST_RE },
  { profile: "rest", pattern: REST_ACTIVITY_RE },
  { profile: "curious", pattern: CURIOUS_RE },
  { profile: "reflective", pattern: REFLECTIVE_RE },
  { profile: "creative", pattern: CREATIVE_RE },
  { profile: "uncertain", pattern: UNCERTAIN_RE },
];

/** Detect the highest-priority suggestion profile for member text. */
export function detectCanonicalSuggestionProfile(
  userText: string,
): CanonicalSuggestionProfile | null {
  const text = userText.trim();
  if (!text) return null;

  // Global gate: no unsolicited scenic / mood → place menus from ordinary chat.
  if (!mayOfferScenicPlaceSuggestions(text)) {
    return null;
  }

  // Cognitive unload / task breakdown must never open scenic place menus.
  if (shouldBlockScenicOverwhelmMenu(text) && !wantsScenicCalmPlaces(text)) {
    return null;
  }

  if (
    isPlaceSuggestionRequest(text) ||
    isPhysicalQuietPlaceRequest(text) ||
    QUIET_RE.test(text) ||
    /\bcalming\b/i.test(text)
  ) {
    return "quiet";
  }

  for (const { profile, pattern } of PROFILE_DETECTORS) {
    if (profile === "quiet") continue;
    if (profile === "overwhelmed" && shouldBlockScenicOverwhelmMenu(text)) {
      continue;
    }
    if (pattern.test(text)) return profile;
  }

  if (/\b(?:suggest|recommend).{0,40}(?:place|room|estate|property)\b/i.test(text)) {
    return "orient";
  }

  return null;
}

/** Places from directory tagged for a profile — stable canon document order. */
export function suggestCanonicalPlacesForProfile(
  profile: CanonicalSuggestionProfile,
  max = CANONICAL_PLACE_SUGGESTION_MAX,
): CanonicalEstatePlace[] {
  return getEstateDirectoryEntriesForProfile(profile, max).map(
    toCanonicalEstatePlace,
  );
}

export function suggestCanonicalPlaceIds(
  userText: string,
  max = CANONICAL_PLACE_SUGGESTION_MAX,
): string[] {
  if (!mayOfferScenicPlaceSuggestions(userText)) {
    return [];
  }

  const cappedMax = Math.min(max, scenicPlaceSuggestionCount(userText) || max);

  const profile =
    detectCanonicalSuggestionProfile(userText) ??
    (/\b(?:somewhere|some place|a place)\b/i.test(userText) ? "orient" : null);

  if (!profile) return [];

  const places = suggestCanonicalPlacesForProfile(profile, cappedMax);
  if (places.length > 0) {
    return places.map((place) => place.id);
  }

  if (profile !== "orient") {
    return suggestCanonicalPlacesForProfile("orient", cappedMax).map(
      (place) => place.id,
    );
  }

  return [];
}

export function suggestCanonicalPlaces(
  userText: string,
  max = CANONICAL_PLACE_SUGGESTION_MAX,
): CanonicalEstatePlace[] {
  return suggestCanonicalPlaceIds(userText, max)
    .map((id) => getEstateDirectoryEntry(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .map(toCanonicalEstatePlace);
}
