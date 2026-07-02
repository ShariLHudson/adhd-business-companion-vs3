import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

/** Garden Conservatory — Clear My Mind / Conservatory room background. */
export const CLEAR_MY_MIND_CONSERVATORY_BG_VERSION = "20260630a" as const;

export const CLEAR_MY_MIND_CONSERVATORY_BG =
  `${ESTATE_ROOM_BG.butterflyConservatory}?v=${CLEAR_MY_MIND_CONSERVATORY_BG_VERSION}` as const;

export const CLEAR_MY_MIND_WORKSPACE_MAX_WIDTH = "31.25rem" as const;
export const CLEAR_MY_MIND_WORKSPACE_MIN_WIDTH = "26.25rem" as const;
