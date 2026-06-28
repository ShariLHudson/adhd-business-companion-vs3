import type { SoundscapeMoodId } from "./types";
import { soundscapeById, soundscapesForMood } from "./catalog";

/** Map legacy Focus Audio category ids to a soundscape mood section. */
export function resolveSoundscapeMood(
  categoryId?: string | null,
): SoundscapeMoodId | null {
  if (!categoryId || categoryId === "soundscapes") return null;
  switch (categoryId) {
    case "calming":
    case "calm-brain":
    case "calm-audio":
    case "nature-audio":
      return "calming";
    case "focus":
    case "deep-work":
    case "morning-focus":
    case "focus-audio":
      return "focus";
    case "sleep":
    case "unwind":
    case "sleep-sounds":
    case "sleep-audio":
      return "unwind";
    case "energize":
    case "energetic":
    case "motivation-boost":
      return "energize";
    default:
      return null;
  }
}

export function resolveSoundscapeScrollTarget(
  categoryId?: string | null,
): SoundscapeMoodId | "top" {
  return resolveSoundscapeMood(categoryId) ?? "top";
}

export function recommendedSoundscapeForMood(mood: SoundscapeMoodId) {
  return soundscapesForMood(mood)[0] ?? null;
}

export function recommendedSoundscapeForLegacyCategory(categoryId: string) {
  const mood = resolveSoundscapeMood(categoryId);
  if (mood) return recommendedSoundscapeForMood(mood);
  return soundscapeById(categoryId) ?? null;
}
