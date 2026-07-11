import type { Soundscape, SoundscapeMood, SoundscapeMoodId } from "./types";
import {
  BEDROOM_WINDOW_AMBIENCE_MP3,
  BRIGHT_STUDIO_AMBIENCE_MP3,
  COFFEE_SHOP_AMBIENCE_MP3,
  EAST_TERRACE_AMBIENCE_MP3,
  EVENING_HEARTH_AMBIENCE_MP3,
  GAZEBO_JOURNAL_AMBIENCE_MP3,
  MINUTE_OF_PEACE_AMBIENCE_MP3,
  MUSIC_LOFT_AMBIENCE_MP3,
  OCEAN_CONSERVATORY_AMBIENCE_MP3,
  ORCHARD_BIRDS_AMBIENCE_MP3,
  TIN_ROOF_RAIN_AMBIENCE_MP3,
} from "./audioAssets";

/** @deprecated Use PEACEFUL_PLACES_SUBTITLE from lib/peacefulPlaces/directory */
export const SOUNDSCAPE_INTRO =
  "Take a gentle pause. Choose the place that feels right." as const;

export const SOUNDSCAPE_SUBCOPY =
  "Each destination is a place on the Estate where you can spend a little time." as const;

export const SOUNDSCAPE_MOODS: readonly SoundscapeMood[] = [
  { id: "calming", label: "Slow Down" },
  { id: "focus", label: "Focus" },
  { id: "unwind", label: "Unwind" },
  { id: "energize", label: "Recharge" },
] as const;

