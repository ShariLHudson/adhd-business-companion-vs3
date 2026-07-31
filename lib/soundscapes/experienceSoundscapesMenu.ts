/**
 * Room menu → Experiences
 * Peaceful Places = music titles from public/audio/peaceful-places.
 * Soundscapes = ambient audio from public/audio/Soundscapes.
 */

import {
  buildPeacefulPlacesFolderTracks,
  buildPeacefulPlacesGroupedTracks,
  type PeacefulPlaceGroup,
} from "@/lib/peacefulPlaces/peacefulPlacesFolderManifest";
import { buildSoundscapesFolderTracks } from "./soundscapesFolderManifest";

export type ExperienceSoundscapeTrack = {
  id: string;
  title: string;
  src: string;
  /** Peaceful Moments display group. Undefined for ambient soundscapes. */
  group?: PeacefulPlaceGroup;
};

/** Music titles — Peaceful Places submenu. */
export const PEACEFUL_PLACES_MUSIC_TRACKS: readonly ExperienceSoundscapeTrack[] =
  buildPeacefulPlacesFolderTracks();

/**
 * Peaceful Moments songs grouped for display (fixed group order,
 * alphabetized within each group). Playback still resolves by id.
 */
export const PEACEFUL_PLACES_MUSIC_GROUPS: readonly {
  group: PeacefulPlaceGroup;
  tracks: readonly ExperienceSoundscapeTrack[];
}[] = buildPeacefulPlacesGroupedTracks();

/** Ambient loops — Soundscapes submenu. */
export const EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS: readonly ExperienceSoundscapeTrack[] =
  buildSoundscapesFolderTracks();

export function experienceSoundscapeTrackById(
  trackId: string,
): ExperienceSoundscapeTrack | undefined {
  return [...PEACEFUL_PLACES_MUSIC_TRACKS, ...EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS].find(
    (track) => track.id === trackId,
  );
}

export function peacefulPlacesMusicTrackById(
  trackId: string,
): ExperienceSoundscapeTrack | undefined {
  return PEACEFUL_PLACES_MUSIC_TRACKS.find((track) => track.id === trackId);
}

export function ambientSoundscapeTrackById(
  trackId: string,
): ExperienceSoundscapeTrack | undefined {
  return EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.find(
    (track) => track.id === trackId,
  );
}

export function isPeacefulPlacesMusicTrackId(trackId: string): boolean {
  return Boolean(peacefulPlacesMusicTrackById(trackId));
}

export function isAmbientSoundscapeTrackId(trackId: string): boolean {
  return Boolean(ambientSoundscapeTrackById(trackId));
}
