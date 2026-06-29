/**
 * Shari — Master Visual Identity
 *
 * Locked identity for every ecosystem image. Same mature woman from reference
 * anchors — never a generic or younger substitute.
 *
 * Reference collage: /images/shari/shari-identity-anchor.png
 */

export const SHARI_IDENTITY_ANCHOR_IMAGE =
  "/images/shari/shari-identity-anchor.png" as const;

/** Locked forever — do not change across scenes. */
export const SHARI_LOCKED_VISUAL_IDENTITY = [
  "face",
  "eyes",
  "smile",
  "skin tone",
  "age appearance",
  "hair color",
  "warm mentor presence",
  "triangular necklace when visible",
  "approachable expression",
  "soft feminine authority",
] as const;

/** Allowed to vary per scene. */
export const SHARI_VISUAL_CHANGE_ALLOWLIST = [
  "hair up or down",
  "outfit",
  "pose",
  "lighting",
  "season",
  "weather",
  "props",
  "background",
  "activity",
  "expression within natural range",
] as const;

export const SHARI_VISUAL_IDENTITY_CORE = [
  "warm expressive eyes",
  "soft genuine smile",
  "silver-gray long hair",
  "side-parted face-framing layers",
  "natural skin texture",
  "approachable feminine presence",
  "gentle confidence",
  "warm mentor energy",
  "elegant but relatable styling",
  "mature woman in her late 50s to 60s",
] as const;

export const SHARI_VISUAL_NEGATIVE_PROMPT =
  "different woman, younger woman, altered face, different eye shape, different smile, exaggerated beauty filter, plastic skin, fashion model face, generic AI woman, changed ethnicity, changed age, distorted facial proportions, unfamiliar person" as const;

const LOCKED_IDENTITY_PROMPT = `Preserve her exact facial structure, eye shape, smile, skin tone, age appearance, silver-gray hair, warm mentor presence, and overall identity from the reference images. Do not invent a younger woman, different face, different ethnicity, different facial proportions, or generic AI model. Triangular necklace when visible.`;

type BuildShariSceneImagePromptOptions = {
  /** Scene-specific description — wardrobe, pose, lighting, environment, activity. */
  scene: string;
  includeNegative?: boolean;
};

/**
 * Ecosystem image formula:
 * Shari's locked identity + change only the scene state.
 */
export function buildShariSceneImagePrompt({
  scene,
  includeNegative = true,
}: BuildShariSceneImagePromptOptions): string {
  const core = SHARI_VISUAL_IDENTITY_CORE.join(", ");
  const prompt = [
    `Create a cinematic photograph of Shari, ${core}.`,
    LOCKED_IDENTITY_PROMPT,
    scene.trim(),
    "Keep her identity consistent. Only change wardrobe, pose, lighting, and environment.",
  ]
    .filter(Boolean)
    .join(" ");

  if (!includeNegative) return prompt;

  return `${prompt}\n\nNegative prompt: ${SHARI_VISUAL_NEGATIVE_PROMPT}`;
}
