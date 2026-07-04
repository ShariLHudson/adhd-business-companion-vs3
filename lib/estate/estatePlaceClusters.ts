/**
 * When several real places fit the same words, offer three named choices — never guess.
 */

import { formatEstatePlaceSuggestionMenu } from "./estatePlaceIdentityLock";
import { normalizeAliasPhrase } from "./estateRoomAliasRegistry";

export type EstatePlaceClusterMenu = {
  line: string;
  placeIds: string[];
};

type ClusterRule = {
  pattern: RegExp;
  placeIds: readonly string[];
  lead: string;
};

const VAGUE_WATER_RE =
  /\b(?:by the water|near the water|water'?s edge|somewhere (?:by|near|with) (?:the )?water|on the water|lakeside|by the lake|near the lake|at the lake)\b/i;

const VAGUE_READ_RE =
  /\b(?:somewhere to read|place to read|want to read|need to read|curl up with a book|quiet read|read a book|somewhere with books)\b/i;

const VAGUE_GATHER_RE =
  /\b(?:somewhere to eat|something to eat|get a bite|grab (?:a )?(?:bite|coffee|tea)|hungry|thirsty|cup of (?:coffee|tea)|food and drink)\b/i;

const VAGUE_STUDY_RE =
  /\b(?:somewhere to study|quiet place to think|look something up|need to study|research something)\b/i;

const VAGUE_OUTSIDE_RE =
  /\b(?:somewhere outside|fresh air|outdoors|under the (?:sky|stars)|near the (?:pool|garden))\b/i;

const VAGUE_CLUSTERS: readonly ClusterRule[] = [
  {
    pattern: VAGUE_WATER_RE,
    placeIds: ["seat-at-pond", "reflection-pond", "lakeside-verandah"],
    lead: "A few peaceful spots by the water — which feels right?",
  },
  {
    pattern: VAGUE_READ_RE,
    placeIds: ["library", "reading-nook", "stairway-reading-nook"],
    lead: "For reading and quiet thought, we could try:",
  },
  {
    pattern: VAGUE_GATHER_RE,
    placeIds: ["coffee-house", "tea-room", "dining-room"],
    lead: "For something warm to eat or drink, we could try:",
  },
  {
    pattern: VAGUE_STUDY_RE,
    placeIds: ["library", "discovery-room", "evidence-vault"],
    lead: "For study and quiet focus, we could try:",
  },
  {
    pattern: VAGUE_OUTSIDE_RE,
    placeIds: ["observatory", "estate-gardens", "summer-terrace"],
    lead: "For outside and open air, we could try:",
  },
];

/** Bare destination phrases where multiple real rooms share the same words. */
const AMBIGUOUS_DESTINATION_CLUSTERS: readonly ClusterRule[] = [
  {
    pattern: /^(?:the\s+)?pond$/i,
    placeIds: ["seat-at-pond", "reflection-pond"],
    lead: "We have a couple of pond spaces — which sounds better?",
  },
  {
    pattern: /^(?:the\s+)?lake$/i,
    placeIds: ["lakeside-verandah", "lakeside-hammock", "seat-at-pond"],
    lead: "A few quiet spots by the lake:",
  },
  {
    pattern: /^(?:the\s+)?water$/i,
    placeIds: ["seat-at-pond", "reflection-pond", "lakeside-verandah"],
    lead: "A few peaceful spots by the water — which feels right?",
  },
  {
    pattern: /^(?:the\s+)?hammock$/i,
    placeIds: ["lakeside-hammock", "porch-swing"],
    lead: "A couple of slow-rest spots — which one?",
  },
  {
    pattern: /^(?:the\s+)?nook$/i,
    placeIds: ["reading-nook", "stairway-reading-nook"],
    lead: "We have a couple of reading nooks — which one?",
  },
];

function filterCluster(
  placeIds: readonly string[],
  excludePlaceId?: string | null,
): string[] {
  return placeIds.filter((id) => id !== excludePlaceId).slice(0, 3);
}

function buildClusterMenu(
  rule: ClusterRule,
  excludePlaceId?: string | null,
): EstatePlaceClusterMenu | null {
  const placeIds = filterCluster(rule.placeIds, excludePlaceId);
  if (placeIds.length < 2) return null;
  return {
    line: formatEstatePlaceSuggestionMenu(placeIds, { intro: rule.lead }),
    placeIds,
  };
}

/** Vague mood or need → three concrete room names. */
export function matchVaguePlaceCluster(
  userText: string,
  excludePlaceId?: string | null,
): EstatePlaceClusterMenu | null {
  const text = userText.trim();
  if (!text) return null;

  for (const rule of VAGUE_CLUSTERS) {
    if (!rule.pattern.test(text)) continue;
    return buildClusterMenu(rule, excludePlaceId);
  }
  return null;
}

/** Short destination phrase maps to more than one real place — ask which one. */
export function matchAmbiguousDestinationCluster(
  destinationPhrase: string,
  excludePlaceId?: string | null,
): EstatePlaceClusterMenu | null {
  const bare = normalizeAliasPhrase(destinationPhrase);
  if (!bare) return null;

  for (const rule of AMBIGUOUS_DESTINATION_CLUSTERS) {
    if (!rule.pattern.test(bare)) continue;
    return buildClusterMenu(rule, excludePlaceId);
  }
  return null;
}
