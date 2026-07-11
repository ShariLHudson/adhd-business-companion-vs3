import type { PeacefulPlace } from "./types";

export const MUSIC_ROOM_IMAGE_VERSION = "20260629a" as const;

/** Canonical Music Room session + garden card art. */
export const MUSIC_ROOM_IMAGE =
  `/backgrounds/music-room-background.png?v=${MUSIC_ROOM_IMAGE_VERSION}` as const;

export const MUSIC_ROOM: PeacefulPlace = {
  id: "music-room",
  title: "Deep Focus at the Music Room",
  shortTitle: "Music Room",
  signature: false,
  emotionalGoal:
    "Steady focus — gentle piano in a warm listening room where nothing asks for your attention.",
  arrivalCopy:
    "Speakers glow softly and the piano keeps you company. Settle in — the room holds the rhythm while you work.",
  environment: "Music Room",
  description:
    "A cozy estate listening room — vintage speakers, comfortable chair, vinyl on the shelf, and gentle piano that stays in the background.",
  backgroundImageUrl: MUSIC_ROOM_IMAGE,
  backgroundObjectPosition: "center center",
  workspaceZone: {
    centerQuiet: true,
    layout: "left-experience | workspace | right-experience",
  },
  soundscapeId: "deep-focus-piano",
  sessionLeaveLabel: "Back to the path",
  sessionSoundOnLabel: "Music on",
  sessionSoundOffLabel: "Quiet the room",
  sessionSoundNote: "Gentle piano ambience throughout the room.",
  audioWaitingCopy: "The room is taking a moment to come alive.",
  imagePrompt: `Cozy listening room with vintage speakers, comfortable chair, vinyl records,
headphones, warm ambient light, center visually quiet for workspace overlay.`,
  audioLayers: [
    {
      id: "piano-ambience",
      role: "primary",
      description: "Gentle deep-focus piano — steady, warm, unobtrusive.",
      alwaysOn: true,
    },
    {
      id: "room-tone",
      role: "interior",
      description: "Soft room hush — wood, fabric, distant house settling.",
      alwaysOn: true,
    },
  ],
  intelligenceHooks: {
    id: "peaceful-place-music-room",
    createdAt: "2026-06-29T00:00:00.000Z",
    intelligenceMeta: {
      environment: { placeKind: "peaceful-place", focus: "deep-focus" },
      pattern: { workContext: "music-room" },
      narrative: { chapterTheme: "steady-rhythm" },
    },
  },
};
