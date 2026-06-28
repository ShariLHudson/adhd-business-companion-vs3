import type { PeacefulPlace } from "./types";

export const COZY_CAFE_IMAGE_VERSION = "20260628a" as const;

/** Canonical Cozy Café™ session + Focus menu thumbnail. */
export const COZY_CAFE_IMAGE =
  `/backgrounds/peaceful-places/cozy-cafeimage.png?v=${COZY_CAFE_IMAGE_VERSION}` as const;

/** @deprecated Use COZY_CAFE_IMAGE */
export const COZY_CAFE_PEACEFUL_PLACES_BG = COZY_CAFE_IMAGE;
export const COZY_CAFE_PEACEFUL_PLACES_BG_VERSION = COZY_CAFE_IMAGE_VERSION;

export const COZY_CAFE: PeacefulPlace = {
  id: "cozy-cafe",
  title: "Coffee Shop at the Cozy Café",
  shortTitle: "Cozy Café",
  signature: false,
  emotionalGoal:
    "Gentle focus — soft company without a conversation. The user can think alongside the room.",
  arrivalCopy:
    "You're tucked into a warm corner. Cups clink softly, voices murmur, and nobody needs anything from you.",
  environment: "Cozy Café",
  description:
    "A small estate café with worn wood, pendant lamps, and rain-muted windows. Espresso steams, laptops open quietly, and the hum of conversation stays low enough to think.",
  backgroundImageUrl: COZY_CAFE_IMAGE,
  backgroundObjectPosition: "24% 72%",
  workspaceZone: {
    centerQuiet: true,
    layout: "left-experience | workspace | right-experience",
  },
  soundscapeId: "coffee-shop",
  sessionLeaveLabel: "Leave the café",
  sessionSoundOnLabel: "Café chatter on",
  sessionSoundOffLabel: "Quiet the chatter",
  sessionSoundNote: "Soft chatter all around.",
  audioWaitingCopy: "The café is taking a moment to wake up.",
  imagePrompt: `Ultra-realistic cozy café interior on a private estate — warm wood, pendant lamps,
rain-softened windows, espresso bar in soft focus, a few patrons with laptops and books,
steam from fresh cups, no harsh signage, center visually quiet for workspace overlay.`,
  audioLayers: [
    {
      id: "cafe-murmur",
      role: "primary",
      description:
        "Low café conversation — steady background chatter without discernible words.",
      alwaysOn: true,
    },
    {
      id: "cup-clink",
      role: "secondary",
      description: "Occasional cup and saucer clinks, spoons stirring.",
      alwaysOn: true,
    },
    {
      id: "espresso-steam",
      role: "interior",
      description: "Distant espresso machine hiss and steam wands — subtle, not sharp.",
      alwaysOn: true,
    },
    {
      id: "chair-shift",
      role: "interior",
      description: "Soft chair scrape and coat rustle as people settle.",
    },
    {
      id: "door-chime",
      role: "interior",
      description: "Gentle door chime when someone enters — infrequent.",
      intervalMinutes: { min: 4, max: 9 },
    },
    {
      id: "rain-on-glass",
      role: "weather",
      description: "Very soft rain on windows — optional exterior hush.",
    },
  ],
  intelligenceHooks: {
    id: "peaceful-place-cozy-cafe",
    createdAt: "2026-06-26T00:00:00.000Z",
    intelligenceMeta: {
      environment: { placeKind: "peaceful-place", focus: "gentle-company" },
      pattern: { workContext: "coffee-shop-focus" },
      narrative: { chapterTheme: "think-beside-the-room" },
    },
  },
};
