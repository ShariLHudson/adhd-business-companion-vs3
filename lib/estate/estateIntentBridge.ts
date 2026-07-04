/**
 * Estate Intent Bridge™ (Phase H.1) — natural language + emotional intent → canonical places.
 *
 * Understanding only. Does not navigate, open UI, or call goToPlace.
 * Consumers decide whether to suggest (confidence < 0.7) or route (confidence ≥ 0.7).
 *
 * Priority:
 * 1. Exact canonical match (registry id / alias)
 * 2. Alias substring match (registry)
 * 3. Descriptive phrase match (intent lexicon)
 * 4. Emotional / activity intent → suggestions (never forced below threshold)
 *
 * @see docs/estate/PHASE_H1_INTENT_BRIDGE.md
 * @see lib/estate/canonicalEstateRegistry.ts
 */

import {
  CANONICAL_ESTATE_REGISTRY,
  getCanonicalEstatePlaceById,
  resolveCanonicalPlaceId,
  resolveCanonicalPlaceIdFromAlias,
} from "./canonicalEstateRegistry";
import {
  suggestCanonicalPlaceIds,
  suggestCanonicalPlacesForProfile,
} from "./canonicalPlaceSuggestions";
import {
  evaluateConversationEnvironmentNeed,
  isConversationEnvironmentOffer,
} from "./conversationDrivesNavigation";
import {
  isPositiveSentimentWithoutCelebration,
  isRelationshipConversation,
} from "@/lib/intentAwareConversation/routingGate";
import type { CanonicalSuggestionProfile } from "./canonicalEstateRegistryTypes";

/** Minimum confidence before a consumer may auto-route (never force below this). */
export const ESTATE_INTENT_AUTO_ROUTE_CONFIDENCE = 0.7;

export const ESTATE_INTENT_MAX_SUGGESTIONS = 3;

export type EstateIntentBridgeInput = {
  /** Member phrase — full utterance */
  text: string;
  /** Current canonical place — preserved when member did not ask to move */
  currentPlaceId?: string | null;
};

export type EstateIntentBridgeResult = {
  primaryPlaceId: string | null;
  suggestedPlaceIds: string[];
  confidence: number;
  /** Internal trace for dev / observation — not member-facing copy */
  reasoning: string;
};

