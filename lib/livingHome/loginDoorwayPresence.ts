/**
 * Login scene — open estate doors at the Welcome Home threshold.
 */

import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";

export const LOGIN_SCENE_ASSET = COMPANION_LOGIN_BACKGROUND;

export const LOGIN_DOORWAY_PRESENCE = {
  doorAnimated: false,
  handsInsideOnly: true,
  processingUsesLightOnly: true,
  sceneAsset: LOGIN_SCENE_ASSET,
} as const;

/** Doorway glow zone — warm light on the open threshold during sign-in. */
export const LOGIN_DOORWAY_ZONE = {
  left: 52,
  right: 100,
  top: 0,
  bottom: 100,
} as const;
