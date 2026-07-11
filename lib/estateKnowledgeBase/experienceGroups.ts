/**
 * Estate Knowledge Base — experience group intent matching.
 */

import experienceGroupsJson from "@/docs/estate-knowledge-base/estate-experience-groups.json";
import { shouldBlockAutoPlayForAudioQuery } from "@/lib/estate/audioPlaybackGuard";
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
        };
      }
    }

    for (const keyword of group.keywords) {
      if (phraseContainedInText(normalized, keyword)) {
        return {
          group,
          matchedPhrase: keyword,
          locationIds: [...group.locationIds],
        };
      }
    }
  }

  return null;
}
