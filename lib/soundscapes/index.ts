export {
  SOUNDSCAPE_INTRO,
  SOUNDSCAPE_MOODS,
  SOUNDSCAPE_SUBCOPY,
  SOUNDSCAPES,
  soundscapeById,
  soundscapeDisplayLabel,
  soundscapesForMood,
} from "./catalog";
export {
  recommendedSoundscapeForLegacyCategory,
  recommendedSoundscapeForMood,
  resolveSoundscapeMood,
  resolveSoundscapeScrollTarget,
} from "./routing";
export type {
  Soundscape,
  SoundscapeMood,
  SoundscapeMoodId,
  SoundscapePlayback,
} from "./types";

import type { Soundscape } from "./types";
import type { AudioLink } from "@/lib/audioPlaylists";

export function soundscapeToAudioLink(soundscape: Soundscape): AudioLink {
  return {
    id: soundscape.id,
    name: `${soundscape.emoji} ${soundscape.title}`,
    url: soundscape.playbackUrl,
    playlistId: `soundscape-${soundscape.mood}`,
  };
}

export function soundscapePlaybackFrom(
  soundscape: Soundscape,
): import("./types").SoundscapePlayback {
  return {
    id: soundscape.id,
    label: soundscape.destinationName,
    description: soundscape.tagline,
    environment: soundscape.experience,
    playbackUrl: soundscape.playbackUrl,
  };
}
