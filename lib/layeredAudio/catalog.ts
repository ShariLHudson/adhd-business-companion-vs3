/**
 * Layered audio catalogs — Environment / Music / Voice.
 * Sources reference owned public/audio assets. Unavailable sources skip in presets.
 */

import { EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS } from "@/lib/soundscapes/experienceSoundscapesMenu";
import { PEACEFUL_PLACES_MUSIC_TRACKS } from "@/lib/soundscapes/experienceSoundscapesMenu";
import type {
  EnvironmentCategory,
  LayeredCatalogTrack,
  SensoryIntensity,
} from "./types";
import { DEFAULT_TRACK_VOLUME } from "./constants";

type EnvMeta = {
  category: EnvironmentCategory;
  defaultVolume?: number;
  sensoryIntensity?: SensoryIntensity;
  compatibilityTags?: readonly string[];
  recommendedPairings?: readonly string[];
  /** Friendly title override for the mixer. */
  title?: string;
};

const ENVIRONMENT_META: Record<string, EnvMeta> = {
  "soundscape-gentle-rain-on-a-tin": {
    category: "Weather",
    title: "Gentle Rain",
    defaultVolume: 0.6,
    sensoryIntensity: "soft",
    compatibilityTags: ["rain", "weather", "calm"],
    recommendedPairings: [
      "soundscape-fireplace-crackling-fire",
      "peaceful-place-morning-whisper",
    ],
  },
  "soundscape-morning-birdsong": {
    category: "Nature",
    title: "Morning Birds",
    defaultVolume: 0.25,
    sensoryIntensity: "soft",
    compatibilityTags: ["birds", "morning"],
    recommendedPairings: [
      "soundscape-gentle-rain-on-a-tin",
      "soundscape-water-fountain",
    ],
  },
  "soundscape-birds-singing-in-early-summer": {
    category: "Nature",
    title: "Early Summer Birds",
    defaultVolume: 0.3,
    sensoryIntensity: "moderate",
    compatibilityTags: ["birds", "forest"],
  },
  "soundscape-bird-song": {
    category: "Nature",
    title: "Bird Song",
    defaultVolume: 0.28,
    sensoryIntensity: "soft",
    compatibilityTags: ["birds"],
  },
  "soundscape-greenhouse-birds-ambience": {
    category: "Nature",
    title: "Forest Birds",
    defaultVolume: 0.3,
    sensoryIntensity: "soft",
    compatibilityTags: ["birds", "greenhouse"],
  },
  "soundscape-fireplace-crackling-fire": {
    category: "Cozy Spaces",
    title: "Fireplace",
    defaultVolume: 0.35,
    sensoryIntensity: "moderate",
    compatibilityTags: ["fire", "cozy"],
    recommendedPairings: [
      "soundscape-gentle-rain-on-a-tin",
      "peaceful-place-morning-whisper",
    ],
  },
  "soundscape-water-fountain": {
    category: "Water",
    title: "Stream",
    defaultVolume: 0.4,
    sensoryIntensity: "soft",
    compatibilityTags: ["water", "stream"],
  },
  "soundscape-aquarium-bubbles": {
    category: "Water",
    title: "Aquarium Bubbles",
    defaultVolume: 0.35,
    sensoryIntensity: "soft",
    compatibilityTags: ["water"],
  },
  "soundscape-coffee-shop-chatter-audio": {
    category: "Community Spaces",
    title: "Coffee Shop Chatter",
    defaultVolume: 0.28,
    sensoryIntensity: "rich",
    compatibilityTags: ["community"],
  },
  "soundscape-crickets-birds-and-bee-flight": {
    category: "Nature",
    title: "Crickets and Bees",
    defaultVolume: 0.3,
    sensoryIntensity: "moderate",
    compatibilityTags: ["nature", "evening"],
  },
  "soundscape-frogs-croaking-at-night": {
    category: "Nature",
    title: "Night Frogs",
    defaultVolume: 0.28,
    sensoryIntensity: "moderate",
    compatibilityTags: ["nature", "night"],
  },
  "soundscape-church-bells-clock-chime": {
    category: "Community Spaces",
    title: "Church Bells",
    defaultVolume: 0.25,
    sensoryIntensity: "moderate",
    compatibilityTags: ["community"],
  },
};

