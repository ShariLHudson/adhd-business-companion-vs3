/**
 * Companion Objects — illustration style tokens (Warm Homestead Realism).
 */

export const ILLUSTRATION_STYLE_NAME = "Warm Homestead Realism";

export const ILLUSTRATION_STYLE = {
  name: ILLUSTRATION_STYLE_NAME,
  lineWeight: "1.25–1.75px equivalent at 256px — soft, never cartoon outline",
  perspective: "Slight three-quarter view; object grounded on implied surface",
  lighting: "Soft morning window light from upper left; warm 4200K",
  shadows: "Soft contact shadow beneath; no harsh drop shadow or glow",
  texture: "Visible grain on wood, glaze on ceramic, weave on linen at hero size",
  depth: "Subtle edge highlight; form from light and material, not bevel",
  background: "Transparent PNG/SVG for objects; mini-scenes use room gradient",
  outline: "None — silhouette defined by value and material",
} as const;

/** Default object palette — aligns with VISUAL_DESIGN_BIBLE.md */
export const DEFAULT_OBJECT_PALETTE = [
  "cream-#FAF7F2",
  "warm-white-#F5F0E8",
  "oak-honey",
  "walnut-deep",
  "barn-red-accent",
  "sage-muted",
  "linen-natural",
  "brass-aged",
  "companion-teal-whisper",
] as const;

export const DEFAULT_ILLUSTRATION_NOTES =
  "Warm Homestead Realism — semi-realistic watercolor-woodcut hybrid; handcrafted warmth; slight imperfection in symmetry; one focal object; readable at 48px, beautiful at 256px.";

export const ANIMATION_LANGUAGE = {
  principle: "Movement is life, not notification",
  allowed: [
    "steam rising (irregular, slow)",
    "candle flicker (low amplitude)",
    "aquarium bubbles (gentle)",
    "curtain drift (barely perceptible)",
    "plant sway (wind through open window)",
    "bird brief landing (once, then still)",
    "clock pendulum (optional, muted)",
  ],
  forbidden: [
    "bounce",
    "spin",
    "pulse for attention",
    "game-like particles",
    "looping celebration effects",
  ],
  reducedMotion: "Static beauty remains — animation off, object still feels alive",
} as const;

export const MATERIAL_PALETTE_PREFER = [
  "wood",
  "linen",
  "leather",
  "ceramic",
  "stone",
  "cotton",
  "glass",
  "copper",
  "brass",
  "wicker",
  "pottery",
] as const;

export const MATERIAL_PALETTE_AVOID = [
  "plastic",
  "chrome",
  "neon",
  "glossy tech surfaces",
  "corporate icon fills",
] as const;
