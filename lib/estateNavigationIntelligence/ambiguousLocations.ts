/**
 * Ambiguous location terms — multiple valid destinations; never choose randomly.
 */

import ambiguousJson from "@/docs/estate-knowledge-base/estate-navigation-ambiguous.json";
import { locationOptionsForIds } from "@/lib/estateKnowledgeBase/estateLocations";
import {
  normalizeLocationPhrase,
  phraseContainedInText,
  stripNavigationVerbsFromQuery,
} from "@/lib/estateKnowledgeBase/locationPhraseMatch";
import type { LocationOption } from "@/lib/estateKnowledgeBase/types";

type AmbiguousTerm = {
  id: string;
  status: string;
  triggerPhrases: string[];
  excludeWhenContains: string[];
  locationIds: string[];
  presentationOrder: string[];
  memberFacingIntro: string;
  clarificationQuestion: string;
};

type AmbiguousFile = {
  terms: AmbiguousTerm[];
  rules?: { maxMemberOptions?: number };
};

const FILE = ambiguousJson as AmbiguousFile;

export type AmbiguousLocationMatch = {
  term: AmbiguousTerm;
  matchedPhrase: string;
  options: LocationOption[];
};

export function matchAmbiguousLocationTerm(
  query: string,
): AmbiguousLocationMatch | null {
  const normalized = normalizeLocationPhrase(query);
  const probe = stripNavigationVerbsFromQuery(query) || normalized;
  if (!probe) return null;

  for (const term of FILE.terms) {
    if (term.status !== "Live") continue;

    const excluded = term.excludeWhenContains.some((fragment) =>
      phraseContainedInText(normalized, fragment),
    );
    if (excluded) continue;

    for (const phrase of term.triggerPhrases) {
      const normalizedPhrase = normalizeLocationPhrase(phrase);
      if (!phraseContainedInText(probe, normalizedPhrase)) continue;

      const orderedIds =
        term.presentationOrder.length > 0
          ? term.presentationOrder
          : term.locationIds;
      const max = FILE.rules?.maxMemberOptions ?? 4;
      const options = locationOptionsForIds(orderedIds).slice(0, max);

      if (options.length < 2) continue;

      return {
        term,
        matchedPhrase: phrase,
        options,
      };
    }
  }

  return null;
}
