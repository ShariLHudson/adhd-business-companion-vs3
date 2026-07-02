/**
 * Estate Place Ambient Sound™ — Layer 1 identity sound per canonical place.
 * Natural sound of being there — not music tracks or playlists.
 *
 * @see docs/estate/ESTATE_AMBIENT_SOUND_SYSTEM.md (spec)
 */

import { resolveCanonicalPlaceId } from "./canonicalEstateRegistry";
import type { EstateArrivalAmbienceProfile } from "./estateArrivalExperienceTypes";
import { resolveCanonicalPlaceAmbience } from "./estatePlaceMedia";
import {
  COFFEE_SHOP_AMBIENCE_MP3,
  EVENING_HEARTH_AMBIENCE_MP3,
  GAZEBO_JOURNAL_AMBIENCE_MP3,
  GREENHOUSE_BIRDS_AMBIENCE_MP3,
  HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  ORCHARD_BIRDS_AMBIENCE_MP3,
  TIN_ROOF_RAIN_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";

/** Gazebo™ shares journal place id — fountain-forward regulation space. */
export const GAZEBO_PLACE_ID = "journal";

/**
 * Authoritative Layer 1 mapping — place identity ambience.
 * Keys are canonical `placeId` values only.
 */
export const ESTATE_PLACE_AMBIENT_SOUND: Readonly<
  Record<string, EstateArrivalAmbienceProfile>
> = {
  [GAZEBO_PLACE_ID]: {
    src: GAZEBO_JOURNAL_AMBIENCE_MP3,
    volume: 0.14,
    character: "running fountain water, soft wind, subtle birds",
  },
  "reading-nook": {
    src: EVENING_HEARTH_AMBIENCE_MP3,
    volume: 0.12,
    character: "fireplace crackle, occasional page turn, soft house wind",
  },
  "main-staircase": {
    src: EVENING_HEARTH_AMBIENCE_MP3,
    volume: 0.1,
    character:
      "fireplace hush below the stairs, soft creaks, unhurried house air",
  },
  "window-seat": {
    src: EVENING_HEARTH_AMBIENCE_MP3,
    volume: 0.09,
    character: "distant fireplace warmth, quiet house, garden air through glass",
  },
  greenhouse: {
    src: GREENHOUSE_BIRDS_AMBIENCE_MP3,
    volume: 0.07,
    character: "birds, soft breeze, light water droplets",
  },
  "back-deck": {
    src: TIN_ROOF_RAIN_AMBIENCE_MP3,
    volume: 0.11,
    character: "rain on the roof, wind through trees, distant nature",
  },
  "coffee-house": {
    src: COFFEE_SHOP_AMBIENCE_MP3,
    volume: 0.13,
    character: "soft café chatter, cups, espresso machine hum",
  },
  conservatory: {
    src: GREENHOUSE_BIRDS_AMBIENCE_MP3,
    volume: 0.065,
    character: "soft birdsong, glass hush, light flutter movement",
  },
  "clear-my-mind": {
    src: GREENHOUSE_BIRDS_AMBIENCE_MP3,
    volume: 0.07,
    character: "soft birdsong, conservatory hush, gentle clarity",
  },
  stables: {
    src: HALL_OF_REFLECTIONS_AMBIENCE_MP3,
    volume: 0.09,
    character: "horses shifting, soft leather creaks, distant birds",
  },
  /** Lakeside Hammock™ proxy until dedicated place ships. */
  "seat-at-pond": {
    src: ORCHARD_BIRDS_AMBIENCE_MP3,
    volume: 0.1,
    character: "lake water movement, wind in trees, evening insects",
  },
  "garden-path": {
    src: ORCHARD_BIRDS_AMBIENCE_MP3,
    volume: 0.09,
    character: "irrigation water, birds, soft wind through plants",
  },
};

const GAZEBO_ALIASES = new Set(["gazebo", "the gazebo", "gazebo journal"]);

function normalizePlaceKey(placeId: string): string {
  const id = resolveCanonicalPlaceId(placeId);
  const lower = id.trim().toLowerCase();
  if (GAZEBO_ALIASES.has(lower)) return GAZEBO_PLACE_ID;
  return id;
}

/** Resolve Layer 1 ambient profile for a canonical place. */
export function resolveEstatePlaceAmbientProfile(
  placeId: string,
): EstateArrivalAmbienceProfile | null {
  const id = normalizePlaceKey(placeId);
  const layered = ESTATE_PLACE_AMBIENT_SOUND[id];
  if (layered) return layered;
  const media = resolveCanonicalPlaceAmbience(id);
  if (media) return media;
  return null;
}

/** Places in the acceptance sequence — Reading Nook → Gazebo → Greenhouse. */
export const ESTATE_AMBIENT_ACCEPTANCE_SEQUENCE = [
  "reading-nook",
  GAZEBO_PLACE_ID,
  "greenhouse",
] as const;
