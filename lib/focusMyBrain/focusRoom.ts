/** Focus My Brain — full-screen recreation room sanctuary. */
export const FOCUS_MY_BRAIN_ROOM_BG =
  "/backgrounds/focus-my-brain-background.png" as const;

/**
 * Room framing — zoom out slightly and pan right so the left-wall clock and
 * sofa pillows stay in view on typical viewports.
 */
export const FOCUS_MY_BRAIN_ROOM_BG_FRAME = {
  position: "62% 46%",
  scale: 0.86,
  transformOrigin: "62% 46%",
  edgeFill: "#e8e0d4",
} as const;

export const FOCUS_MY_BRAIN_WORKSPACE_MAX_WIDTH = "35rem" as const; /* 560px */
export const FOCUS_MY_BRAIN_WORKSPACE_MIN_WIDTH = "27.5rem" as const; /* 440px */

export const FOCUS_MY_BRAIN_ROOM_COPY = {
  title: "Focus My Brain",
  tagline: "My mind slows down here.",
} as const;
