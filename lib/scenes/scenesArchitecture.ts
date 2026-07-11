/**
 * Scenes Architecture — runtime mirror of Architecture Library #162.
 *
 * Scenes are visual environments where members choose to spend time.
 * They are never permanently labeled by purpose (focus, sleep, productivity, etc.).
 *
 * @see docs/estate/recognition/library/162_SCENES_ARCHITECTURE.md
 */

export type SceneFamily = "estate" | "peaceful-place";

export type SceneComponentKind =
  | "still-image"
  | "cinematic-video"
  | "seasonal-version"
  | "ambient-animation"
  | "interactive-element";

/** Spark’s Scene selection invitation — purpose is never required. */
export const SCENES_SELECTION_PROMPT =
  "Where would you like to spend some time?";

/** Design qualities every Scene should embody. */
export const SCENE_DESIGN_QUALITIES = [
  "peaceful",
  "beautiful",
  "timeless",
  "comfortable",
  "believable",
  "luxurious",
  "uncluttered",
] as const;

/**
 * Forbidden permanent purpose labels for Scenes.
 * Members decide use; Spark learns from behavior.
 */
export const SCENE_FORBIDDEN_PURPOSE_LABELS = [
  "focus",
  "sleep",
  "productivity",
  "meditation",
  "adhd",
] as const;

/** Example Estate Scenes (permanent Spark Estate locations). */
export const ESTATE_SCENE_EXAMPLES = [
  { id: "welcome-home", name: "Welcome Home" },
  { id: "library", name: "Estate Library" },
  { id: "journal", name: "Journal Gazebo" },
  { id: "greenhouse", name: "Greenhouse" },
  { id: "aquarium-room", name: "Aquarium Room" },
  { id: "writing-room", name: "Writing Room" },
  { id: "music-room", name: "Music Room" },
  { id: "reading-nook", name: "Reading Nook" },
  { id: "fireside-deck", name: "Fireside Deck" },
  { id: "observatory", name: "Observatory" },
  { id: "sunroom", name: "Sunroom" },
  { id: "treehouse-reading-nook", name: "Treehouse Reading Nook" },
  { id: "tea-room", name: "Tea Room" },
  { id: "lakeside-hammock", name: "Lakeside Hammock" },
  { id: "celebration-garden", name: "Celebration Garden" },
  { id: "swimming-pool", name: "Swimming Pool" },
] as const;

/** Example Peaceful Places (environments outside Spark Estate). */
export const PEACEFUL_PLACE_SCENE_EXAMPLES = [
  { id: "bedroom-window", name: "Bedroom Window" },
  { id: "bright-studio", name: "Bright Studio" },
  { id: "coffee-house", name: "Coffee House" },
  { id: "east-terrace", name: "East Terrace" },
  { id: "summer-storm-deck", name: "Summer Storm Deck" },
  { id: "peaceful-pathway", name: "Peaceful Pathway" },
] as const;

/** Future variation keys — atmosphere only, never purpose. */
export const SCENE_VARIATION_EXAMPLES = {
  "journal-gazebo": ["morning", "rain", "evening", "autumn", "winter"],
  observatory: ["day", "sunset", "night"],
  library: ["morning", "fireplace", "christmas", "rain"],
} as const;

export function isForbiddenScenePurposeLabel(label: string): boolean {
  const n = label.trim().toLowerCase();
  return (SCENE_FORBIDDEN_PURPOSE_LABELS as readonly string[]).includes(n);
}

/** Soft learning observation templates — behavior-based, never assumptive. */
export const SCENE_LEARNING_OBSERVATION_EXAMPLES = [
  "You often choose the Greenhouse when writing.",
  "You usually visit the Journal Gazebo before journaling.",
] as const;
