/**
 * Room menu Experiences track types.
 * Full folder manifests remain WIP; empty lists keep My Day & Work chrome compiling.
 */

export type ExperienceSoundscapeTrack = {
  id: string;
  title: string;
  src: string;
};

/** Music titles - Peaceful Places submenu. */
export const PEACEFUL_PLACES_MUSIC_TRACKS: readonly ExperienceSoundscapeTrack[] =
  [];

/** Ambient loops - Soundscapes submenu. */
export const EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS: readonly ExperienceSoundscapeTrack[] =
  [];

export function experienceSoundscapeTrackById(
  trackId: string,
): ExperienceSoundscapeTrack | undefined {
  return [...PEACEFUL_PLACES_MUSIC_TRACKS, ...EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS].find(
    (track) => track.id === trackId,
  );
}
