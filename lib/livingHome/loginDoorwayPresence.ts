/**
 * Login scene — estate Welcome Home room (same art as post-arrival living room).
 */

import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";

export const LOGIN_SCENE_ASSET = COMPANION_LOGIN_BACKGROUND;

export const LOGIN_DOORWAY_PRESENCE = {
  doorAnimated: false,
  handsInsideOnly: true,
  processingUsesLightOnly: true,
  sceneAsset: LOGIN_SCENE_ASSET,
} as const;

/** Legacy doorway zone — porch overlays only; unused on Welcome Home login. */
export const LOGIN_DOORWAY_ZONE = {
  left: 52,
  right: 100,
  top: 0,
  bottom: 100,
} as const;
