import type { PeacefulPlace } from "./types";

export const EAST_TERRACE_IMAGE_VERSION = "20260626a" as const;

/** Canonical East Terrace™ session + directory thumbnail. */
export const EAST_TERRACE_IMAGE =
  `/backgrounds/peaceful-places/east-terrace-peaceful-places.png?v=${EAST_TERRACE_IMAGE_VERSION}` as const;

export const EAST_TERRACE: PeacefulPlace = {
  id: "east-terrace",
  title: "Morning Whisper in the Garden at the East Terrace",
  shortTitle: "East Terrace",
  signature: false,
  emotionalGoal:
    "Gentle morning lift — golden light, waking gardens, and music soft enough to ease into the day.",
  arrivalCopy:
    "The terrace is warm with early sun. Gardens stir below, and a quiet melody drifts through the morning air.",
  environment: "East Terrace",
  description:
    "A wide estate terrace facing the sunrise — coffee at your side, hydrangea and boxwood waking in the light, and soft garden music that lifts you without rushing.",
  backgroundImageUrl: EAST_TERRACE_IMAGE,
  backgroundObjectPosition: "center center",
  workspaceZone: {
    centerQuiet: true,
    layout: "left-experience | workspace | right-experience",
  },
  soundscapeId: "sunrise-terrace",
  sessionLeaveLabel: "Leave the terrace",
  sessionSoundOnLabel: "Garden music on",
  sessionSoundOffLabel: "Quiet the garden",
  sessionSoundNote: "Morning whisper all around.",
  audioWaitingCopy: "The garden is taking a moment to wake up.",
  imagePrompt: `Ultra-realistic east-facing estate terrace at golden hour — wide stone terrace,
low garden walls, hydrangea and boxwood, coffee on a wrought table, sunrise light across the lawn,
center visually quiet for workspace overlay.`,
  audioLayers: [
    {
      id: "morning-whisper",
      role: "primary",
      description:
        "Soft morning garden music — gentle, uplifting, unhurried.",
      alwaysOn: true,
    },
    {
      id: "garden-birds",
      role: "nature",
      description: "Early birdsong from the gardens below — sparse and distant.",
      alwaysOn: true,
    },
    {
      id: "breeze-leaves",
      role: "nature",
      description: "Light breeze through terrace planters and nearby trees.",
      alwaysOn: true,
    },
    {
      id: "coffee-pour",
      role: "interior",
      description: "Occasional soft coffee pour — subtle, not sharp.",
    },
  ],
  intelligenceHooks: {
    id: "peaceful-place-east-terrace",
    createdAt: "2026-06-26T00:00:00.000Z",
    intelligenceMeta: {
      environment: { placeKind: "peaceful-place", focus: "morning-garden" },
      pattern: { workContext: "sunrise-terrace" },
      narrative: { chapterTheme: "morning-whisper" },
    },
  },
};
