/**
 * Master Soundscape Inventory — runtime mirror of Architecture Library #181.
 *
 * Stable AUD-### ids, member display names, original filenames.
 * Audio is reusable globally; signature Scene is suggestion only.
 * Silence is always valid (#163).
 *
 * @see docs/estate/recognition/library/181_MASTER_SOUNDSCAPE_INVENTORY.md
 * @see docs/estate/recognition/library/163_SOUNDSCAPES_ARCHITECTURE.md
 */

import {
  BEDROOM_WINDOW_AMBIENCE_MP3,
  BRIGHT_STUDIO_AMBIENCE_MP3,
  CELEBRATION_ROOM_AMBIENCE_MP3,
  COFFEE_HOUSE_AMBIENCE_MP3,
  COFFEE_SHOP_AMBIENCE_MP3,
  EAST_TERRACE_AMBIENCE_MP3,
  EVENING_HEARTH_AMBIENCE_MP3,
  EXERCISE_ROOM_AMBIENCE_MP3,
  GALLERY_REFLECTIONS_AMBIENCE_MP3,
  GAZEBO_JOURNAL_AMBIENCE_MP3,
  GREENHOUSE_BIRDS_AMBIENCE_MP3,
  MINUTE_OF_PEACE_AMBIENCE_MP3,
  MUSIC_LOFT_AMBIENCE_MP3,
  OCEAN_CONSERVATORY_AMBIENCE_MP3,
  ORCHARD_BIRDS_AMBIENCE_MP3,
  SWIMMING_POOL_AMBIENCE_MP3,
  TIN_ROOF_RAIN_AMBIENCE_MP3,
} from "./audioAssets";

export type MasterSoundscapeCategory =
  | "nature-soundscape"
  | "signature-soundscape"
  | "spark-music"
  | "ambience";

export type MasterSoundscapeMenuGroup =
  | "recommended"
  | "spark-music"
  | "nature"
  | "ambience"
  | "favorites"
  | "silence";

export type MasterSoundscapeAsset = {
  id: `AUD-${string}`;
  displayName: string;
  category: MasterSoundscapeCategory;
  originalFilename: string;
  lengthLabel: string;
  loops: boolean;
  signatureSceneHint: string;
  notes: string;
  /** Resolved public URL when the plate is on disk; null until asset lands. */
  playbackUrl: string | null;
};

/** Recommended audio menu sections (#181). */
export const MASTER_SOUNDSCAPE_MENU_GROUPS: readonly {
  id: MasterSoundscapeMenuGroup;
  label: string;
}[] = [
  { id: "recommended", label: "Recommended for This Scene" },
  { id: "spark-music", label: "Spark Music" },
  { id: "nature", label: "Nature" },
  { id: "ambience", label: "Ambience" },
  { id: "favorites", label: "Favorites / Recently Played" },
  { id: "silence", label: "Silence" },
] as const;

