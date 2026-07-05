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
import {
  APPLE_ORCHARD_AMBIENCE_MP3,
  COFFEE_HOUSE_AMBIENCE_MP3,
  MUSIC_LOFT_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";

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
  sunroom: estateBackgroundPath("sunroom-background.png"),
  conservatory: estateBackgroundPath("greenhouse-background.png"),
  "clear-my-mind": estateBackgroundPath("sunroom-background.png"),
  "coffee-house": estateBackgroundPath("room-coffee-house-background.png"),
  "tea-room": estateBackgroundPath("tea-room-background.webp"),
  "dining-room": estateBackgroundPath("room-dining-room-background.png"),
  "estate-kitchen": estateBackgroundPath("kitchen-background.png"),
  "grand-terrace": estateBackgroundPath("grand-estate-background.png"),
  "lakeside-verandah": estateBackgroundPath(
    "water-lakeside-deck-verandah-background.png",
  ),
  "lakeside-hammock": estateBackgroundPath("water-lakeside-hammock-background.png"),
  "discovery-room": estateBackgroundPath("room-discovery-room-background.png"),
  "estate-gardens": estateBackgroundPath("place-estate-gardens-background.png"),
  "music-room": estateBackgroundPath("music-room-background.png"),
  greenhouse: estateBackgroundPath("greenhouse-background.png"),
  gardens: estateBackgroundPath("space-celebration-garden-background.png"),
  "celebration-room": estateBackgroundPath("room-celebration-hall-background.png"),
  "apple-orchard": estateBackgroundPath("space-apple-orchard-background.webp"),
  "reading-nook": estateBackgroundPath("reading-nook-window background.png"),
  library: estateBackgroundPath("room-library-estate-background.png"),
  "personal-library": estateBackgroundPath("room-library-personal-background.png"),
  "momentum-institute": estateBackgroundPath(
    "the-momentum-institute-background.png",
  ),
  "creative-studio": estateBackgroundPath("room-create-studio-background.png"),
  "art-studio": estateBackgroundPath("room-create-studio-background.png"),
  observatory: estateBackgroundPath(
    "observatory-daytime-outside-background.png",
  ),
  "study-hall": estateBackgroundPath("study-hall-background.png"),
  stables: estateBackgroundPath("spark-estate-stables-background.png"),
  "game-room": estateBackgroundPath("game-room- background.webp"),
  "momentum-builder": estateBackgroundPath("study-hall-background.png"),
  "strategy-studio": estateBackgroundPath(
    "strategy-studio-workroom-background.png",
  ),
  "momentum-room": estateBackgroundPath("the-momentum-institute-background.png"),
  "round-table": estateBackgroundPath("round-table-boardroom-background.png"),
  "summer-terrace": estateBackgroundPath(
    "water-swimming-pool-private-background.png",
  ),
  "decision-compass": estateBackgroundPath("writing-room-background.png"),
  journal: estateBackgroundPath("gazebo-journal-background.png"),
  "evidence-vault": estateBackgroundPath("evidence-vault-background.png"),
  "gallery-of-firsts": estateBackgroundPath("gallery-background.png"),
  portfolio: estateBackgroundPath("accomplisments-room-background.png"),
  "goals-projects": estateBackgroundPath("round-table-boardroom-background.png"),
  "peaceful-places": estateBackgroundPath("audio-rain-background.png"),
  "seat-at-pond": estateBackgroundPath("water-seat-at-pond-background.png"),
  "reflection-pond": estateBackgroundPath("water-seat-at-pond-background.png"),
  "garden-bench": estateBackgroundPath("space-celebration-garden-background.png"),
  "back-deck": estateBackgroundPath(
    "peaceful-places/east-terrace-peaceful-places.png",
  ),
  "fireside-deck": estateBackgroundPath("fireside-deck-background.PNG"),
  "personal-deck": estateBackgroundPath("fireside-deck-background.PNG"),
  "porch-swing": estateBackgroundPath("fireside-deck-background.PNG"),
  "window-seat": estateBackgroundPath("reading-nook-under-stairway-background.png"),
  balcony: estateBackgroundPath("private-balcony-sunset-background.PNG"),
  "woodland-path": estateBackgroundPath("peaceful-places/woodland-pathway.png"),
  "main-staircase": estateBackgroundPath("reading-nook-under-stairway-background.png"),
  "stairway-reading-nook": estateBackgroundPath(
    "reading-nook-under-stairway-background.png",
  ),
  "my-estate": estateBackgroundPath("spark-estate-photo-background.png"),
  "spark-estate": estateBackgroundPath("spark-estate-photo-background.png"),
  "growth-profile": estateBackgroundPath("greenhouse-background.png"),
  "house-possibility-outside": estateBackgroundPath(
    "treehouse-possibility-house-outside-background.png",
  ),
  "house-possibility-studio": estateBackgroundPath("treehouse-possibility-studio.png"),
  "house-possibility-staircase": estateBackgroundPath(
    "treehouse-possibility-staircase-window-reading-nook-background.png",
  ),
  "house-possibility-window-nook": estateBackgroundPath(
    "treehouse-possibility-staircase-window-reading-nook-background.png",
  ),
  "house-possibility-reflection-desk": estateBackgroundPath(
    "treehouse-possibility-reflection-desk-background.png",
  ),
  "house-possibility-observatory": estateBackgroundPath(
    "treehouse-possibility-observatory-background.png",
  ),
  "house-possibility-telescope-deck": estateBackgroundPath(
    "treehouse-possibility-observatory-background.png",
  ),
  "house-possibility-cabinet-of-chapters": estateBackgroundPath(
    "treehouse-possibility-cabinet-of-chapters-background.png",
  ),
  "house-possibility-curiosity-cabinet": estateBackgroundPath(
    "treehouse-possibility-cabinet-of-chapters-background.png",
  ),
  "house-possibility-discovery-chest": estateBackgroundPath(
    "treehouse-possibility-discovery-chest-background.png",
  ),
  "house-possibility-legacy-room": estateBackgroundPath(
    "treehouse-possibility-legacy-room-background.png",
  ),
  "legacy-room-main": estateBackgroundPath(
    "treehouse-possibility-legacy-room-background.png",
  ),
};

