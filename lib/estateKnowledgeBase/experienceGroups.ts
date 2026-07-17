/**
 * Estate Knowledge Base — experience group intent matching.
 */

import experienceGroupsJson from "@/docs/estate-knowledge-base/estate-experience-groups.json";
import { shouldBlockAutoPlayForAudioQuery } from "@/lib/estate/audioPlaybackGuard";
import { mayOfferScenicPlaceSuggestions } from "@/lib/estate/scenicPlaceSuggestionPolicy";
import { matchEstateAlias } from "./estateAliases";
import {
  longestPhraseMatch,
  normalizeLocationPhrase,
  phraseContainedInText,
  stripNavigationVerbsFromQuery,
} from "./locationPhraseMatch";
import { getLiveEstateLocations } from "./estateLocations";
import type { EstateExperienceGroup } from "./types";

type EstateExperienceGroupsFile = {
  groups: EstateExperienceGroup[];
};

const FILE = experienceGroupsJson as EstateExperienceGroupsFile;

/**
 * Keywords that appear in ordinary English and must not open scenic menus
 * from incidental phrasing ("still in the dryer", "I think I can…").
 * Domain keywords (swim, music, piano) stay eligible without a place ask.
 */
const AMBIGUOUS_EXPERIENCE_KEYWORDS = new Set([
  "peaceful",
  "quiet",
  "calm",
  "calming",
  "still",
  "serene",
  "restful",
  "think",
  "reflect",
  "contemplate",
  "nature",
  "outside",
  "relaxing",
  "garden",
  "green",
  "renewal",
  "fresh air",
]);

function normalizeIntent(text: string): string {
  return normalizeLocationPhrase(text);
}

export function getExperienceGroups(): EstateExperienceGroup[] {
  return FILE.groups;
}

export function getLiveExperienceGroups(): EstateExperienceGroup[] {
  return FILE.groups.filter((group) => group.status === "Live");
}

export function getExperienceGroupById(id: string): EstateExperienceGroup | null {
  return FILE.groups.find((group) => group.id === id) ?? null;
}

export type ExperienceGroupMatch = {
  group: EstateExperienceGroup;
  matchedPhrase: string;
  locationIds: string[];
  /** userMayAsk = explicit experience ask; keyword = weaker signal. */
  matchSource: "userMayAsk" | "keyword";
};

function hasSpecificLocationMention(query: string): boolean {
  const probe = stripNavigationVerbsFromQuery(query) || query.trim();
  if (!probe) return false;

  if (matchEstateAlias(query)) return true;

  const official = longestPhraseMatch(
    probe,
    getLiveEstateLocations(),
    (loc) => loc.officialDisplayName.replace(/\u2122/g, ""),
    { probeText: probe },
  );
  return Boolean(official);
}

function mayMatchAmbiguousKeyword(query: string, keyword: string): boolean {
  const normalizedKeyword = normalizeIntent(keyword);
  if (!AMBIGUOUS_EXPERIENCE_KEYWORDS.has(normalizedKeyword)) return true;
  // Unsolicited scenic menus stay off — ambiguous keywords need an explicit place ask.
  return mayOfferScenicPlaceSuggestions(query);
}

export function matchExperienceGroupFromQuery(
  query: string,
): ExperienceGroupMatch | null {
  const normalized = normalizeIntent(query);
  if (!normalized) return null;

  if (shouldBlockAutoPlayForAudioQuery(query)) return null;
  if (hasSpecificLocationMention(query)) return null;

  for (const group of getLiveExperienceGroups()) {
    for (const phrase of group.userMayAsk) {
      const normalizedPhrase = normalizeIntent(phrase);
      if (phraseContainedInText(normalized, normalizedPhrase)) {
        return {
          group,
          matchedPhrase: phrase,
          locationIds: [...group.locationIds],
          matchSource: "userMayAsk",
        };
      }
    }

    for (const keyword of group.keywords) {
      if (!phraseContainedInText(normalized, keyword)) continue;
      if (!mayMatchAmbiguousKeyword(query, keyword)) continue;
      return {
        group,
        matchedPhrase: keyword,
        locationIds: [...group.locationIds],
        matchSource: "keyword",
      };
    }
  }

  return null;
}
