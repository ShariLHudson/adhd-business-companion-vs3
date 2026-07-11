import {
  isButterflyHouseBackground,
  isButterflyHouseRoom,
} from "@/lib/butterflyHouse/media";
import {
  isOceanConservatoryBackground,
  isOceanConservatoryRoom,
} from "@/lib/oceanConservatory/isOceanConservatoryRoom";
import { OCEAN_CONSERVATORY_VIDEO_PLAYBACK_RATE } from "@/lib/oceanConservatory/media";
import { resolveCanonicalPlaceId } from "@/lib/estate/canonicalEstateRegistry";
import { resolveCanonicalPlaceVideo } from "@/lib/estate/estatePlaceMedia";

/** Manifest-backed room experience video (Aquarium Room, Butterfly House). */
export function resolveEstateRoomExperienceVideo(
  roomId: string,
  backgroundUrl?: string | null,
): string | null {
  const canonicalId = resolveCanonicalPlaceId(roomId);
  const manifestVideo = resolveCanonicalPlaceVideo(canonicalId);
  if (manifestVideo) return manifestVideo;

  if (
    isOceanConservatoryRoom(roomId) ||
    isOceanConservatoryRoom(canonicalId) ||
    isOceanConservatoryBackground(backgroundUrl)
  ) {
    return resolveCanonicalPlaceVideo("conservatory");
  }

  if (
    isButterflyHouseRoom(roomId) ||
    isButterflyHouseRoom(canonicalId) ||
    isButterflyHouseBackground(backgroundUrl)
  ) {
    return resolveCanonicalPlaceVideo("butterfly-house");
  }

  return null;
}

export function estateRoomUsesExperienceVideo(
  roomId: string,
  backgroundUrl?: string | null,
): boolean {
  return Boolean(resolveEstateRoomExperienceVideo(roomId, backgroundUrl));
}

export function estateRoomUsesOceanConservatoryVideo(roomId: string): boolean {
  const canonicalId = resolveCanonicalPlaceId(roomId);
  return canonicalId === "conservatory" || isOceanConservatoryRoom(roomId);
}

export function estateRoomExperienceVideoPlaybackRate(
  roomId: string,
): number | undefined {
  if (estateRoomUsesOceanConservatoryVideo(roomId)) {
    return OCEAN_CONSERVATORY_VIDEO_PLAYBACK_RATE;
  }
  return undefined;
}
