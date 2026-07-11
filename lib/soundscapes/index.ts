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
export {
  SOUNDSCAPE_COMPANION_AUDIO_EXAMPLES,
  SOUNDSCAPE_ENVIRONMENT_EXAMPLES,
  SOUNDSCAPE_FAVORITE_EXPERIENCE_EXAMPLES,
  SOUNDSCAPE_FUTURE_EXPANSION,
  SOUNDSCAPE_LEARNING_OBSERVATION_EXAMPLES,
  SOUNDSCAPE_NATURE_EXAMPLES,
  SOUNDSCAPE_OPTIONAL_TOOLS,
  SOUNDSCAPE_SESSION_LAYERS,
  SOUNDSCAPE_SILENCE_IS_VALID,
  SOUNDSCAPES_SELECTION_PROMPT,
  soundscapeMayPairWithAnyScene,
  type SoundscapeCategory,
  type SoundscapeOptionalTool,
} from "./soundscapesArchitecture";
export {
  MASTER_SOUNDSCAPE_INVENTORY,
  MASTER_SOUNDSCAPE_MENU_GROUPS,
  masterSoundscapeById,
  masterSoundscapesForCategory,
  masterSoundscapesForMenuGroup,
  signatureMasterSoundscapes,
  type MasterSoundscapeAsset,
  type MasterSoundscapeCategory,
  type MasterSoundscapeMenuGroup,
} from "./masterSoundscapeInventory";
export {
  globalAudioLibraryById,
  globalAudioLibraryEntries,
  globalAudioLibraryMenu,
  type GlobalAudioLibraryEntry,
} from "./globalAudioLibrary";
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
