/**
 * Login Doorway Presence — Shari stands inside an already-open door.
 *
 * The login scene is a single photograph (shari-login.png).
 * Pose, screen-door hardware, and interior lever must be correct in source art —
 * CSS cannot fix impossible hand perspective or missing handles.
 */

import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";

export const LOGIN_SCENE_ASSET = COMPANION_LOGIN_BACKGROUND;

export const LOGIN_DOORWAY_PRESENCE = {
  doorAnimated: false,
  handsInsideOnly: true,
  processingUsesLightOnly: true,
  sceneAsset: LOGIN_SCENE_ASSET,
} as const;

/** Doorway zone — porch motion never animates this region. */
export const LOGIN_DOORWAY_ZONE = {
  left: 52,
  right: 100,
  top: 0,
  bottom: 100,
} as const;