/** Ordered fallbacks when primary plate fails to load. */
export const CANONICAL_PLACE_BACKGROUND_FALLBACKS: Readonly<
  Record<string, readonly string[]>
> = {
  "celebration-room": [
    estateBackgroundPath("space-celebration-garden-background.png"),
  ],
  conservatory: [estateBackgroundPath("greenhouse-background.png")],
  "clear-my-mind": [estateBackgroundPath("greenhouse-background.png")],
  library: [
    estateBackgroundPath("room-library-personal-background.png"),
    estateBackgroundPath("reading-nook-under-stairway-background.png"),
  ],
  greenhouse: [estateBackgroundPath("space-celebration-garden-background.png")],
  "dining-room": [estateBackgroundPath("tea-room-background.webp")],
  "estate-kitchen": [
    estateBackgroundPath("room-coffee-house-background.png"),
    estateBackgroundPath("room-dining-room-background.png"),
  ],
  "grand-terrace": [
    estateBackgroundPath("fireside-deck-background.PNG"),
    estateBackgroundPath("water-lakeside-deck-verandah-background.png"),
  ],
  "estate-gardens": [
    estateBackgroundPath("greenhouse-background.png"),
    estateBackgroundPath("space-celebration-garden-background.png"),
  ],
  "reading-nook": [
    estateBackgroundPath("reading-nook-under-stairway-background.png"),
  ],
  "back-deck": [
    estateBackgroundPath("fireside-deck-background.PNG"),
    estateBackgroundPath("private-balcony-sunset-background.PNG"),
  ],
  "lakeside-verandah": [
    estateBackgroundPath("private-balcony-sunset-background.PNG"),
  ],
  "lakeside-hammock": [
    estateBackgroundPath("water-seat-at-pond-background.png"),
    estateBackgroundPath("private-balcony-sunset-background.PNG"),
  ],
  "creative-studio": [
    estateBackgroundPath("strategy-studio-workroom-background.png"),
  ],
  "gallery-of-firsts": [
    estateBackgroundPath("hall-of-achievements-room-background.png"),
  ],
  observatory: [
    estateBackgroundPath("observatory-daytime-inside.png"),
    estateBackgroundPath("observatory-night-outside-background.png"),
  ],
  "personal-deck": [
    estateBackgroundPath(
      "peaceful-places/east-terrace-peaceful-places.png",
    ),
    estateBackgroundPath("private-balcony-sunset-background.PNG"),
  ],
  "reflection-pond": [
    estateBackgroundPath("water-seat-at-pond-background.png"),
  ],
  "momentum-room": [estateBackgroundPath("study-hall-background.png")],
  "round-table": [
    estateBackgroundPath("strategy-studio-workroom-background.png"),
  ],
  "summer-terrace": [
    estateBackgroundPath("water-lakeside-deck-verandah-background.png"),
    estateBackgroundPath("water-lakeside-hammock-background.png"),
    estateBackgroundPath("private-balcony-sunset-background.PNG"),
  ],
  "music-room": [
    estateBackgroundPath("peaceful-places/music-room-peaceful-places.png"),
    estateBackgroundPath("room-coffee-house-background.png"),
  ],
  stables: [
    estateBackgroundPath("place-estate-gardens-background.png"),
    estateBackgroundPath("greenhouse-background.png"),
  ],
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
    src: COFFEE_HOUSE_AMBIENCE_MP3,
    volume: 0.14,
    character: "quiet cafe, gentle serenade",
  },
  "music-room": {
    src: MUSIC_LOFT_AMBIENCE_MP3,
    volume: 0.14,
    character: "gentle piano, warm listening room",
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
