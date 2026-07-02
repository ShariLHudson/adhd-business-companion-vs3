/**
 * Canonical Estate place media — backgrounds + ambience on disk.
 *
 * Filenames match `public/backgrounds/` and `public/audio/` (member-renamed assets).
 * Spaces in filenames are URL-encoded at runtime.
 *
 * @see docs/estate/P0_CANON_ERRATA.md
 * @see docs/estate/ESTATE_AMBIENT_SOUND_SYSTEM.md
 */

import type { EstateArrivalAmbienceProfile } from "./estateArrivalExperienceTypes";
import { resolveCanonicalPlaceId } from "./canonicalEstateRegistry";
import { enrichAmbienceProfileWithIntent } from "./estatePlaceAmbienceIntent";
import { APPLE_ORCHARD_AMBIENCE_MP3 } from "@/lib/soundscapes/audioAssets";

/** Build a public URL for a backgrounds filename (handles spaces). */
export function estateBackgroundPath(filename: string): string {
  return `/backgrounds/${encodeURI(filename)}`;
}

/** Build a public URL for an audio filename. */
export function estateAudioPath(filename: string): string {
  return `/audio/${encodeURI(filename)}`;
}

/** Background plates keyed by canonical `placeId`. */
export const CANONICAL_PLACE_BACKGROUNDS: Readonly<Record<string, string>> = {
  "welcome-home": estateBackgroundPath("welcome-home-background.png"),
  sunroom: estateBackgroundPath("welcome-home-background.png"),
  conservatory: estateBackgroundPath("butterfly-conservatory.webp"),
  "clear-my-mind": estateBackgroundPath("clear-my-mind-background.png"),
  "coffee-house": estateBackgroundPath("coffee-house-background.png"),
  "tea-room": estateBackgroundPath("tea-room-background.webp"),
  "music-room": estateBackgroundPath("music-room-background.png"),
  greenhouse: estateBackgroundPath("greenhouse-background.png"),
  gardens: estateBackgroundPath("celebration-garden-background.png"),
  "celebration-room": estateBackgroundPath("celebration-room-background.png"),
  "apple-orchard": estateBackgroundPath("apple-orchard-background.png"),
  "reading-nook": estateBackgroundPath(
    "arched-window reading-nook-background.png",
  ),
  library: estateBackgroundPath("estate-library-background.png"),
  "momentum-institute": estateBackgroundPath(
    "the-momentum-institute-background .png",
  ),
  "creative-studio": estateBackgroundPath("creative-studio-background.png"),
  observatory: estateBackgroundPath("study-hall-background.png"),
  stables: estateBackgroundPath("spark-estate-stables-background.png"),
  "game-room": estateBackgroundPath("exercise-room-background.png"),
  "momentum-builder": estateBackgroundPath("study-hall-background.png"),
  "decision-compass": estateBackgroundPath("writing-room-background.png"),
  journal: estateBackgroundPath("gazebo-journal-background.png"),
  "evidence-vault": estateBackgroundPath("evidence-vault-background.png"),
  portfolio: estateBackgroundPath("accomplisments-room-background.png"),
  "goals-projects": estateBackgroundPath("large-conference-room-background.png"),
  "peaceful-places": estateBackgroundPath("audio-rain-background.png"),
  "seat-at-pond": estateBackgroundPath("seat-at-pond-background.png"),
  "garden-bench": estateBackgroundPath("celebration-garden-background.png"),
  "back-deck": estateBackgroundPath("fireside-deck-background.PNG"),
  "porch-swing": estateBackgroundPath("fireside-deck-background.PNG"),
  "window-seat": estateBackgroundPath(
    "small-library-window-seat-background.PNG",
  ),
  balcony: estateBackgroundPath("private-balcony-sunset-background.PNG"),
  "woodland-path": estateBackgroundPath("discovery-room-background.png"),
  "main-staircase": estateBackgroundPath("stairway-reading-nook-background.png"),
  "my-estate": estateBackgroundPath("spark-estate-photo-background.png"),
  "growth-profile": estateBackgroundPath("greenhouse-background.png"),
};

/** Ordered fallbacks when primary plate fails to load. */
export const CANONICAL_PLACE_BACKGROUND_FALLBACKS: Readonly<
  Record<string, readonly string[]>
> = {
  "celebration-room": [
    estateBackgroundPath("celebration-garden-background.png"),
  ],
  conservatory: [estateBackgroundPath("butterfly-conservatory.webp")],
  "clear-my-mind": [estateBackgroundPath("clear-my-mind-background.png")],
  library: [estateBackgroundPath("stairway-reading-nook-background.png")],
  greenhouse: [estateBackgroundPath("celebration-garden-background.png")],
  "creative-studio": [estateBackgroundPath("artist-studio-background.png")],
};

/** Room-named ambience loops (filename includes place identity). */
export const CANONICAL_PLACE_AMBIENCE: Readonly<
  Record<string, EstateArrivalAmbienceProfile>
