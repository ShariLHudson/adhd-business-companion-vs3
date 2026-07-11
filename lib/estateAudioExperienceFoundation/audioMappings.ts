/**
 * Audio Experience Foundation — cross-link mappings loader.
 */

import audioMappingsJson from "@/docs/estate-knowledge-base/audio-mappings.json";
import {
  getAudioExperienceById,
  isMemberFacingAudioExperience,
} from "./audioExperiences";
import type { AudioExperience, AudioMapping, AudioMappingSourceType } from "./types";

type AudioMappingsFile = {
  mappings: AudioMapping[];
  legacyFeatureBridge?: Record<string, string>;
};

const FILE = audioMappingsJson as AudioMappingsFile;

export function getAudioMappings(): AudioMapping[] {
  return FILE.mappings;
}

export function getAudioMapping(
  sourceType: AudioMappingSourceType,
  sourceId: string,
): AudioMapping | null {
  return (
    FILE.mappings.find(
      (entry) => entry.sourceType === sourceType && entry.sourceId === sourceId,
    ) ?? null
  );
}

function resolveMappedExperiences(
  mapping: AudioMapping | null,
  liveOnly: boolean,
): AudioExperience[] {
  if (!mapping || mapping.status !== "Live") return [];

  const order = mapping.presentationOrder.length
    ? mapping.presentationOrder
    : mapping.audioExperienceIds;

  const experiences: AudioExperience[] = [];
  for (const id of order) {
    const experience = getAudioExperienceById(id);
    if (!experience) continue;
    if (liveOnly && !isMemberFacingAudioExperience(experience)) continue;
    experiences.push(experience);
  }

  return experiences;
}

export function audioExperiencesForEntity(
  sourceType: AudioMappingSourceType,
  sourceId: string,
  liveOnly = true,
): AudioExperience[] {
  return resolveMappedExperiences(getAudioMapping(sourceType, sourceId), liveOnly);
}

export function audioExperiencesForNeedSignal(
  signalId: string,
  liveOnly = true,
): AudioExperience[] {
  return audioExperiencesForEntity("need-signal", signalId, liveOnly);
}

export function audioExperiencesForExperienceGroup(
  groupId: string,
  liveOnly = true,
): AudioExperience[] {
  return audioExperiencesForEntity("experience-group", groupId, liveOnly);
}

export function bridgeLegacyAudioFeatureId(featureId: string): string | null {
  return FILE.legacyFeatureBridge?.[featureId] ?? null;
}

export function audioExperienceIdFromLegacyFeature(
  featureId: string,
): string | null {
  const bridged = bridgeLegacyAudioFeatureId(featureId);
  if (bridged) return bridged;

  const mapped = audioExperiencesForEntity("feature", featureId);
  return mapped[0]?.audioExperienceId ?? null;
}
