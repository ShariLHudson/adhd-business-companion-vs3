/**
 * Soundscapes Architecture — runtime mirror of Architecture Library #163.
 *
 * Soundscapes are independent audio layers. They are never permanently
 * attached to a Scene; any Soundscape may pair with any Scene.
 *
 * @see docs/estate/recognition/library/163_SOUNDSCAPES_ARCHITECTURE.md
 * @see docs/estate/recognition/library/162_SCENES_ARCHITECTURE.md
 */

export type SoundscapeCategory =
  | "nature"
  | "environment"
  | "spark-companion"
  | "personal-audio";

export type SoundscapeOptionalTool =
  | "timer"
  | "breathing"
  | "journal-afterwards"
  | "voice-notes"
  | "focus-session"
  | "calendar-scheduling";

/** Spark’s Soundscape selection invitation — never assume. */
export const SOUNDSCAPES_SELECTION_PROMPT = "What would you like to hear?";

/** Nature category examples. */
export const SOUNDSCAPE_NATURE_EXAMPLES = [
  "Birds",
  "Water",
  "Rain",
  "Thunderstorm",
  "Ocean",
  "Wind",
] as const;

/** Environment category examples. */
export const SOUNDSCAPE_ENVIRONMENT_EXAMPLES = [
  "Coffee House",
  "Fireplace",
  "Aquarium",
  "White Noise",
  "Soft Café",
] as const;

/** Optional Spark Companion guided audio examples. */
export const SOUNDSCAPE_COMPANION_AUDIO_EXAMPLES = [
  "Welcome Home",
  "Morning Encouragement",
  "Reflection",
  "Celebration",
  "Evening Wind Down",
] as const;

/** Optional tools that may accompany a session — none required. */
export const SOUNDSCAPE_OPTIONAL_TOOLS: readonly SoundscapeOptionalTool[] = [
  "timer",
  "breathing",
  "journal-afterwards",
  "voice-notes",
  "focus-session",
  "calendar-scheduling",
] as const;

/**
 * Mixable session layers.
 * Scene + Soundscape are primary; companion + tools are optional.
 */
export const SOUNDSCAPE_SESSION_LAYERS = [
  "scene",
  "soundscape",
  "companion-audio",
  "experience-tools",
] as const;

/** Soft learning observation templates — behavior-based. */
export const SOUNDSCAPE_LEARNING_OBSERVATION_EXAMPLES = [
  "You often pair the Observatory with rain.",
  "You usually write with Coffee House sounds.",
] as const;

/** Example saved favorite experiences from the architecture. */
export const SOUNDSCAPE_FAVORITE_EXPERIENCE_EXAMPLES = [
  {
    name: "Morning Writing",
    scene: "Bright Studio",
    soundscape: "Coffee House",
    timerMinutes: 45,
    companionAudio: false,
  },
  {
    name: "Evening Reflection",
    scene: "Journal Gazebo",
    soundscape: "Water Fountain",
    companionReflection: true,
  },
] as const;

/** Future expansion directions — growth without changing the member model. */
export const SOUNDSCAPE_FUTURE_EXPANSION = [
  "spatial-audio",
  "seasonal-ambience",
  "live-weather",
  "adaptive-companion-audio",
  "dynamic-nature-sounds",
] as const;

/** Architecture law: Soundscapes are never permanently bound to Scenes. */
export function soundscapeMayPairWithAnyScene(): true {
  return true;
}

/** Silence is a first-class, valid choice. */
export const SOUNDSCAPE_SILENCE_IS_VALID = true;
