/**
 * Estate Knowledge Base — relationship queries from mapping registries.
 */

import {
  audioExperienceIdFromLegacyFeature,
  audioExperiencesForEntity,
} from "@/lib/estateAudioExperienceFoundation";
import {
  getDiscoveryMappings,
  getMomentumActivities,
  getMomentumEntityMappings,
  getSparkCardMappings,
} from "./loader";
import type {
  DiscoveryMapping,
  MomentumActivity,
  SparkCardMapping,
} from "./types";

export function discoveriesForEntity(
  sourceType: DiscoveryMapping["sourceType"],
  sourceId: string,
): string[] {
  const mapping = getDiscoveryMappings().find(
    (entry) => entry.sourceType === sourceType && entry.sourceId === sourceId,
  );
  if (!mapping || mapping.status !== "Live") return [];
  return mapping.relatedDiscoveries;
}

export function momentumActivitiesForEntity(
  sourceType: "room" | "feature" | "tool",
  sourceId: string,
): MomentumActivity[] {
  const mapping = getMomentumEntityMappings().find(
    (entry) => entry.sourceType === sourceType && entry.sourceId === sourceId,
  );
  if (!mapping || mapping.status !== "Live") return [];

  const activities = getMomentumActivities();
  return mapping.relatedMomentum
    .map((id) => activities.find((activity) => activity.id === id) ?? null)
    .filter((activity): activity is MomentumActivity => activity !== null)
    .filter((activity) => activity.status === "Live");
}

export function sparkCardsForEntity(
  sourceType: SparkCardMapping["sourceType"],
  sourceId: string,
): string[] {
  const mapping = getSparkCardMappings().find(
    (entry) => entry.sourceType === sourceType && entry.sourceId === sourceId,
  );
  if (!mapping || mapping.status !== "Live") return [];
  return mapping.relatedSparkCards;
}

export function audioSuggestionsForEntity(
  sourceType: DiscoveryMapping["sourceType"],
  sourceId: string,
): string[] {
  const fromFoundation = audioExperiencesForEntity(
    sourceType,
    sourceId,
  ).map((experience) => experience.audioExperienceId);
  if (fromFoundation.length > 0) return fromFoundation;

  const mapping = getDiscoveryMappings().find(
    (entry) => entry.sourceType === sourceType && entry.sourceId === sourceId,
  );
  if (!mapping || mapping.status !== "Live") return [];

  return mapping.relatedAudio
    .map((featureId) => audioExperienceIdFromLegacyFeature(featureId))
    .filter((id): id is string => Boolean(id));
}

export function journalPromptsForEntity(
  sourceType: DiscoveryMapping["sourceType"],
  sourceId: string,
): string[] {
  const mapping = getDiscoveryMappings().find(
    (entry) => entry.sourceType === sourceType && entry.sourceId === sourceId,
  );
  if (!mapping || mapping.status !== "Live") return [];
  return mapping.relatedJournalPrompts;
}

export function storiesForEntity(
  sourceType: DiscoveryMapping["sourceType"],
  sourceId: string,
): string[] {
  const mapping = getDiscoveryMappings().find(
    (entry) => entry.sourceType === sourceType && entry.sourceId === sourceId,
  );
  if (!mapping || mapping.status !== "Live") return [];
  return mapping.relatedStories;
}