export const MASTER_SOUNDSCAPE_INVENTORY: readonly MasterSoundscapeAsset[] = [
  {
    id: "AUD-001",
    displayName: "Gentle Rain on Tin Roof",
    category: "nature-soundscape",
    originalFilename: "RAINMetl-Gentle_rain_on_a_tin-Elevenlabs.mp3",
    lengthLabel: "0:30",
    loops: true,
    signatureSceneHint: "Bedroom Window / Any Scene",
    notes: "Reusable rain ambience",
    playbackUrl: TIN_ROOF_RAIN_AMBIENCE_MP3,
  },
  {
    id: "AUD-002",
    displayName: "Gentle Rain",
    category: "signature-soundscape",
    originalFilename: "bedroom-window-ambience.mp3",
    lengthLabel: "2:30",
    loops: true,
    signatureSceneHint: "Bedroom Window",
    notes: "Signature sound; also reusable anywhere",
    playbackUrl: BEDROOM_WINDOW_AMBIENCE_MP3,
  },
  {
    id: "AUD-003",
    displayName: "Movement Studio",
    category: "spark-music",
    originalFilename: "bright-studio-ambience.mp3",
    lengthLabel: "2:39",
    loops: true,
    signatureSceneHint: "Bright Studio",
    notes: "Songer instrumental",
    playbackUrl: BRIGHT_STUDIO_AMBIENCE_MP3,
  },
  {
    id: "AUD-004",
    displayName: "Coffee Shop Chatter",
    category: "ambience",
    originalFilename: "coffee-shop-chatter-audio.mp3",
    lengthLabel: "0:30",
    loops: true,
    signatureSceneHint: "Coffee House",
    notes: "Coffee shop background noise",
    playbackUrl: COFFEE_SHOP_AMBIENCE_MP3,
  },
  {
    id: "AUD-005",
    displayName: "Morning Whisper",
    category: "spark-music",
    originalFilename: "east-terrace-morning-whisper.mp3",
    lengthLabel: "4:18",
    loops: true,
    signatureSceneHint: "East Terrace",
    notes: "Songer instrumental",
    playbackUrl: EAST_TERRACE_AMBIENCE_MP3,
  },
  {
    id: "AUD-006",
    displayName: "Fireplace at Night",
    category: "signature-soundscape",
    originalFilename: "evening-hearth-ambience.mp3",
    lengthLabel: "2:28",
    loops: true,
    signatureSceneHint: "Evening Hearth / Fireside Deck",
    notes: "Signature sound; also reusable anywhere",
    playbackUrl: EVENING_HEARTH_AMBIENCE_MP3,
  },
  {
    id: "AUD-007",
    displayName: "Evening Reflections",
    category: "spark-music",
    originalFilename: "evening-reflections-private-swimming-pool.mp3",
    lengthLabel: "2:18",
    loops: true,
    signatureSceneHint: "Swimming Pool",
    notes: "Reflective instrumental",
    playbackUrl: SWIMMING_POOL_AMBIENCE_MP3,
  },
  {
    id: "AUD-008",
    displayName: "A Minute of Peace",
    category: "nature-soundscape",
    originalFilename: "freesound_community-a-minute-of-peace-19842.mp3",
    lengthLabel: "1:08",
    loops: true,
    signatureSceneHint: "Any Scene",
    notes: "Peaceful nature ambience",
    playbackUrl: MINUTE_OF_PEACE_AMBIENCE_MP3,
  },
  {
    id: "AUD-009",
    displayName: "Aquarium Ambience",
    category: "signature-soundscape",
    originalFilename:
      "freesound_community-indoor-fish-tank-without-bubble-strips-ambiance-33541.mp3",
    lengthLabel: "0:31",
    loops: true,
    signatureSceneHint: "Aquarium Room",
    notes: "Signature sound; also reusable anywhere",
    playbackUrl: OCEAN_CONSERVATORY_AMBIENCE_MP3,
  },
  {
    id: "AUD-010",
    displayName: "Water Fountain",
    category: "nature-soundscape",
    originalFilename: "freesound_community-mustique-water-fountain-27721.mp3",
    lengthLabel: "1:01",
    loops: true,
    signatureSceneHint: "Garden / Terrace / Any Scene",
    notes: "Reusable water ambience",
    playbackUrl: GAZEBO_JOURNAL_AMBIENCE_MP3,
  },
  {
    id: "AUD-011",
    displayName: "Greenhouse Birds",
    category: "signature-soundscape",
    originalFilename: "greenhouse-birds-ambience.mp3",
    lengthLabel: "0:56",
    loops: true,
    signatureSceneHint: "Greenhouse",
    notes: "Signature sound; also reusable anywhere",
    playbackUrl: GREENHOUSE_BIRDS_AMBIENCE_MP3,
  },
  {
    id: "AUD-012",
    displayName: "Java Serenade",
    category: "spark-music",
    originalFilename: "java-seranade-coffee-house.mp3",
    lengthLabel: "2:49",
    loops: true,
    signatureSceneHint: "Bright Studio / Coffee House / Writing Room",
    notes: "Uplifting instrumental",
    playbackUrl: COFFEE_HOUSE_AMBIENCE_MP3,
  },
  {
    id: "AUD-013",
    displayName: "Morning Momentum",
    category: "spark-music",
    originalFilename: "music-loft-ambience.mp3",
    lengthLabel: "3:05",
    loops: true,
    signatureSceneHint: "Music Room / Bright Studio",
    notes: "Uplifting instrumental",
    playbackUrl: MUSIC_LOFT_AMBIENCE_MP3,
  },
  {
    id: "AUD-014",
    displayName: "Early Summer Birds",
    category: "nature-soundscape",
    originalFilename: "nils_vega-birds-singing-in-early-summer-359446.mp3",
    lengthLabel: "1:06",
    loops: true,
    signatureSceneHint: "Any outdoor Scene",
    notes: "Reusable birds ambience",
    playbackUrl: ORCHARD_BIRDS_AMBIENCE_MP3,
  },
  {
    id: "AUD-015",
    displayName: "Pulse of Momentum",
    category: "spark-music",
    originalFilename: "pulse-of-momentum-energy-exercise-room.mp3",
    lengthLabel: "2:26",
    loops: true,
    signatureSceneHint: "Momentum / Exercise Room",
    notes: "Energetic instrumental",
    playbackUrl: EXERCISE_ROOM_AMBIENCE_MP3,
  },
  {
    id: "AUD-016",
    displayName: "Reflections of Triumph — Garden",
    category: "spark-music",
    originalFilename: "reflections-of-triumph-celebration-garden.mp3",
    lengthLabel: "1:45",
    loops: true,
    signatureSceneHint: "Celebration Garden",
    notes: "Celebratory reflective instrumental",
    playbackUrl: CELEBRATION_ROOM_AMBIENCE_MP3,
  },
  {
    id: "AUD-017",
    displayName: "Reflections of Triumph — Gallery",
    category: "spark-music",
    originalFilename: "reflections-of-triumph-gallery.mp3",
    lengthLabel: "1:32",
    loops: true,
    signatureSceneHint: "Gallery / Hall of Accomplishments",
    notes: "Celebratory reflective instrumental",
    playbackUrl: GALLERY_REFLECTIONS_AMBIENCE_MP3,
  },
] as const;

export function masterSoundscapeById(
  id: string,
): MasterSoundscapeAsset | undefined {
  return MASTER_SOUNDSCAPE_INVENTORY.find((asset) => asset.id === id);
}

export function masterSoundscapesForCategory(
  category: MasterSoundscapeCategory,
): MasterSoundscapeAsset[] {
  return MASTER_SOUNDSCAPE_INVENTORY.filter(
    (asset) => asset.category === category,
  );
}

export function masterSoundscapesForMenuGroup(
  group: MasterSoundscapeMenuGroup,
): MasterSoundscapeAsset[] {
  switch (group) {
    case "spark-music":
      return masterSoundscapesForCategory("spark-music");
    case "nature":
      return masterSoundscapesForCategory("nature-soundscape");
    case "ambience":
      return MASTER_SOUNDSCAPE_INVENTORY.filter(
        (asset) =>
          asset.category === "ambience" ||
          asset.category === "signature-soundscape",
      );
    case "recommended":
    case "favorites":
    case "silence":
      return [];
    default:
      return [];
  }
}

/** Signature assets — recommended for a Scene, never required. */
export function signatureMasterSoundscapes(): MasterSoundscapeAsset[] {
  return masterSoundscapesForCategory("signature-soundscape");
}