> = {
  greenhouse: {
    src: estateAudioPath("greenhouse-birds-ambience.mp3"),
    volume: 0.07,
    character: "soft greenhouse hush, birdsong",
  },
  "growth-profile": {
    src: estateAudioPath("greenhouse-birds-ambience.mp3"),
    volume: 0.07,
    character: "soft greenhouse hush, birdsong",
  },
  "coffee-house": {
    src: estateAudioPath("java-seranade-coffee-house.mp3"),
    volume: 0.14,
    character: "quiet cafe, gentle serenade",
  },
  "celebration-room": {
    src: estateAudioPath("reflections-of-triumph-celebration-garden.mp3"),
    volume: 0.12,
    character: "quiet triumph, garden reflections",
  },
  gardens: {
    src: estateAudioPath("reflections-of-triumph-celebration-garden.mp3"),
    volume: 0.11,
    character: "garden hush, soft celebration air",
  },
  library: {
    src: estateAudioPath("reflections-of-triumph-gallery.mp3"),
    volume: 0.12,
    character: "gallery hush, reflective stillness",
  },
  "momentum-institute": {
    src: estateAudioPath("reflections-of-triumph-gallery.mp3"),
    volume: 0.13,
    character: "study hall hush, quiet prestige",
  },
  observatory: {
    src: estateAudioPath("reflections-of-triumph-gallery.mp3"),
    volume: 0.11,
    character: "quiet study, distant night air",
  },
  "evidence-vault": {
    src: estateAudioPath("reflections-of-triumph-gallery.mp3"),
    volume: 0.1,
    character: "archive hush, soft wood",
  },
  journal: {
    src: estateAudioPath("freesound_community-mustique-water-fountain-27721.mp3"),
    volume: 0.1,
    character: "gazebo fountain, garden hush",
  },
  "growth-journal": {
    src: estateAudioPath("freesound_community-mustique-water-fountain-27721.mp3"),
    volume: 0.1,
    character: "gazebo fountain, garden hush",
  },
  "apple-orchard": {
    src: APPLE_ORCHARD_AMBIENCE_MP3,
    volume: 0.11,
    character: "orchard ambience, open air",
  },
  "reading-nook": {
    src: estateAudioPath("peaceful-places/evening-hearth-ambience.mp3"),
    volume: 0.12,
    character: "fireplace crackle, page turns, soft house air",
  },
  "back-deck": {
    src: estateAudioPath("RAINMetl-Gentle_rain_on_a_tin-Elevenlabs.mp3"),
    volume: 0.11,
    character: "rain on the roof, wind through trees",
  },
  conservatory: {
    src: estateAudioPath("greenhouse-birds-ambience.mp3"),
    volume: 0.065,
    character: "soft birdsong, glass hush, conservatory calm",
  },
  stables: {
    src: estateAudioPath("reflections-of-triumph-gallery.mp3"),
    volume: 0.09,
    character: "horses shifting, leather creaks, distant birds",
  },
  "garden-path": {
    src: estateAudioPath("greenhouse-birds-ambience.mp3"),
    volume: 0.1,
    character: "irrigation water, birds, wind through plants",
  },
  "peaceful-places": {
    src: estateAudioPath("RAINMetl-Gentle_rain_on_a_tin-Elevenlabs.mp3"),
    volume: 0.12,
    character: "gentle rain, still restoration",
  },
  "seat-at-pond": {
    src: estateAudioPath(
      "nils_vega-birds-singing-in-early-summer-359446.mp3",
    ),
    volume: 0.1,
    character: "pond birds, water edge",
  },
  "game-room": {
    src: estateAudioPath("pulse-of-momentum-energy-exercise-room.mp3"),
    volume: 0.13,
    character: "pulse of momentum, light energy, movement room air",
  },
  "welcome-home": {
    src: estateAudioPath("welcome-room/welcome-room-ambience.mp3"),
    volume: 0.12,
    character: "warm hearth, welcome home",
  },
  sunroom: {
    src: estateAudioPath("welcome-room/welcome-room-ambience.mp3"),
    volume: 0.12,
    character: "sunroom warmth, quiet welcome",
  },
  "goals-projects": {
    src: estateAudioPath("reflections-of-triumph-gallery.mp3"),
    volume: 0.06,
    character: "boardroom hush, room tone only",
  },
};

export function resolveCanonicalPlaceBackground(
  placeId: string,
): string | null {
  return CANONICAL_PLACE_BACKGROUNDS[placeId] ?? null;
}

export function resolveCanonicalPlaceBackgroundCandidates(
  placeId: string,
): readonly string[] {
  const primary = resolveCanonicalPlaceBackground(placeId);
  if (!primary) return [];
  const fallbacks = CANONICAL_PLACE_BACKGROUND_FALLBACKS[placeId] ?? [];
  return [primary, ...fallbacks.filter((url) => url !== primary)];
}

export function resolveCanonicalPlaceAmbience(
  placeId: string,
): EstateArrivalAmbienceProfile | undefined {
  const id = resolveCanonicalPlaceId(placeId);
  const base = CANONICAL_PLACE_AMBIENCE[id];
  if (!base) return undefined;
  return enrichAmbienceProfileWithIntent(id, base);
}
