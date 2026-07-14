/**
 * Canonical Estate place media — backgrounds + ambience on disk.
 *
 * **Manifest:** Primary backgrounds and videos resolve from
 * `ESTATE_PLACE_MASTER_MANIFEST.json` first; `CANONICAL_PLACE_BACKGROUNDS` is legacy fallback.
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
import { getPlaceMedia } from "./manifest/estatePlaceMasterManifest";
import {
  APPLE_ORCHARD_AMBIENCE_MP3,
  COFFEE_HOUSE_AMBIENCE_MP3,
  MUSIC_LOFT_AMBIENCE_MP3,
  OCEAN_CONSERVATORY_AMBIENCE_MP3,
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
  conservatory: estateBackgroundPath("aquarium-room-background.png"),
  "clear-my-mind": estateBackgroundPath(
    "treehouse-possibility-reflection-desk-background.png",
  ),
  "destination-gallery": estateBackgroundPath("destination-gallery.png"),
  "coffee-house": estateBackgroundPath("tea-room-background.webp"),
  "tea-room": estateBackgroundPath("tea-room-background.webp"),
  "dining-room": estateBackgroundPath("room-dining-room-background.png"),
  "estate-kitchen": estateBackgroundPath("kitchen-background.png"),
  "grand-terrace": estateBackgroundPath("grand-terrace-background.png"),
  "lakeside-verandah": estateBackgroundPath("grand-terrace-background.png"),
  "lakeside-hammock": estateBackgroundPath("water-lakeside-hammock-background.png"),
  "discovery-room": estateBackgroundPath("room-discovery-room-background.png"),
  "estate-gardens": estateBackgroundPath("spark-estate-photo-background.png"),
  "music-room": estateBackgroundPath("writing-room-background.png"),
  greenhouse: estateBackgroundPath("greenhouse-background.png"),
  "apple-orchard": estateBackgroundPath("apple-orchard-kinsey-background.png"),
  gardens: estateBackgroundPath("swing-background.png"),
  "celebration-room": estateBackgroundPath("room-celebration-hall-background.png"),
  "reading-nook": estateBackgroundPath("reading-nook-window background.png"),
  library: estateBackgroundPath("room-library-estate-background.png"),
  "personal-library": estateBackgroundPath("reading-nook-under-stairway-background.png"),
  "momentum-institute": estateBackgroundPath("spark-chamber-of-momentum-background.png"),
  "chamber-of-momentum": estateBackgroundPath("spark-chamber-of-momentum-background.png"),
  "creative-studio": estateBackgroundPath("art-studio-background.png"),
  "focus-studio": estateBackgroundPath(
    "cartoghraphers-studio-background.png",
  ),
  "cartographers-studio": estateBackgroundPath(
    "cartoghraphers-studio-background.png",
  ),
  "art-studio": estateBackgroundPath("art-studio-background.png"),
  observatory: estateBackgroundPath("observatory-daytime-outside-background.png"),
  "observatory-day-inside": estateBackgroundPath("observatory-daytime-inside.png"),
  "observatory-day-outside": estateBackgroundPath(
    "observatory-daytime-outside-background.png",
  ),
  "observatory-night-outside": estateBackgroundPath(
    "observatory-night-outside-background.png",
  ),
  "study-hall": estateBackgroundPath("study-hall-background.png"),
  stables: estateBackgroundPath("spark-estate-stables-background.png"),
  "game-room": estateBackgroundPath("spark-chamber-of-momentum-background.png"),
  "momentum-builder": estateBackgroundPath("study-hall-background.png"),
  "strategy-studio": estateBackgroundPath("creative-studio-background.png"),
  "momentum-room": estateBackgroundPath("spark-chamber-of-momentum-background.png"),
  "round-table": estateBackgroundPath("round-table-boardroom-background.png"),
  "summer-terrace": estateBackgroundPath("water-swimming-pool-private-background.png"),
  "decision-compass": estateBackgroundPath("writing-room-background.png"),
  "writing-room": estateBackgroundPath("writing-room-background.png"),
  journal: `${estateBackgroundPath("journal-desk-background.png")}?v=20260710b`,
  /* Open-portal plate — closed doors live only on the entrance overlay. */
  "evidence-vault": estateBackgroundPath("evidence-vault-room-static.png"),
  "gallery-of-firsts": estateBackgroundPath("gallery-background.png"),
  portfolio: estateBackgroundPath("hall-of-achievements-room-background.png"),
  "goals-projects": estateBackgroundPath("project-room.png"),
  "peaceful-places": estateBackgroundPath("water-seat-at-pond-background.png"),
  "seat-at-pond": estateBackgroundPath("water-seat-at-pond-background.png"),
  "reflection-pond": estateBackgroundPath("water-seat-at-pond-background.png"),
  "garden-bench": estateBackgroundPath("greenhouse-background.png"),
  "back-deck": estateBackgroundPath("fireside-deck-background.PNG"),
  "fireside-deck": estateBackgroundPath("fireside-deck-background.PNG"),
  "personal-deck": estateBackgroundPath("grand-terrace-background.png"),
  "porch-swing": estateBackgroundPath("swing-background.png"),
  "the-swing-beneath-the-oak": estateBackgroundPath("swing-background.png"),
  "window-seat": estateBackgroundPath("reading-nook-under-stairway-background.png"),
  balcony: estateBackgroundPath("grand-terrace-background.png"),
  "woodland-path": estateBackgroundPath("swing-background.png"),
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
    "observatory-daytime-outside-background.png",
  ),
  "house-possibility-telescope-deck": estateBackgroundPath(
    "observatory-daytime-outside-background.png",
  ),
  "house-possibility-cabinet-of-chapters": estateBackgroundPath(
    "treehouse-possibility-discovery-chest-background.png",
  ),
  "house-possibility-curiosity-cabinet": estateBackgroundPath(
    "treehouse-possibility-discovery-chest-background.png",
  ),
  "house-possibility-discovery-chest": estateBackgroundPath(
    "treehouse-possibility-discovery-chest-background.png",
  ),
  "house-possibility-legacy-room": estateBackgroundPath(
    "treehouse-possibility-house-outside-background.png",
  ),
  "legacy-room-main": estateBackgroundPath(
    "treehouse-possibility-house-outside-background.png",
  ),
  "reflection-tree-main": estateBackgroundPath("swing-background.png"),
  "butterfly-house": estateBackgroundPath("butterfly-house-background.png"),
};

