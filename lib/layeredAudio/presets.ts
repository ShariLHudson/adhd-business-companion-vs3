import { LAYERED_TRACK_IDS } from "./catalog";
import type { LayeredAudioPreset } from "./types";

/**
 * Presets reference catalog track IDs. Unavailable tracks are skipped
 * by the engine without blocking the rest of the mix.
 */
export const LAYERED_AUDIO_PRESETS: readonly LayeredAudioPreset[] = [
  {
    id: "rainy-fireside",
    title: "Rainy Fireside",
    description: "Gentle rain, fireplace, and soft piano.",
    environmentTrackIds: [
      LAYERED_TRACK_IDS.gentleRain,
      LAYERED_TRACK_IDS.fireplace,
    ],
    musicTrackId: LAYERED_TRACK_IDS.softPiano,
    voiceTrackId: null,
  },
  {
    id: "morning-garden",
    title: "Morning Garden",
    description: "Birds, a quiet stream, and soft studio music.",
    environmentTrackIds: [
      LAYERED_TRACK_IDS.morningBirds,
      LAYERED_TRACK_IDS.stream,
      LAYERED_TRACK_IDS.forestBirds,
    ],
    musicTrackId: LAYERED_TRACK_IDS.acousticStudio,
    voiceTrackId: LAYERED_TRACK_IDS.morningReflection,
  },
  {
    id: "cozy-reading",
    title: "Cozy Reading",
    description: "Fireplace, soft rain, and quiet piano.",
    environmentTrackIds: [
      LAYERED_TRACK_IDS.fireplace,
      LAYERED_TRACK_IDS.gentleRain,
    ],
    musicTrackId: LAYERED_TRACK_IDS.quietPiano,
    voiceTrackId: null,
  },
  {
    id: "woodland-reset",
    title: "Woodland Reset",
    description: "Forest birds and stream — optional breathing guidance.",
    environmentTrackIds: [
      LAYERED_TRACK_IDS.forestBirds,
      LAYERED_TRACK_IDS.stream,
      LAYERED_TRACK_IDS.morningBirds,
    ],
    musicTrackId: null,
    voiceTrackId: LAYERED_TRACK_IDS.breathingGuidance,
  },
];

export function layeredAudioPresetById(
  id: string,
): LayeredAudioPreset | undefined {
  return LAYERED_AUDIO_PRESETS.find((preset) => preset.id === id);
}
