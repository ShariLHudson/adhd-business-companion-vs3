import type { PeacefulPlace } from "./types";

export const EVENING_HEARTH_IMAGE_VERSION = "20260628a" as const;

/** Canonical Evening Hearth session + directory thumbnail. */
export const EVENING_HEARTH_IMAGE =
  `/backgrounds/peaceful-places/evening-hearth-peaceful-places.png?v=${EVENING_HEARTH_IMAGE_VERSION}` as const;

export const EVENING_HEARTH: PeacefulPlace = {
  id: "evening-hearth",
  title: "Fireplace at the Evening Hearth",
  shortTitle: "Evening Hearth",
  signature: false,
  emotionalGoal:
    "Soft unwind — embers, low fire breath, and a room that lets the day loosen its grip.",
  arrivalCopy:
    "The hearth glows low while the room holds you in quiet warmth. You can stay here until the day lets go.",
  environment: "Evening Hearth",
  description:
    "A stone hearth room at the estate — embers breathing slow, firelight on worn wood, and nowhere you need to be but here.",
  backgroundImageUrl: EVENING_HEARTH_IMAGE,
  backgroundObjectPosition: "center center",
  workspaceZone: {
    centerQuiet: true,
    layout: "left-experience | workspace | right-experience",
  },
  soundscapeId: "fireplace-night",
  sessionLeaveLabel: "Leave the hearth",
  sessionSoundOnLabel: "Fire on",
  sessionSoundOffLabel: "Quiet the hearth",
  sessionSoundNote: "Low fire and room hush all around.",
  audioWaitingCopy: "The hearth is taking a moment to warm up.",
  imagePrompt: `Ultra-realistic evening hearth room — stone fireplace with low embers,
warm lamp glow, worn wood, center visually quiet for workspace overlay.`,
  audioLayers: [
    {
      id: "hearth-fire",
      role: "primary",
      description: "Low fire crackle and slow ember breath — warm, close, unhurried.",
      alwaysOn: true,
    },
    {
      id: "room-hush",
      role: "interior",
      description: "Soft room tone around the hearth — still, enclosed, safe.",
      alwaysOn: true,
    },
  ],
  intelligenceHooks: {
    id: "peaceful-place-evening-hearth",
    createdAt: "2026-06-28T00:00:00.000Z",
    intelligenceMeta: {
      environment: { placeKind: "peaceful-place", focus: "evening-unwind" },
      pattern: { workContext: "evening-hearth" },
      narrative: { chapterTheme: "release-the-day" },
    },
  },
};