export const SOUNDSCAPES: readonly Soundscape[] = [
  {
    id: "summer-storm",
    mood: "calming",
    emoji: "🌧️",
    title: "Summer Storm",
    environment: "Covered Back Deck",
    destinationName: "Covered Deck",
    experience: "Summer Storm",
    tagline: "Warm rain on the cedar roof while the world slows down.",
    description:
      "Sit beneath the cedar roof while warm summer rain falls on the metal above. Distant thunder rolls, rain murmurs through the chain, and the gardens soften in the storm — dry cushions, warm lanterns, nowhere you need to be.",
    playbackUrl: TIN_ROOF_RAIN_AMBIENCE_MP3,
    peacefulPlaceId: "summer-storm-covered-deck",
    signature: true,
  },
  {
    id: "morning-garden",
    mood: "calming",
    emoji: "🌿",
    title: "Morning Garden",
    environment: "Garden Terrace",
    destinationName: "Garden Terrace",
    experience: "Morning Garden",
    tagline: "Gentle birdsong as the garden wakes around you.",
    description:
      "Gentle birdsong, soft breezes, and a peaceful garden awakening around you.",
    playbackUrl: ORCHARD_BIRDS_AMBIENCE_MP3,
  },
  {
    id: "ocean-waves",
    mood: "calming",
    emoji: "🌊",
    title: "Ocean Waves",
    environment: "Cliffside Overlook",
    destinationName: "Cliffside Overlook",
    experience: "Ocean Waves",
    tagline: "Steady waves below a wide horizon — nowhere you need to be.",
    description:
      "Steady waves roll in below the overlook — salt air, wide horizon, and nowhere you need to be.",
    playbackUrl: OCEAN_CONSERVATORY_AMBIENCE_MP3,
  },
  {
    id: "fireside-retreat",
    mood: "calming",
    emoji: "🔥",
    title: "Fireside Retreat",
    environment: "Stone Fireplace Room",
    destinationName: "Stone Hearth Room",
    experience: "Fireside Retreat",
    tagline: "Low fire crackle and quiet warmth holding you.",
    description:
      "A low fire crackles in the stone hearth while the room holds you in quiet warmth.",
    playbackUrl: EVENING_HEARTH_AMBIENCE_MP3,
  },
  {
    id: "coffee-shop",
    mood: "focus",
    emoji: "☕",
    title: "Coffee Shop",
    environment: "Cozy Café",
    destinationName: "Cozy Café",
    experience: "Coffee Shop",
    tagline: "Soft murmur and gentle rhythm while you think nearby.",
    description:
      "Soft café murmur, gentle clinking cups, and the steady hum of people working nearby.",
    playbackUrl: COFFEE_SHOP_AMBIENCE_MP3,
    peacefulPlaceId: "cozy-cafe",
  },
  {
    id: "quiet-library",
    mood: "focus",
    emoji: "📚",
    title: "Quiet Library",
    environment: "Estate Library",
    destinationName: "Estate Library",
    experience: "Quiet Shelves",
    tagline: "Deep quiet built for thinking.",
    description:
      "Tall shelves, muffled footsteps, and the deep quiet of a room built for thinking.",
    playbackUrl: GAZEBO_JOURNAL_AMBIENCE_MP3,
  },
  {
    id: "airplane-cabin",
    mood: "focus",
    emoji: "✈️",
    title: "Airplane Cabin",
    environment: "Window Seat",
    destinationName: "Window Seat",
    experience: "Airplane Cabin",
    tagline: "Cabin hush miles above the world.",
    description:
      "Cabin hush and gentle engine drone — a pocket of calm miles above the world.",
    playbackUrl: MINUTE_OF_PEACE_AMBIENCE_MP3,
  },
  {
    id: "brown-noise",
    mood: "focus",
    emoji: "🌧️",
    title: "Brown Noise",
    environment: "Quiet Study",
    destinationName: "Quiet Study",
    experience: "Brown Noise",
    tagline: "Deep steady sound that softens everything else.",
    description:
      "Deep, steady brown noise to soften distractions and help your thoughts line up.",
    playbackUrl: TIN_ROOF_RAIN_AMBIENCE_MP3,
  },
  {
    id: "deep-focus-piano",
    mood: "focus",
    emoji: "🎼",
    title: "Deep Focus Piano",
    environment: "Music Room",
    destinationName: "Music Room",
    experience: "Deep Focus Piano",
    tagline: "Gentle piano that keeps you company without asking.",
    description:
      "Gentle piano lines that keep you company without asking for your attention.",
    playbackUrl: MUSIC_LOFT_AMBIENCE_MP3,
  },
  {
    id: "gentle-rain",
    mood: "unwind",
    emoji: "🌙",
    title: "Gentle Rain",
    environment: "Bedroom Window",
    destinationName: "Bedroom Window",
    experience: "Gentle Rain",
    tagline: "Soft rain on glass while the room stays still.",
    description:
      "Soft rain on the glass while the room stays warm and still.",
    playbackUrl: BEDROOM_WINDOW_AMBIENCE_MP3,
    peacefulPlaceId: "bedroom-window",
  },
  {
    id: "fireplace-night",
    mood: "unwind",
    emoji: "🔥",
    title: "Fireplace at Night",
    environment: "Evening Hearth",
    destinationName: "Evening Hearth",
    experience: "Fireplace at Night",
    tagline: "Embers glowing low as the day lets go.",
    description:
      "Embers glow low while the fire breathes slow and the day lets go.",
    playbackUrl: EVENING_HEARTH_AMBIENCE_MP3,
    peacefulPlaceId: "evening-hearth",
  },
  {
    id: "night-forest",
    mood: "unwind",
    emoji: "🌌",
    title: "Night Forest",
    environment: "Woodland Path",
    destinationName: "Woodland Path",
    experience: "Night Forest",
    tagline: "Crickets and owl hush under a wide night sky.",
    description:
      "Crickets, distant owls, and the hush of trees under a wide night sky.",
    playbackUrl: ORCHARD_BIRDS_AMBIENCE_MP3,
  },
  {
    id: "ocean-night",
    mood: "unwind",
    emoji: "🌊",
    title: "Ocean at Night",
    environment: "Moonlit Shore",
    destinationName: "Moonlit Shore",
    experience: "Ocean at Night",
    tagline: "Slow waves in the dark, easy to drift with.",
    description:
      "Slow waves in the dark — rhythmic, distant, and easy to drift with.",
    playbackUrl: OCEAN_CONSERVATORY_AMBIENCE_MP3,
  },
  {
    id: "nature-escape",
    mood: "energize",
    emoji: "🌿",
    title: "Nature Escape",
    environment: "Nature Escape",
    destinationName: "Nature Escape",
    experience: "Nature Escape",
    tagline: "Creek, birds, and wildflowers — room to fill your cup again.",
    description:
      "A sunlit garden nook — flowing creek, birdsong, hammock shade, wildflowers, and a gentle breeze while guided recharge moments meet you where you are.",
    playbackUrl: ORCHARD_BIRDS_AMBIENCE_MP3,
    peacefulPlaceId: "nature-escape",
  },
  {
    id: "sunrise-terrace",
    mood: "energize",
    emoji: "🌅",
    title: "Sunrise Terrace",
    environment: "East Terrace",
    destinationName: "East Terrace",
    experience: "Morning Whisper in the Garden",
    tagline: "Golden light lifting you into the day.",
    description:
      "Golden light across the estate terrace. Coffee beside you, gardens waking up, and a soft morning melody that lifts you into the day without rushing you.",
    playbackUrl: EAST_TERRACE_AMBIENCE_MP3,
    peacefulPlaceId: "east-terrace",
  },
  {
    id: "movement-studio",
    mood: "energize",
    emoji: "⚡",
    title: "Movement Studio",
    environment: "Bright Studio",
    destinationName: "Bright Studio",
    experience: "Movement Studio",
    tagline: "Clean open space and a beat to get unstuck.",
    description:
      "Wide windows, clean open floor, and a steady driving beat — enough energy to get unstuck and start moving.",
    playbackUrl: BRIGHT_STUDIO_AMBIENCE_MP3,
    peacefulPlaceId: "bright-studio",
  },
] as const;

export function soundscapesForMood(mood: SoundscapeMoodId): Soundscape[] {
  return SOUNDSCAPES.filter((s) => s.mood === mood);
}

export function soundscapeById(id: string): Soundscape | undefined {
  return SOUNDSCAPES.find((s) => s.id === id);
}

export function soundscapeDisplayLabel(soundscape: Soundscape): string {
  return soundscape.destinationName;
}
