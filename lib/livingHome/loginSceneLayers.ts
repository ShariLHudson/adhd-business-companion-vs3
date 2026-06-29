/**
 * Login Living Scene — masked motion regions for shari-login.png
 *
 * Asset notes:
 * - Swing: masked duplicate of base image; a transparent swing PNG would look more natural.
 * - Porch sign: hangs on the far-left post. Mask animation cannot isolate the sign without
 *   also catching post edges — sign stays STATIC on the base image until
 *   LOGIN_SCENE_PORCH_SIGN_ASSET is provided (transparent PNG of sign only).
 * - Bracket and post are never included in any motion mask.
 * - Doorway presence: see loginDoorwayPresence.ts — clean plate art (no baked UI).
 */

import { LOGIN_SCENE_ASSET } from "./loginDoorwayPresence";

export { LOGIN_SCENE_ASSET };

/**
 * Future: transparent porch-sign-only PNG (no post, no bracket).
 * When set, CompanionLoginBackground may animate this layer independently.
 */
export const LOGIN_SCENE_PORCH_SIGN_ASSET: string | null = null;

export const LOGIN_SCENE_PORCH_SIGN = {
  id: "porch-sign" as const,
  /** Sign remains on the base image — not mask-animated. */
  animated: false as const,
  requiresTransparentAsset: true,
  assetPath: LOGIN_SCENE_PORCH_SIGN_ASSET,
} as const;

export type LoginSceneMotionLayerId =
  | "swing"
  | "hanging-plant"
  | "tree-canopy"
  | "flower-pot-left"
  | "flower-pot-mid";

export type LoginSceneMotionLayer = {
  id: LoginSceneMotionLayerId;
  className: string;
  clipPath: string;
  transformOrigin: string;
  animation: string;
};

/**
 * Architectural dead-zone (far-left post + bracket + sign) — no motion mask may intersect.
 * Percentages of scene width/height; used in tests to guard mask bounds.
 */
export const LOGIN_SCENE_POST_EXCLUSION = {
  left: 0,
  right: 11,
  top: 0,
  bottom: 16,
} as const;

/** True when a clip-path polygon stays outside the post/sign exclusion band. */
export function motionMaskAvoidsPorchPost(clipPath: string): boolean {
  const points = [...clipPath.matchAll(/([\d.]+)%\s+([\d.]+)%/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
  }));
  if (points.length === 0) return false;
  const { left, right, top, bottom } = LOGIN_SCENE_POST_EXCLUSION;
  return points.every(
    (p) => p.x > right || p.x < left || p.y > bottom || p.y < top,
  );
}

/**
 * Masked regions — percentages tuned to shari-login porch layout.
 * Masks exclude porch posts, railings, brackets, and the hanging sign.
 */
export const LOGIN_SCENE_MOTION_LAYERS: readonly LoginSceneMotionLayer[] = [
  {
    id: "swing",
    className: "companion-login-scene__motion-swing",
    // Swing seat + chains only — stops before the left post face
    clipPath: "polygon(1% 24%, 27% 22%, 29% 72%, 0% 74%)",
    transformOrigin: "14% 24%",
    animation: "companion-login-swing",
  },
  {
    id: "hanging-plant",
    className: "companion-login-scene__motion-hanging-plant",
    // Fern foliage only — inset right of post face; excludes sign, bracket, post
    clipPath: "polygon(12% 15%, 14% 14%, 14% 27%, 12% 28%)",
    transformOrigin: "13% 16%",
    animation: "companion-login-hanging-plant",
  },
  {
    id: "tree-canopy",
    className: "companion-login-scene__motion-trees",
    clipPath: "polygon(18% 0%, 76% 0%, 80% 42%, 16% 44%)",
    transformOrigin: "48% 10%",
    animation: "companion-login-trees",
  },
  {
    id: "flower-pot-left",
    className: "companion-login-scene__motion-flower-pot-left",
    clipPath: "polygon(0% 68%, 18% 66%, 20% 98%, 0% 100%)",
    transformOrigin: "8% 90%",
    animation: "companion-login-flowers",
  },
  {
    id: "flower-pot-mid",
    className: "companion-login-scene__motion-flower-pot-mid",
    // Pot beside swing — stops before center column (~40%)
    clipPath: "polygon(31% 62%, 39% 60%, 41% 78%, 29% 80%)",
    transformOrigin: "35% 74%",
    animation: "companion-login-flowers",
  },
] as const;

export const LOGIN_SCENE_LAYER_CLASSES = {
  root: "companion-login-scene",
  base: "companion-login-scene__base",
  motionPhoto: "companion-login-scene__motion-photo",
  lighting: "companion-login-scene__lighting",
  porchLantern: "companion-login-scene__porch-lantern",
  doorGlow: "companion-login-scene__door-glow",
  doorPanel: "companion-login-scene__door-panel",
  processingGlow: "companion-login-scene__processing-glow",
  atmosphere: "companion-login-scene__atmosphere",
  season: "companion-login-scene__season",
  weather: "companion-login-scene__weather",
  lifeEvent: "companion-login-scene__life-event",
  soften: "companion-login-scene__soften",
  still: "companion-login-scene--still",
  opening: "companion-login-scene--opening",
  motion: "companion-login-scene--motion",
} as const;
