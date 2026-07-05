/**
 * Conversation Drives Navigation™ — evaluate member language for environment needs.
 */

import {
  getEstateDirectoryEntry,
} from "../directory";
import { isLiveEstatePlace } from "../liveEstatePlace";
import { resolveCanonicalPlaceId } from "../canonicalEstateRegistry";
import { formatEnvironmentPlaceOffer } from "./formatEnvironmentOffer";
import { ENVIRONMENT_NEED_LEXICON } from "./environmentNeeds";
import { shouldSuppressEnvironmentNeedDuringDistress } from "@/lib/conversation/emotionalDistressRouting";
import type {
  ConversationEnvironmentEvaluation,
  EnvironmentNeedId,
} from "./types";
import { ENVIRONMENT_NEED_MAX_SUGGESTIONS } from "./types";

const NAV_VERB_ONLY_RE =
  /\b(?:take me to|go to|let(?:'s| us) go to|open|show me|visit|head to|bring me to)\s+[\w\s™-]{3,}\b/i;

function filterNavigablePlaceIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const id = resolveCanonicalPlaceId(raw);
    if (!isLiveEstatePlace(id)) continue;
    const entry = getEstateDirectoryEntry(id);
    if (!entry?.shell.navigable) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= ENVIRONMENT_NEED_MAX_SUGGESTIONS) break;
  }
  return out;
}

function matchEnvironmentNeed(
  text: string,
): { needId: EnvironmentNeedId; definition: (typeof ENVIRONMENT_NEED_LEXICON)[number] } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Named deck — go to Back Deck, not a generic open-air menu.
  if (/\b(?:the\s+)?(?:back\s+)?deck\b/i.test(trimmed)) return null;

  // Named destination with navigation verb — not an environment need offer
  if (NAV_VERB_ONLY_RE.test(trimmed)) return null;

  for (const definition of ENVIRONMENT_NEED_LEXICON) {
    if (definition.patterns.some((pattern) => pattern.test(trimmed))) {
      return { needId: definition.id, definition };
    }
  }
  return null;
}

/**
 * Detect whether member language implies a different Estate environment.
 * Returns canonical place suggestions from Estate Directory — never invents rooms.
 */
export function evaluateConversationEnvironmentNeed(
  userText: string,
  options?: { lastAssistantText?: string | null },
): ConversationEnvironmentEvaluation {
  const text = userText.trim();
  const empty: ConversationEnvironmentEvaluation = {
    detected: false,
    needId: null,
    suggestedPlaceIds: [],
    suggestedPlaces: [],
    confidence: 0,
    reasoning: "no environment need detected",
    offerLine: null,
  };

  if (!text) return empty;

  if (
    shouldSuppressEnvironmentNeedDuringDistress(
      text,
      options?.lastAssistantText,
    )
  ) {
    return {
      ...empty,
      reasoning: "emotional distress thread — stay in conversation before environment",
    };
  }

  const match = matchEnvironmentNeed(text);
  if (!match) return empty;

  const placeIds = filterNavigablePlaceIds(match.definition.placeIds);
  if (!placeIds.length) {
    return {
      ...empty,
      needId: match.needId,
      reasoning: `${match.needId} matched but no navigable directory places`,
    };
  }

  const suggestedPlaces = placeIds
    .map((id) => getEstateDirectoryEntry(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const offerLine = formatEnvironmentPlaceOffer(
    match.definition.offerIntro,
    placeIds,
  );

  return {
    detected: true,
    needId: match.needId,
    suggestedPlaceIds: placeIds,
    suggestedPlaces,
    confidence: 0.68,
    reasoning: `conversation-drives-navigation:${match.needId} → ${placeIds.join(", ")}`,
    offerLine,
  };
}

/** True when member expressed an environmental need (offer, not auto-navigate). */
export function isConversationEnvironmentOffer(
  evaluation: ConversationEnvironmentEvaluation,
): boolean {
  return evaluation.detected && evaluation.suggestedPlaceIds.length > 0;
}
