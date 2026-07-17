/**
 * Location Intent Resolution Layer
 *
 * Members speak naturally. Spark determines:
 * 1. Specific location named (official display name)
 * 2. Nickname / alias (longest phrase)
 * 3. Ambiguous shared terms (offer choices)
 * 4. Desired experience (multiple valid destinations)
 * 5. Thoughtful options — never random.
 */

import { matchEstateAlias } from "./estateAliases";
import {
  getLiveEstateLocations,
  getEstateLocationById,
  isRecommendableEstateLocation,
  toLocationOption,
} from "./estateLocations";
import { matchExperienceGroupFromQuery } from "./experienceGroups";
import { matchAmbiguousLocationTerm } from "@/lib/estateNavigationIntelligence/ambiguousLocations";
import { filterValidatedNavigationTargets } from "@/lib/estateNavigationIntelligence/routeValidation";
import {
  longestPhraseMatch,
  normalizeLocationPhrase,
  stripNavigationVerbsFromQuery,
} from "./locationPhraseMatch";
import type { LocationIntentResolution, LocationOption } from "./types";

function matchLocationByOfficialName(query: string): {
  locationId: string;
  matchedPhrase: string;
} | null {
  const probe = stripNavigationVerbsFromQuery(query) || query.trim();
  const match = longestPhraseMatch(
    probe,
    getLiveEstateLocations(),
    (loc) => loc.officialDisplayName.replace(/\u2122/g, ""),
    { probeText: probe },
  );
  if (match) {
    return { locationId: match.item.locationId, matchedPhrase: match.phrase };
  }

  const idProbe = normalizeLocationPhrase(probe.replace(/^the\s+/, ""));
  const idExact = getLiveEstateLocations().find((loc) => {
    const idPhrase = normalizeLocationPhrase(loc.locationId.replace(/-/g, " "));
    return idPhrase === idProbe;
  });
  if (idExact) {
    return { locationId: idExact.locationId, matchedPhrase: idProbe };
  }

  return null;
}

function formatExperienceOptionsPrompt(
  experienceGroupLabel: string,
  options: LocationOption[],
): string {
  const lines = options.map(
    (option, index) =>
      `${index + 1}. ${option.officialDisplayName} — ${option.memberFacingHint}`,
  );

  return [
    `I have a few ${experienceGroupLabel.toLowerCase()} places you might enjoy:`,
    "",
    ...lines,
    "",
    "Which would you like to visit? Reply with a number or the place name.",
  ].join("\n");
}

function directResolution(
  query: string,
  locationId: string,
  matchedPhrase: string,
): LocationIntentResolution | null {
  const location = getEstateLocationById(locationId);
  if (!location || !isRecommendableEstateLocation(location)) return null;
  return {
    kind: "direct",
    query,
    matchedPhrase,
    directLocation: toLocationOption(location),
  };
}

export function resolveLocationIntent(query: string): LocationIntentResolution {
  const normalized = normalizeLocationPhrase(query);
  const base: LocationIntentResolution = { kind: "unresolved", query };

  if (!normalized) return base;

  const alias = matchEstateAlias(query);
  if (alias) {
    const direct = directResolution(query, alias.locationId, alias.phrase);
    if (direct) return direct;
  }

  const official = matchLocationByOfficialName(query);
  if (official) {
    const direct = directResolution(query, official.locationId, official.matchedPhrase);
    if (direct) return direct;
  }

  const ambiguous = matchAmbiguousLocationTerm(query);
  if (ambiguous) {
    const max = 4;
    const options = ambiguous.options.slice(0, max);
    if (options.length >= 2) {
      return {
        kind: "experience_options",
        query,
        matchedPhrase: ambiguous.matchedPhrase,
        experienceGroup: "Ambiguous destination",
        options,
        memberFacingPrompt: [
          ambiguous.term.memberFacingIntro,
          "",
          ...options.map(
            (option) =>
              `${option.officialDisplayName} — ${option.memberFacingHint}`,
          ),
          "",
          ambiguous.term.clarificationQuestion,
        ].join("\n"),
      };
    }
  }

  const experience = matchExperienceGroupFromQuery(query);
  if (experience) {
    const group = experience.group;
    const maxOptions = Math.min(group.maxOptions ?? 3, 3);
    const orderedIds =
      group.presentationOrder?.length > 0
        ? group.presentationOrder
        : group.locationIds;

    // Only offer destinations that exist, are enabled, and can open now.
    const options = filterValidatedNavigationTargets(orderedIds)
      .slice(0, maxOptions)
      .map((target) => target.option);

    if (options.length === 1) {
      return {
        kind: "direct",
        query,
        matchedPhrase: experience.matchedPhrase,
        experienceGroup: group.experienceGroup,
        experienceGroupId: group.id,
        directLocation: options[0],
      };
    }

    if (options.length > 1) {
      return {
        kind: "experience_options",
        query,
        matchedPhrase: experience.matchedPhrase,
        experienceGroup: group.experienceGroup,
        experienceGroupId: group.id,
        options,
        memberFacingPrompt: formatExperienceOptionsPrompt(
          group.experienceGroup,
          options,
        ),
      };
    }
  }

  return base;
}
