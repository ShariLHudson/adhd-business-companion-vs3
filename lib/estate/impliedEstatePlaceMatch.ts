/**
 * Implied Estate place detection — member need/feeling → destination without "go to".
 * High confidence (≥0.7) may auto-navigate with a warm ack line.
 */

import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";
import { estateDirectCommandArrivalLine } from "@/lib/estateIntelligence/estateCommandRouter";

export const IMPLIED_ESTATE_AUTO_ROUTE_CONFIDENCE = 0.7;

export const IMPLIED_ESTATE_OFFER_CONFIDENCE = 0.55;

export type ImpliedEstatePlaceMatch = {
  placeId: string;
  confidence: number;
  matchKey: string;
  reason: string;
};

type ImpliedRule = {
  pattern: RegExp;
  placeId: string;
  confidence: number;
  matchKey: string;
  reason: string;
  warmLine?: string;
};

const EXCLUDE_IMPLIED_RE = [
  /\b(?:how (?:do|can|should)|what (?:is|are)|help me (?:write|create|draft|build|plan))\b/i,
  /\b(?:write a|create a|draft a|build a|design a|proposal|newsletter|email campaign|blog post)\b/i,
  /\b(?:take me|show me|go to|visit|open the|head to|bring me)\b/i,
];

const IMPLIED_WARM_LINES: Readonly<Record<string, string>> = {
  "coffee-house":
    "The Coffee House sounds perfect right now. I'll take you there.",
  "tea-room": "The Tea Room sounds like just the thing. I'll take you there.",
  "clear-my-mind":
    "Clear My Mind might be exactly what you need. I'll take you there.",
  "journal": "The Journal Gazebo feels right for this. I'll take you there.",
  "strategy-studio":
    "The Strategy Studio is a good place to sort this out. I'll take you there.",
  "round-table":
    "The Round Table is the right room for this kind of decision. I'll take you there.",
  gardens: "The Celebration Garden feels right for this moment. I'll take you there.",
  "summer-terrace":
    "The pool terrace sounds perfect right now. I'll take you there.",
  "lakeside-hammock":
    "The Lakeside Hammock might be just what you need. I'll take you there.",
  "music-room": "The Music Room sounds perfect right now. I'll take you there.",
  "estate-gardens":
    "The Estate Gardens would be lovely right now. I'll take you there.",
  "evidence-vault":
    "The Evidence Vault is a good place to remember what you've built. I'll take you there.",
};

