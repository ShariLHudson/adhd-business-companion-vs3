import type { PeacefulPlace } from "./types";

export const BRIGHT_STUDIO_IMAGE_VERSION = "20260628a" as const;

/** Canonical Bright Studio™ session + directory thumbnail. */
export const BRIGHT_STUDIO_IMAGE =
  `/backgrounds/peaceful-places/bright-studio-peaceful-places.png?v=${BRIGHT_STUDIO_IMAGE_VERSION}` as const;

export const BRIGHT_STUDIO: PeacefulPlace = {
  id: "bright-studio",
  title: "Movement Studio at the Bright Studio",
  shortTitle: "Bright Studio",
  signature: false,
  emotionalGoal:
    "Clean momentum — wide open space, daylight, and a steady beat that helps you get unstuck without chaos.",
  arrivalCopy:
    "The studio is bright and uncluttered. Windows pour in light, and a driving rhythm waits — enough energy to begin moving.",
  environment: "Bright Studio",
  description:
    "A wide movement studio on the estate — polished floor, tall windows, and upbeat instrumental music with a steady pulse to get unstuck and start.",
  backgroundImageUrl: BRIGHT_STUDIO_IMAGE,
  backgroundObjectPosition: "center center",
  workspaceZone: {
    centerQuiet: true,
    layout: "left-experience | workspace | right-experience",
  },
  soundscapeId: "movement-studio",
  sessionLeaveLabel: "Leave the studio",
  sessionSoundOnLabel: "Studio music on",
  sessionSoundOffLabel: "Quiet the music",
  sessionSoundNote: "Steady beat all around.",
  audioWaitingCopy: "The studio is taking a moment to wake up.",
  imagePrompt: `Ultra-realistic bright movement studio on a private estate — wide windows, clean open floor,
minimal equipment in soft focus, daylight pouring in, center visually quiet for workspace overlay.`,
  audioLayers: [
    {
      id: "studio-beat",
      role: "primary",
      description:
        "Steady driving instrumental beat — energizing, clean, not chaotic.",
      alwaysOn: true,
    },
    {
      id: "floor-resonance",
      role: "interior",
      description: "Very subtle room tone in a wide open studio space.",
      alwaysOn: true,
    },
    {
      id: "window-breeze",
      role: "nature",
      description: "Soft air movement through tall studio windows.",
    },
    {
      id: "footfall-echo",
      role: "interior",
      description: "Distant soft footfall echo — occasional, not sharp.",
    },
  ],
  intelligenceHooks: {
    id: "peaceful-place-bright-studio",
    createdAt: "2026-06-26T00:00:00.000Z",
    intelligenceMeta: {
      environment: { placeKind: "peaceful-place", focus: "movement-energy" },
      pattern: { workContext: "movement-studio" },
      narrative: { chapterTheme: "get-unstuck" },
    },
  },
};
