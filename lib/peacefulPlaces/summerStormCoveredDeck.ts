import type { PeacefulPlace } from "./types";

export const SUMMER_STORM_COVERED_DECK_BG_VERSION = "20260626a" as const;

export const SUMMER_STORM_COVERED_DECK_BG =
  `/backgrounds/peaceful-places/summer-storm-covered-deck.png?v=${SUMMER_STORM_COVERED_DECK_BG_VERSION}` as const;

export const SUMMER_STORM_COVERED_DECK: PeacefulPlace = {
  id: "summer-storm-covered-deck",
  title: "Summer Storm at the Covered Deck",
  shortTitle: "Covered Deck",
  signature: true,
  emotionalGoal:
    "Immediate relief — the user should subconsciously think: I'm safe here. I don't have to do anything for a while.",
  arrivalCopy:
    "You're beneath the cedar roof. The rain is steady on the metal above. Nothing is required of you right now.",
  environment: "Covered Back Deck",
  description:
    "A spacious cedar deck on a private Midwestern estate while warm summer rain falls beyond the cable railing. Lanterns glow, gardens soften in the storm, and the rain chain murmurs into stone.",
  backgroundImageUrl: SUMMER_STORM_COVERED_DECK_BG,
  backgroundObjectPosition: "center center",
  workspaceZone: {
    centerQuiet: true,
    layout: "left-experience | workspace | right-experience",
  },
  soundscapeId: "summer-storm",
  sessionLeaveLabel: "Leave the deck",
  sessionSoundOnLabel: "Hear the rain",
  sessionSoundOffLabel: "Quiet the rain",
  sessionSoundNote: "Rain beyond the roof.",
  audioWaitingCopy: "The rain is taking a moment to begin.",
  imagePrompt: `Ultra-realistic luxury covered back deck on a private Midwestern estate during a warm summer rainstorm.
Spacious covered cedar deck attached to the back of an elegant home — not a front porch.
Warm cedar tongue-and-groove ceiling, matte black standing-seam metal roof, thick cedar beams,
black cable railing, wide cedar deck boards with rich satin finish, stone fireplace with gentle fire,
rain chain into stone basin, cedar steps into hydrangea and hosta gardens with mature oaks.
Deep outdoor sectional and oversized lounge chair — dry cushions, woven textures, folded throw,
teak side table, ceramic mug with steam. Late afternoon storm light, warm lanterns, cool rain outside.
Center visually quiet for workspace overlay; story complete on left and right edges.`,
  audioLayers: [
    {
      id: "roof-rain",
      role: "primary",
      description:
        "Rain on black standing-seam metal roof — intensity varies subtly over time.",
      alwaysOn: true,
    },
    {
      id: "rain-chain",
      role: "secondary",
      description:
        "Water flowing down rain chain into stone basin — soft splashing blended with rainfall.",
      alwaysOn: true,
    },
    {
      id: "oak-wind",
      role: "nature",
      description: "Wind through mature oaks, leaves rustling.",
      alwaysOn: true,
    },
    {
      id: "birds",
      role: "nature",
      description:
        "Occasional birds between lighter rain — pause during heavier bursts.",
    },
    {
      id: "frogs",
      role: "nature",
      description: "Frogs beginning after heavier rain.",
    },
    {
      id: "distant-thunder",
      role: "weather",
      description:
        "Low rolling thunder every 3–7 minutes — comforting, never startling.",
      intervalMinutes: { min: 3, max: 7 },
    },
    {
      id: "ceiling-fan",
      role: "interior",
      description: "Very subtle ceiling fan hum beneath the roof.",
      alwaysOn: true,
    },
    {
      id: "deck-creak",
      role: "interior",
      description: "Gentle cedar deck creaks as breeze moves through.",
    },
  ],
  intelligenceHooks: {
    id: "peaceful-place-summer-storm-covered-deck",
    createdAt: "2026-06-26T00:00:00.000Z",
    intelligenceMeta: {
      environment: { placeKind: "peaceful-place", signature: true },
      recovery: { stressRelief: "high" },
      narrative: { chapterTheme: "shelter-in-storm" },
    },
  },
};
