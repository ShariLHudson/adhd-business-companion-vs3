/**
 * Clear My Mind page background — Sunroom (member may change via room menu).
 * Default asset: public/backgrounds/sunroom-background.png
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";

export const CLEAR_MY_MIND_SUNROOM_BG_VERSION = "20260709b" as const;

export const CLEAR_MY_MIND_SUNROOM_BG_FILENAME =
  "sunroom-background.png" as const;

export const CLEAR_MY_MIND_SUNROOM_BG =
  `${estateBackgroundPath(CLEAR_MY_MIND_SUNROOM_BG_FILENAME)}?v=${CLEAR_MY_MIND_SUNROOM_BG_VERSION}` as const;

/** @deprecated Alias — Clear My Mind uses Sunroom. */
export const CLEAR_MY_MIND_REFLECTION_DESK_BG = CLEAR_MY_MIND_SUNROOM_BG;

/** @deprecated Use CLEAR_MY_MIND_SUNROOM_BG */
export const CLEAR_MY_MIND_CONSERVATORY_BG = CLEAR_MY_MIND_SUNROOM_BG;

/** @deprecated Use CLEAR_MY_MIND_SUNROOM_BG_VERSION */
export const CLEAR_MY_MIND_REFLECTION_DESK_BG_VERSION =
  CLEAR_MY_MIND_SUNROOM_BG_VERSION;

/** @deprecated */
export const CLEAR_MY_MIND_REFLECTION_DESK_BG_FILENAME =
  CLEAR_MY_MIND_SUNROOM_BG_FILENAME;

export const CLEAR_MY_MIND_WORKSPACE_MAX_WIDTH = "30rem" as const;
export const CLEAR_MY_MIND_WORKSPACE_MIN_WIDTH = "25rem" as const;
