import type { PeacefulPlace } from "./types";

export const BEDROOM_WINDOW_IMAGE_VERSION = "20260628a" as const;

/** Canonical Bedroom Window™ session + directory thumbnail. */
export const BEDROOM_WINDOW_IMAGE =
  `/backgrounds/peaceful-places/bedroom-window-peaceful-places.png?v=${BEDROOM_WINDOW_IMAGE_VERSION}` as const;

export const BEDROOM_WINDOW: PeacefulPlace = {
  id: "bedroom-window",
  title: "Gentle Rain at the Bedroom Window",
  shortTitle: "Bedroom Window",
  signature: false,
  emotionalGoal:
    "Soft unwind — rain on glass, warm room, and nowhere the day needs you to go.",
  arrivalCopy:
    "Rain traces the window while the room stays warm and still. You can rest here as long as you need.",
  environment: "Bedroom Window",
  description:
    "A quiet bedroom at the estate — soft rain on the glass, low lamp glow, and the gentle hush of a room that holds you without asking anything back.",
  backgroundImageUrl: BEDROOM_WINDOW_IMAGE,
  backgroundObjectPosition: "center center",
  workspaceZone: {
    centerQuiet: true,
    layout: "left-experience | workspace | right-experience",
  },
  soundscapeId: "gentle-rain",
  sessionLeaveLabel: "Leave the window",
  sessionSoundOnLabel: "Rain on",
  sessionSoundOffLabel: "Quiet the rain",
  sessionSoundNote: "Soft rain on glass all around.",
  audioWaitingCopy: "The rain is taking a moment to begin.",
  imagePrompt: `Ultra-realistic bedroom window at night or soft dusk — rain on glass,
warm linen, low lamp glow, blurred garden outside, center visually quiet for workspace overlay.`,
  audioLayers: [
    {
      id: "window-rain",
      role: "primary",
      description:
        "Soft rain on glass — steady, close, warm room hush underneath.",
      alwaysOn: true,
    },
    {
      id: "room-stillness",
      role: "interior",
      description: "Very low room tone — fabric, wood, distant house settling.",
      alwaysOn: true,
    },
    {
      id: "distant-thunder",
      role: "weather",
      description: "Occasional distant thunder — far away, never startling.",
      intervalMinutes: { min: 4, max: 12 },
    },
    {
      id: "bed-linen",
      role: "interior",
      description: "Subtle fabric rustle as you settle — rare, soft.",
    },
  ],
  intelligenceHooks: {
    id: "peaceful-place-bedroom-window",
    createdAt: "2026-06-28T00:00:00.000Z",
    intelligenceMeta: {
      environment: { placeKind: "peaceful-place", focus: "gentle-unwind" },
      pattern: { workContext: "gentle-rain" },
      narrative: { chapterTheme: "let-the-day-go" },
    },
  },
};