/** Ordered fallbacks when primary plate fails to load. */
export const CANONICAL_PLACE_BACKGROUND_FALLBACKS: Readonly<
  Record<string, readonly string[]>
> = {
  "celebration-room": [estateBackgroundPath("greenhouse-background.png")],
  conservatory: [
    estateBackgroundPath("aquarium-room-background.png"),
    estateBackgroundPath("sunroom-background.png"),
  ],
  "clear-my-mind": [
    estateBackgroundPath("treehouse-possibility-reflection-desk-background.png"),
    estateBackgroundPath("sunroom-background.png"),
  ],
  "destination-gallery": [
    estateBackgroundPath("destination-gallery.png"),
  ],
  library: [
    estateBackgroundPath("reading-nook-under-stairway-background.png"),
    estateBackgroundPath("room-library-estate-background.png"),
  ],
  greenhouse: [estateBackgroundPath("greenhouse-background.png")],
  "dining-room": [estateBackgroundPath("tea-room-background.webp")],
  "estate-kitchen": [
    estateBackgroundPath("tea-room-background.webp"),
    estateBackgroundPath("room-dining-room-background.png"),
  ],
  "grand-terrace": [
    estateBackgroundPath("water-lakeside-hammock-background.png"),
    estateBackgroundPath("fireside-deck-background.PNG"),
  ],
  "estate-gardens": [
    estateBackgroundPath("welcome-home-background.png"),
  ],
  gardens: [
    estateBackgroundPath("spark-estate-photo-background.png"),
  ],
  "apple-orchard": [
    estateBackgroundPath("apple-orchard-kinsey-background.png"),
    estateBackgroundPath("swing-background.png"),
  ],
  "the-swing-beneath-the-oak": [
    estateBackgroundPath("swing-background.png"),
  ],
  "reading-nook": [
    estateBackgroundPath("reading-nook-under-stairway-background.png"),
  ],
  "back-deck": [
    estateBackgroundPath("fireside-deck-background.PNG"),
    estateBackgroundPath("grand-terrace-background.png"),
  ],
  "lakeside-verandah": [estateBackgroundPath("grand-terrace-background.png")],
  "lakeside-hammock": [
    estateBackgroundPath("water-seat-at-pond-background.png"),
    estateBackgroundPath("grand-terrace-background.png"),
  ],
  "creative-studio": [estateBackgroundPath("writing-room-background.png")],
  "gallery-of-firsts": [
    estateBackgroundPath("hall-of-achievements-room-background.png"),
  ],
  observatory: [
    estateBackgroundPath("observatory-daytime-inside.png"),
    estateBackgroundPath("observatory-night-outside-background.png"),
  ],
  "personal-deck": [
    estateBackgroundPath("grand-terrace-background.png"),
  ],
  "reflection-pond": [
    estateBackgroundPath("water-seat-at-pond-background.png"),
  ],
  "momentum-room": [estateBackgroundPath("study-hall-background.png")],
  "round-table": [estateBackgroundPath("creative-studio-background.png")],
  "summer-terrace": [
    estateBackgroundPath("water-lakeside-hammock-background.png"),
    estateBackgroundPath("grand-terrace-background.png"),
  ],
  "music-room": [
    estateBackgroundPath("writing-room-background.png"),
    estateBackgroundPath("tea-room-background.webp"),
  ],
  stables: [
    estateBackgroundPath("spark-estate-stables-background.png"),
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
    src: OCEAN_CONSERVATORY_AMBIENCE_MP3,
    volume: 0.11,
    character: "indoor aquarium, gentle water hush, living tank",
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
  const manifestMedia = getPlaceMedia(placeId);
  if (manifestMedia.backgroundUrl) return manifestMedia.backgroundUrl;
  return CANONICAL_PLACE_BACKGROUNDS[placeId] ?? null;
}

/** Approved room experience video from manifest (never substitute similar locations). */
export function resolveCanonicalPlaceVideo(placeId: string): string | null {
  const manifestMedia = getPlaceMedia(placeId);
  return manifestMedia.videoUrl;
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
