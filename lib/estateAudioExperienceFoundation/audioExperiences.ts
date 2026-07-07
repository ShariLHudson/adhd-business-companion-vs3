/**
 * Audio Experience Foundation™ — experience registry loader.
 */

import audioExperiencesJson from "@/docs/estate-knowledge-base/audio-experiences.json";
import { getKnowledgeItem } from "@/lib/estateKnowledgeBase/loader";
import { getEstateLocationById } from "@/lib/estateKnowledgeBase/estateLocations";
import type { AudioExperience } from "./types";

type AudioExperiencesFile = {
  experiences: AudioExperience[];
};

const FILE = audioExperiencesJson as AudioExperiencesFile;

function locationIsLive(locationId: string): boolean {
  const room = getKnowledgeItem("rooms", locationId);
  if (room?.status === "Live") return true;

  const feature = getKnowledgeItem("features", locationId);
  if (feature?.status === "Live") return true;

  const setting = getKnowledgeItem("settings", locationId);
  if (setting?.status === "Live") return true;

  const estateLocation = getEstateLocationById(locationId);
  return estateLocation?.status === "Live";
}

export function getAudioExperiences(): AudioExperience[] {
  return FILE.experiences;
}

export function getAudioExperienceById(
  audioExperienceId: string,
): AudioExperience | null {
  return (
    FILE.experiences.find(
      (exp) => exp.audioExperienceId === audioExperienceId,
    ) ?? null
  );
}

export function isMemberFacingAudioExperience(
  experience: AudioExperience | null,
): boolean {
  if (!experience || experience.status !== "Live") return false;
  return locationIsLive(experience.location);
}

export function getLiveAudioExperiences(): AudioExperience[] {
  return FILE.experiences.filter(isMemberFacingAudioExperience);
}

export function audioExperiencesAtLocation(
  locationId: string,
  liveOnly = true,
): AudioExperience[] {
  const pool = liveOnly ? getLiveAudioExperiences() : getAudioExperiences();
  return pool.filter(
    (exp) =>
      exp.location === locationId ||
      exp.relatedLocations.includes(locationId),
  );
}

export function audioExperiencesForFeature(
  featureId: string,
  liveOnly = true,
): AudioExperience[] {
  const pool = liveOnly ? getLiveAudioExperiences() : getAudioExperiences();
  return pool.filter(
    (exp) =>
      exp.location === featureId || exp.relatedFeatures.includes(featureId),
  );
}