const IMPLIED_RULES: readonly ImpliedRule[] = [
  {
    pattern:
      /\b(?:could use|want|need|would like).{0,24}(?:a cup of |some )?coffee\b/i,
    placeId: "coffee-house",
    confidence: 0.84,
    matchKey: "coffee-need",
    reason: "implied:coffee → Coffee House™",
    warmLine: IMPLIED_WARM_LINES["coffee-house"],
  },
  {
    pattern: /\b(?:cup of tea|some tea|want tea|need tea|have tea)\b/i,
    placeId: "tea-room",
    confidence: 0.82,
    matchKey: "tea-need",
    reason: "implied:tea → Tea Room™",
    warmLine: IMPLIED_WARM_LINES["tea-room"],
  },
  {
    pattern:
      /\b(?:clear my head|too many thoughts|head (?:is|feels) (?:so )?full|mind (?:is|feels) (?:so )?full|brain feels full)\b/i,
    placeId: "clear-my-mind",
    confidence: 0.86,
    matchKey: "clear-head",
    reason: "implied:mental clutter → Clear My Mind™",
    warmLine: IMPLIED_WARM_LINES["clear-my-mind"],
  },
  {
    pattern: /\b(?:feel|feeling|i'?m) overwhelmed\b/i,
    placeId: "clear-my-mind",
    confidence: 0.8,
    matchKey: "overwhelmed",
    reason: "implied:overwhelmed → Clear My Mind™",
    warmLine: IMPLIED_WARM_LINES["clear-my-mind"],
  },
  {
    pattern:
      /\b(?:need to journal|want to journal|write in (?:my )?journal|journal (?:this|about|for)|need to write (?:this )?down)\b/i,
    placeId: "journal",
    confidence: 0.8,
    matchKey: "journal-write",
    reason: "implied:journal → Journal Gazebo™",
    warmLine: IMPLIED_WARM_LINES.journal,
  },
  {
    pattern:
      /\b(?:need to plan|want to plan|planning (?:my|the)|figure out (?:my )?next step|what(?:'s| is) my next step)\b/i,
    placeId: "strategy-studio",
    confidence: 0.82,
    matchKey: "plan-strategy",
    reason: "implied:plan → Strategy Studio™",
    warmLine: IMPLIED_WARM_LINES["strategy-studio"],
  },
  {
    pattern: /\b(?:strategy session|strategic plan|need a strategy)\b/i,
    placeId: "strategy-studio",
    confidence: 0.78,
    matchKey: "strategy",
    reason: "implied:strategy → Strategy Studio™",
    warmLine: IMPLIED_WARM_LINES["strategy-studio"],
  },
  {
    pattern:
      /\b(?:big decision|tough decision|hard decision|leadership moment|board meeting|executive meeting|boardroom moment)\b/i,
    placeId: "round-table",
    confidence: 0.81,
    matchKey: "decision-leadership",
    reason: "implied:decision → Round Table™",
    warmLine: IMPLIED_WARM_LINES["round-table"],
  },
  {
    pattern:
      /\b(?:i did it|big win|huge win|something to celebrate|want to celebrate|need to celebrate)\b/i,
    placeId: "gardens",
    confidence: 0.79,
    matchKey: "celebrate-win",
    reason: "implied:celebrate → Celebration Garden™",
    warmLine: IMPLIED_WARM_LINES.gardens,
  },
  {
    pattern:
      /\b(?:need to rest|want to rest|need a rest|just rest|need to relax|want to relax)\b/i,
    placeId: "lakeside-hammock",
    confidence: 0.77,
    matchKey: "rest-relax",
    reason: "implied:rest → Lakeside Hammock™",
    warmLine: IMPLIED_WARM_LINES["lakeside-hammock"],
  },
  {
    pattern: /\b(?:want to swim|need to swim|need a swim)\b/i,
    placeId: "summer-terrace",
    confidence: 0.78,
    matchKey: "swim-need",
    reason: "implied:swim → Summer Terrace™",
    warmLine: IMPLIED_WARM_LINES["summer-terrace"],
  },
  {
    pattern: /\b(?:need a song|play (?:a )?song|music room|play piano|at the piano)\b/i,
    placeId: "music-room",
    confidence: 0.76,
    matchKey: "music-song",
    reason: "implied:music → Music Room™",
    warmLine: IMPLIED_WARM_LINES["music-room"],
  },
  {
    pattern:
      /\b(?:fresh air|need (?:some )?air|get outside|go for a walk|take a walk)\b/i,
    placeId: "estate-gardens",
    confidence: 0.79,
    matchKey: "fresh-air",
    reason: "implied:outside → Estate Gardens™",
    warmLine: IMPLIED_WARM_LINES["estate-gardens"],
  },
  {
    pattern:
      /\b(?:need (?:some )?proof|proof of|evidence of|confidence boost|remember what i(?:'ve| have) done|people i(?:'ve| have) helped)\b/i,
    placeId: "evidence-vault",
    confidence: 0.8,
    matchKey: "proof-evidence",
    reason: "implied:proof → Evidence Vault™",
    warmLine: IMPLIED_WARM_LINES["evidence-vault"],
  },
  {
    pattern:
      /\b(?:sit\s+(?:out\s+)?on\s+(?:the\s+)?deck|out\s+on\s+(?:the\s+)?deck|(?:the\s+)?back\s+deck)\b/i,
    placeId: "back-deck",
    confidence: 0.86,
    matchKey: "deck-sit",
    reason: "implied:deck → Back Deck",
    warmLine: "The Back Deck sounds perfect right now. I'll take you there.",
  },
  {
    pattern: /\b(?:need to think|want to think)\b/i,
    placeId: "strategy-studio",
    confidence: 0.68,
    matchKey: "think-need",
    reason: "implied:think → Strategy Studio™ (medium confidence)",
  },
  {
    pattern: /\b(?:need to focus|want to focus|need focus|can't focus)\b/i,
    placeId: "study-hall",
    confidence: 0.66,
    matchKey: "focus-need",
    reason: "implied:focus → Study Hall™ (medium confidence)",
  },
];

function shouldSkipImpliedMatch(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.split(/\s+/).length > 18) return true;
  return EXCLUDE_IMPLIED_RE.some((re) => re.test(trimmed));
}

/** Match implied need → canonical place (highest-confidence rule wins). */
export function matchImpliedEstatePlace(
  userText: string,
): ImpliedEstatePlaceMatch | null {
  const text = userText.trim();
  if (!text || shouldSkipImpliedMatch(text)) return null;

  let best: ImpliedEstatePlaceMatch | null = null;

  for (const rule of IMPLIED_RULES) {
    if (!rule.pattern.test(text)) continue;
    if (!getCanonicalEstatePlaceById(rule.placeId)) continue;
    if (!best || rule.confidence > best.confidence) {
      best = {
        placeId: rule.placeId,
        confidence: rule.confidence,
        matchKey: rule.matchKey,
        reason: rule.reason,
      };
    }
  }

  return best;
}

export function mayAutoRouteImpliedEstatePlace(
  _match: ImpliedEstatePlaceMatch | null,
): _match is ImpliedEstatePlaceMatch {
  // IMPLIED_NEED layer — thoughtful host offers choices; never auto-navigates.
  return false;
}

export function mayOfferImpliedEstatePlace(
  match: ImpliedEstatePlaceMatch | null,
): match is ImpliedEstatePlaceMatch {
  return (
    match !== null && match.confidence >= IMPLIED_ESTATE_OFFER_CONFIDENCE
  );
}

/** Kernel gate — route implied needs through estate decision path. */
export function shouldRouteImpliedEstatePlace(userText: string): boolean {
  return mayOfferImpliedEstatePlace(matchImpliedEstatePlace(userText));
}

export function formatImpliedWarmNavigationLine(
  match: ImpliedEstatePlaceMatch,
): string {
  const rule = IMPLIED_RULES.find((row) => row.matchKey === match.matchKey);
  if (rule?.warmLine) return rule.warmLine;

  const place = getCanonicalEstatePlaceById(match.placeId);
  const name = place?.officialName ?? match.placeId;
  return `The ${name} sounds perfect right now. I'll take you there.`;
}

/** Warm implied ack + arrival line (replaces generic direct navigation copy). */
export function formatImpliedEstateNavigationAck(
  match: ImpliedEstatePlaceMatch,
): string {
  const warm = formatImpliedWarmNavigationLine(match);
  const arrival = estateDirectCommandArrivalLine(match.placeId, match.placeId);
  return `${warm}\n\n${arrival}`;
}

export function formatImpliedEstateOfferLead(
  match: ImpliedEstatePlaceMatch,
): string {
  const place = getCanonicalEstatePlaceById(match.placeId);
  const name = place?.officialName ?? match.placeId;
  return `${name} might be a good fit — we could head there, or stay right here.`;
}
