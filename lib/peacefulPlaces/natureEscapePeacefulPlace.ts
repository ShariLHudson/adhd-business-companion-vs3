import type { PeacefulPlace } from "./types";

export const NATURE_ESCAPE_IMAGE_VERSION = "20260628a" as const;

/** Canonical Nature Escape™ session + directory thumbnail (V1 reuses loft garden art). */
export const NATURE_ESCAPE_IMAGE =
  `/backgrounds/music-loft-peaceful-places.png?v=${NATURE_ESCAPE_IMAGE_VERSION}` as const;

export const NATURE_ESCAPE: PeacefulPlace = {
  id: "nature-escape",
  title: "Nature Escape",
  shortTitle: "Nature Escape",
  signature: false,
  emotionalGoal:
    "Fill your cup again — creek murmur, birdsong, hammock shade, and gentle room to restore.",
  arrivalCopy:
    "Wildflowers lean toward the light. The creek keeps time while the hammock waits — nowhere you have to perform.",
  environment: "Nature Escape",
  description:
    "A sunlit garden nook on the estate — flowing creek, birds, wildflowers, hammock shade, and a gentle breeze. Guided recharge moments meet you where you are.",
  backgroundImageUrl: NATURE_ESCAPE_IMAGE,
  backgroundObjectPosition: "center center",
  workspaceZone: {
    centerQuiet: true,
    layout: "left-experience | workspace | right-experience",
  },
  soundscapeId: "nature-escape",
  sessionLeaveLabel: "Leave the garden",
  sessionSoundOnLabel: "Nature sounds on",
  sessionSoundOffLabel: "Quiet the garden",
  sessionSoundNote: "Creek, birds, and breeze all around.",
  audioWaitingCopy: "The garden is taking a breath with you.",
  imagePrompt: `Ultra-realistic sunlit estate garden nook — flowing creek, wildflowers,
hammock between trees, birds in soft focus, gentle breeze through leaves,
center visually quiet for workspace overlay.`,
  audioLayers: [
    {
      id: "creek-murmur",
      role: "primary",
      description: "Soft flowing creek — steady, unhurried water over stone.",
      alwaysOn: true,
    },
    {
      id: "garden-birds",
      role: "nature",
      description: "Gentle birdsong in wildflowers and canopy shade.",
      alwaysOn: true,
    },
    {
      id: "hammock-breeze",
      role: "nature",
      description: "Light breeze through leaves and hammock fabric.",
      alwaysOn: true,
    },
    {
      id: "distant-bees",
      role: "nature",
      description: "Occasional bee hum among wildflowers — rare, soft.",
    },
  ],
  intelligenceHooks: {
    id: "peaceful-place-nature-escape",
    createdAt: "2026-06-28T00:00:00.000Z",
    intelligenceMeta: {
      environment: { placeKind: "peaceful-place", focus: "restoration" },
      pattern: { workContext: "five-minute-restoration" },
      narrative: { chapterTheme: "fill-your-cup" },
    },
  },
};
