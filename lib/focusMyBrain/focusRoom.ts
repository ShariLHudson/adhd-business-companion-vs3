import {
  SUNROOM_BUTTERFLY_VIDEO,
  SUNROOM_FALLBACK_IMAGE,
} from "@/lib/companionHomestead";

import type { FocusFeelingId } from "@/lib/focusHub";

/** Focus My Brain — butterfly sanctuary constants (Sunroom). */
export const FOCUS_BUTTERFLY_VIDEO = SUNROOM_BUTTERFLY_VIDEO;

/** Instant poster while butterfly video buffers — never a blank landing. */
export const FOCUS_BUTTERFLY_POSTER =
  "/images/focus-brain-butterfly-poster.jpg" as const;

/** Legacy PNG — fallback if video cannot play. */
export const FOCUS_MY_BRAIN_ROOM_BG = SUNROOM_FALLBACK_IMAGE;

export const FOCUS_MY_BRAIN_ROOM_BG_FRAME = {
  position: "62% 46%",
  scale: 0.86,
  transformOrigin: "62% 46%",
  edgeFill: "#e8e0d4",
} as const;

export const FOCUS_MY_BRAIN_WORKSPACE_MAX_WIDTH = "42rem" as const;
export const FOCUS_MY_BRAIN_WORKSPACE_MIN_WIDTH = "27.5rem" as const;

export const FOCUS_MY_BRAIN_ROOM_COPY = {
  title: "Focus",
  tagline: "Help my brain.",
} as const;

export const FOCUS_MY_BRAIN_HUB_CARDS = {
  stuck: {
    title: "Begin Again",
    tagline: "The smallest step is enough.",
    lines: ["The smallest step is enough."],
  },
  "need-break": {
    title: "Pause & Reset",
    tagline: "Take a quiet moment before continuing.",
    lines: ["Take a quiet moment before continuing."],
  },
} as const satisfies Record<
  FocusFeelingId,
  { title: string; tagline: string; lines: readonly string[] }
>;

/** Hub option cards fade in after the arrival ritual begins. */
export const FOCUS_ARRIVAL_OPTIONS_DELAY_MS = 2000;

/** Workspace appears after the transition video beat. */
export const FOCUS_TRANSITION_WORKSPACE_DELAY_MS = 2500;

/** Calm motion timing — opacity, translate, blur. */
export const FOCUS_SANCTUARY_MOTION_MS = 750;
