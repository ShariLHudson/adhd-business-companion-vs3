import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

/** Original Sunroom — Clear My Mind room background. */
export const CLEAR_MY_MIND_SUNROOM_BG_VERSION = "20260706a" as const;

export const CLEAR_MY_MIND_SUNROOM_BG =
  `${ESTATE_ROOM_BG.clearMyMind}?v=${CLEAR_MY_MIND_SUNROOM_BG_VERSION}` as const;

/** @deprecated Use CLEAR_MY_MIND_SUNROOM_BG */
export const CLEAR_MY_MIND_CONSERVATORY_BG = CLEAR_MY_MIND_SUNROOM_BG;

export const CLEAR_MY_MIND_WORKSPACE_MAX_WIDTH = "30rem" as const;
export const CLEAR_MY_MIND_WORKSPACE_MIN_WIDTH = "25rem" as const;