const MOVE_INTENT_RE =
  /\b(?:take me|bring me|go to|let(?:'s| us) go|head to|visit|show me|open|can we go|want to go|need to go)\b/i;

const UNCERTAIN_RE =
  /\b(?:don'?t know where|not sure where|where should i go|where do i go|no idea where|anywhere is fine|don'?t know)\b/i;

const QUIET_RE =
  /\b(?:quiet|peaceful|peace|calm|silence|stillness|somewhere quiet|need quiet|want quiet|hush)\b/i;

const OVERWHELMED_RE =
  /\b(?:overwhelm(?:ed|ing)?|too much|can'?t cope|drowning|fried|burnt?\s*out|shutdown)\b/i;

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

/** Descriptive member language → canonical place (registry ids only). */
const DESCRIPTIVE_PHRASE_RULES: readonly {
  pattern: RegExp;
  placeId: string;
  reason: string;
  confidence: number;
}[] = [
  {
    pattern: /\b(?:plant place|flower room|plant room|green place|growing room)\b/i,
    placeId: "greenhouse",
    reason: "descriptive → Greenhouse™",
    confidence: 0.82,
  },
  {
    pattern: /\b(?:book corner|book nook|cozy read|somewhere to read)\b/i,
    placeId: "reading-nook",
    reason: "descriptive → Reading Nook",
    confidence: 0.8,
  },
  {
    pattern: /\b(?:coffee place|espresso|latte spot|cafe)\b/i,
    placeId: "coffee-house",
    reason: "descriptive → Coffee House™",
    confidence: 0.78,
  },
  {
    pattern: /\b(?:art studio|maker space|creative space)\b/i,
    placeId: "creative-studio",
    reason: "descriptive → Create",
    confidence: 0.8,
  },
  {
    pattern: /\b(?:gallery|show my work|creative archive)\b/i,
    placeId: "portfolio",
    reason: "descriptive → Portfolio™ (creative archive)",
    confidence: 0.76,
  },
  {
    pattern: /\b(?:deck|fireside|outside sit)\b/i,
    placeId: "back-deck",
    reason: "descriptive → Back Deck",
    confidence: 0.74,
  },
  {
    pattern: /\b(?:porch swing|swing on the porch)\b/i,
    placeId: "porch-swing",
    reason: "descriptive → Porch Swing",
    confidence: 0.78,
  },
  {
    pattern: /\b(?:garden path|walk the garden|garden walk)\b/i,
    placeId: "garden-path",
    reason: "descriptive → Garden Path",
    confidence: 0.76,
  },
  {
    pattern: /\b(?:pond|by the water|water's edge)\b/i,
    placeId: "seat-at-pond",
    reason: "descriptive → Seat at the Pond",
    confidence: 0.76,
  },
  {
    pattern:
      /\b(?:quiet corner(?:\s+by(?:\s+the)?\s+pond)?|corner by the pond|quiet nook by the pond|nook by the pond)\b/i,
    placeId: "reading-nook",
    reason: "descriptive quiet-by-pond → Reading Nook",
    confidence: 0.84,
  },
  {
    pattern:
      /\b(?:peaceful garden area|some spot in the garden|spot in the garden)\b/i,
    placeId: "garden-path",
    reason: "descriptive garden area → Garden Path",
    confidence: 0.78,
  },
  {
    pattern: /\b(?:lovely place outside|place outside|somewhere outside)\b/i,
    placeId: "back-deck",
    reason: "descriptive outside → Back Deck",
    confidence: 0.76,
  },
  {
    pattern: /\b(?:orchard|apple trees)\b/i,
    placeId: "apple-orchard",
    reason: "descriptive → Apple Orchard™",
    confidence: 0.78,
  },
  {
    pattern: /\b(?:institute|classroom)\b/i,
    placeId: "momentum-institute",
    reason: "descriptive → Momentum Institute™",
    confidence: 0.75,
  },
  {
    pattern: /\b(?:study hall)\b/i,
    placeId: "study-hall",
    reason: "descriptive → Study Hall™",
    confidence: 0.8,
  },
  {
    pattern: /\b(?:momentum room)\b/i,
    placeId: "momentum-room",
    reason: "descriptive → Momentum Room™",
    confidence: 0.8,
  },
  {
    pattern: /\b(?:stars|look up|night sky)\b/i,
    placeId: "observatory",
    reason: "descriptive → Observatory™",
    confidence: 0.74,
  },
];

/** Emotional tone → canonical suggestion profile (ids from registry only). */
const EMOTIONAL_PROFILE_MAP: readonly {
  pattern: RegExp;
  profile: CanonicalSuggestionProfile;
  label: string;
}[] = [
  { pattern: OVERWHELMED_RE, profile: "overwhelmed", label: "overwhelmed" },
  { pattern: STRESSED_RE, profile: "stressed", label: "stressed" },
  { pattern: CURIOUS_RE, profile: "curious", label: "curious" },
  { pattern: CELEBRATORY_RE, profile: "celebrate", label: "celebratory" },
  { pattern: REFLECTIVE_RE, profile: "reflective", label: "reflective" },
  { pattern: CREATIVE_RE, profile: "creative", label: "creative" },
  { pattern: REST_RE, profile: "rest", label: "rest" },
  { pattern: QUIET_RE, profile: "quiet", label: "quiet" },
];

/** Activity intent → canonical suggestion profile. */
const ACTIVITY_PROFILE_MAP: readonly {
  pattern: RegExp;
  profile: CanonicalSuggestionProfile;
  label: string;
  primaryConfidence: number;
}[] = [
  {
    pattern: LEARN_ACTIVITY_RE,
    profile: "learn",
    label: "learn",
    primaryConfidence: 0.68,
  },
  {
    pattern: THINK_ACTIVITY_RE,
    profile: "think",
    label: "think",
    primaryConfidence: 0.66,
  },
  {
    pattern: REST_ACTIVITY_RE,
    profile: "rest",
    label: "rest",
    primaryConfidence: 0.65,
  },
  {
    pattern: CELEBRATE_ACTIVITY_RE,
    profile: "celebrate",
    label: "celebrate",
    primaryConfidence: 0.72,
  },
];

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function stripPunctuation(text: string): string {
  return text.replace(/[™®.,!?]+/g, " ").replace(/\s+/g, " ").trim();
}

function hasMoveIntent(text: string): boolean {
  return MOVE_INTENT_RE.test(text);
}

function filterValidPlaceIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const id = resolveCanonicalPlaceId(raw);
    if (!getCanonicalEstatePlaceById(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function capSuggestions(ids: readonly string[]): string[] {
  return filterValidPlaceIds(ids).slice(0, ESTATE_INTENT_MAX_SUGGESTIONS);
}

function longestRegistryAliasInText(
  text: string,
): { placeId: string; alias: string; confidence: number } | null {
  const normalized = normalize(stripPunctuation(text));
  if (!normalized) return null;

  const exactId = resolveCanonicalPlaceIdFromAlias(normalized);
  if (exactId) {
    return { placeId: exactId, alias: normalized, confidence: 0.95 };
  }

  const withThe = resolveCanonicalPlaceIdFromAlias(`the ${normalized}`);
  if (withThe) {
    return { placeId: withThe, alias: normalized, confidence: 0.93 };
  }

  let best: { placeId: string; alias: string; len: number } | null = null;

  for (const place of CANONICAL_ESTATE_REGISTRY) {
    const candidates = [
      ...place.aliases.map(normalize),
      normalize(place.officialName),
      place.id,
    ];
    for (const alias of candidates) {
      if (alias.length < 3) continue;
      if (!normalized.includes(alias)) continue;
      if (!best || alias.length > best.len) {
        best = { placeId: place.id, alias, len: alias.length };
      }
    }
  }

  if (!best) return null;

  const lenBoost = Math.min(0.12, (best.len - 3) * 0.015);
  const moveBoost = hasMoveIntent(text) ? 0.05 : 0;
  const confidence = Math.min(0.92, 0.72 + lenBoost + moveBoost);

  return { placeId: best.placeId, alias: best.alias, confidence };
}

function matchDescriptive(
  text: string,
): { placeId: string; confidence: number; reason: string } | null {
  for (const rule of DESCRIPTIVE_PHRASE_RULES) {
    if (!rule.pattern.test(text)) continue;
    if (!getCanonicalEstatePlaceById(rule.placeId)) continue;
    const moveBoost = hasMoveIntent(text) ? 0.06 : 0;
    return {
      placeId: rule.placeId,
      confidence: Math.min(0.9, rule.confidence + moveBoost),
      reason: rule.reason,
    };
  }
  return null;
}

function matchEmotional(
  text: string,
): { placeIds: string[]; label: string } | null {
  for (const rule of EMOTIONAL_PROFILE_MAP) {
    if (!rule.pattern.test(text)) continue;
    const placeIds = suggestCanonicalPlacesForProfile(rule.profile).map(
      (place) => place.id,
    );
    if (!placeIds.length) continue;
    return { placeIds: capSuggestions(placeIds), label: rule.label };
  }
  return null;
}

function matchActivity(
  text: string,
): {
  placeIds: string[];
  label: string;
  primaryConfidence: number;
} | null {
  for (const rule of ACTIVITY_PROFILE_MAP) {
    if (!rule.pattern.test(text)) continue;
    const placeIds = suggestCanonicalPlacesForProfile(rule.profile).map(
      (place) => place.id,
    );
    if (!placeIds.length) continue;
    return {
      placeIds: capSuggestions(placeIds),
      label: rule.label,
      primaryConfidence: rule.primaryConfidence,
    };
  }
  return null;
}

function buildResult(
  partial: Omit<EstateIntentBridgeResult, "suggestedPlaceIds"> & {
    suggestedPlaceIds?: readonly string[];
  },
): EstateIntentBridgeResult {
  const suggested = capSuggestions(
    partial.suggestedPlaceIds ??
      (partial.primaryPlaceId ? [partial.primaryPlaceId] : []),
  );

  const primary =
    partial.confidence >= ESTATE_INTENT_AUTO_ROUTE_CONFIDENCE
      ? partial.primaryPlaceId
      : null;

  if (
    primary &&
    !suggested.includes(primary) &&
    suggested.length < ESTATE_INTENT_MAX_SUGGESTIONS
  ) {
    suggested.unshift(primary);
  }

  return {
    primaryPlaceId: primary,
    suggestedPlaceIds: suggested.slice(0, ESTATE_INTENT_MAX_SUGGESTIONS),
    confidence: partial.confidence,
    reasoning: partial.reasoning,
  };
}

/**
 * Translate member language into canonical Estate place understanding.
 * Never navigates — returns confidence-gated primary + gentle suggestions.
 */
export function resolveEstateIntent(
  input: EstateIntentBridgeInput,
): EstateIntentBridgeResult {
  const text = input.text.trim();
  if (!text) {
    return buildResult({
      primaryPlaceId: null,
      confidence: 0,
      reasoning: "empty utterance — no place inference",
    });
  }

  if (isRelationshipConversation(text) || isPositiveSentimentWithoutCelebration(text)) {
    return buildResult({
      primaryPlaceId: null,
      confidence: 0,
      reasoning: "relationship conversation — stay in chat, no place inference",
    });
  }

  const memberWantsMove = hasMoveIntent(text);

  // Priority 1–2: registry exact / alias
  const registryMatch = longestRegistryAliasInText(text);
  if (registryMatch) {
    return buildResult({
      primaryPlaceId: registryMatch.placeId,
      suggestedPlaceIds: [registryMatch.placeId],
      confidence: registryMatch.confidence,
      reasoning: `registry alias "${registryMatch.alias}" → ${registryMatch.placeId}`,
    });
  }

  // Priority 3: descriptive references ("plant place", "book corner")
  const descriptive = matchDescriptive(text);
  if (descriptive) {
    return buildResult({
      primaryPlaceId: descriptive.placeId,
      suggestedPlaceIds: [descriptive.placeId],
      confidence: descriptive.confidence,
      reasoning: descriptive.reason,
    });
  }

  // Conversation Drives Navigation — environmental need before generic emotion buckets
  const environmentNeed = evaluateConversationEnvironmentNeed(text);
  if (isConversationEnvironmentOffer(environmentNeed)) {
    return buildResult({
      primaryPlaceId: null,
      suggestedPlaceIds: [...environmentNeed.suggestedPlaceIds],
      confidence: environmentNeed.confidence,
      reasoning: environmentNeed.reasoning,
    });
  }

  // Activity intent (often clearer than pure emotion)
  const activity = matchActivity(text);
  if (activity && activity.placeIds.length > 0) {
    const primaryId = activity.placeIds[0]!;
    return buildResult({
      primaryPlaceId: primaryId,
      suggestedPlaceIds: activity.placeIds,
      confidence: activity.primaryConfidence,
      reasoning: `activity:${activity.label} → suggest ${activity.placeIds.join(", ")}`,
    });
  }

  // Emotional intent — suggestions only (confidence below auto-route threshold)
  const emotional = matchEmotional(text);
  if (emotional && emotional.placeIds.length > 0) {
    return buildResult({
      primaryPlaceId: null,
      suggestedPlaceIds: emotional.placeIds,
      confidence: 0.62,
      reasoning: `emotion:${emotional.label} → gentle suggestions (stay here valid)`,
    });
  }

  // Lost / uncertain — never silent
  if (UNCERTAIN_RE.test(text)) {
    const placeIds = capSuggestions(
      suggestCanonicalPlacesForProfile("uncertain").map((place) => place.id),
    );
    return buildResult({
      primaryPlaceId: null,
      suggestedPlaceIds: placeIds,
      confidence: 0.4,
      reasoning:
        "uncertain where to go — offer restorative choices; conversation may continue here",
    });
  }

  // Peaceful without explicit emotion bucket already matched
  if (QUIET_RE.test(text)) {
    const placeIds = capSuggestions(suggestCanonicalPlaceIds(text));
    return buildResult({
      primaryPlaceId: null,
      suggestedPlaceIds: placeIds,
      confidence: 0.58,
      reasoning: "quiet need → restorative suggestions",
    });
  }

  // No confident match — still offer orientation, never fail silently
  if (input.currentPlaceId && !memberWantsMove) {
    const placeIds = capSuggestions(
      suggestCanonicalPlacesForProfile("orient").map((place) => place.id),
    );
    return buildResult({
      primaryPlaceId: null,
      suggestedPlaceIds: placeIds,
      confidence: 0.25,
      reasoning: `no place match — member may stay at ${input.currentPlaceId}`,
    });
  }

  const orientIds = capSuggestions(
    suggestCanonicalPlacesForProfile("orient").map((place) => place.id),
  );
  return buildResult({
    primaryPlaceId: null,
    suggestedPlaceIds: orientIds,
    confidence: 0.2,
    reasoning: "no place match — gentle Estate orientation suggestions",
  });
}

/** True when a consumer may call goToPlace without asking permission first. */
export function mayAutoRouteFromEstateIntent(
  result: EstateIntentBridgeResult,
): result is EstateIntentBridgeResult & { primaryPlaceId: string } {
  return (
    result.primaryPlaceId !== null &&
    result.confidence >= ESTATE_INTENT_AUTO_ROUTE_CONFIDENCE
  );
}