const MUSIC_TITLE_OVERRIDES: Record<string, string> = {
  "peaceful-place-morning-whisper": "Soft Piano",
  "peaceful-place-lofty-studio": "Quiet Piano",
  "peaceful-place-evening-reflections": "Evening Reflections",
  "peaceful-place-bright-studio": "Acoustic Studio",
};

/**
 * Spoken Voice catalog. Sources may be added over time; missing files
 * are skipped by presets and surface a calm error on intentional Play.
 */
export const LAYERED_VOICE_CATALOG: readonly LayeredCatalogTrack[] = [
  {
    id: "voice-peaceful-morning-reflection",
    title: "Peaceful Morning Reflection",
    layer: "voice",
    category: "Voice",
    source: "/audio/voice/peaceful-morning-reflection.mp3",
    defaultVolume: 0.85,
    loop: false,
    compatibilityTags: ["reflection", "morning"],
    sensoryIntensity: "soft",
  },
  {
    id: "voice-breathing-guidance",
    title: "Breathing Guidance",
    layer: "voice",
    category: "Voice",
    source: "/audio/voice/breathing-guidance.mp3",
    defaultVolume: 0.85,
    loop: false,
    compatibilityTags: ["breathing", "reset"],
    sensoryIntensity: "soft",
  },
];

function ambientIdFromExperience(id: string): string {
  return id;
}

export function buildEnvironmentCatalog(): LayeredCatalogTrack[] {
  return EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.map((track) => {
    const meta = ENVIRONMENT_META[ambientIdFromExperience(track.id)];
    return {
      id: track.id,
      title: meta?.title ?? track.title,
      layer: "environment" as const,
      category: meta?.category ?? "Nature",
      source: track.src,
      defaultVolume: meta?.defaultVolume ?? DEFAULT_TRACK_VOLUME,
      loop: true,
      compatibilityTags: meta?.compatibilityTags,
      sensoryIntensity: meta?.sensoryIntensity,
      recommendedPairings: meta?.recommendedPairings,
    };
  });
}

export function buildMusicCatalog(): LayeredCatalogTrack[] {
  return PEACEFUL_PLACES_MUSIC_TRACKS.map((track) => ({
    id: track.id,
    title: MUSIC_TITLE_OVERRIDES[track.id] ?? track.title,
    layer: "music" as const,
    category: "Music" as const,
    source: track.src,
    defaultVolume: 0.45,
    loop: true,
    compatibilityTags: ["music"],
    sensoryIntensity: "soft" as const,
  }));
}

let cachedCatalog: LayeredCatalogTrack[] | null = null;

export function layeredAudioCatalog(): readonly LayeredCatalogTrack[] {
  if (!cachedCatalog) {
    cachedCatalog = [
      ...buildEnvironmentCatalog(),
      ...buildMusicCatalog(),
      ...LAYERED_VOICE_CATALOG,
    ];
  }
  return cachedCatalog;
}

export function layeredCatalogTrackById(
  id: string,
): LayeredCatalogTrack | undefined {
  return layeredAudioCatalog().find((track) => track.id === id);
}

export function environmentCatalogTracks(): LayeredCatalogTrack[] {
  return layeredAudioCatalog().filter((t) => t.layer === "environment");
}

export function musicCatalogTracks(): LayeredCatalogTrack[] {
  return layeredAudioCatalog().filter((t) => t.layer === "music");
}

export function voiceCatalogTracks(): LayeredCatalogTrack[] {
  return layeredAudioCatalog().filter((t) => t.layer === "voice");
}

/** Well-known IDs for presets and tests. */
export const LAYERED_TRACK_IDS = {
  gentleRain: "soundscape-gentle-rain-on-a-tin",
  morningBirds: "soundscape-morning-birdsong",
  fireplace: "soundscape-fireplace-crackling-fire",
  stream: "soundscape-water-fountain",
  forestBirds: "soundscape-greenhouse-birds-ambience",
  softPiano: "peaceful-place-morning-whisper",
  quietPiano: "peaceful-place-lofty-studio",
  acousticStudio: "peaceful-place-bright-studio",
  morningReflection: "voice-peaceful-morning-reflection",
  breathingGuidance: "voice-breathing-guidance",
} as const;
