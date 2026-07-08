import type { AppSection } from "@/lib/companionUi";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import { homesteadLivingRoomImageUrl } from "@/lib/homesteadScene/homesteadLivingRoomImage";

/** Canonical homestead rooms — one persistent home, six signature spaces. T-017 @see docs/ESTATE_ROOMS_FRAMEWORK.md */
export type HomesteadRoomId =
  | "living-room"
  | "sunroom"
  | "game-room"
  | "library"
  | "study"
  | "peaceful-places";

export type HomesteadSignatureMotionId =
  | "time-of-day-lighting"
  | "butterflies-drifting"
  | "playful-ambient"
  | "dust-motes-page-turn"
  | "morning-light-desk"
  | "nature-specific";

export type HomesteadBackgroundKind =
  | "homestead-scene"
  | "video"
  | "image"
  | "destination";

export type HomesteadRoomEntry = {
  id: HomesteadRoomId;
  name: string;
  purpose: string;
  permanentBackground: string;
  backgroundKind: HomesteadBackgroundKind;
  signatureMotion: HomesteadSignatureMotionId;
  signatureMotionDescription: string;
  /** Universe place ids this room may draw from. */
  placeIds: readonly CompanionPlaceId[];
  /** App sections that open inside this room. */
  sections: readonly AppSection[];
  status: "live" | "partial" | "planned";
};

export const LIVING_ROOM_BG = homesteadLivingRoomImageUrl();

export const SUNROOM_BUTTERFLY_VIDEO =
  "/Videos/butterfly-house-video.mp4" as const;

export const SUNROOM_FALLBACK_IMAGE = ESTATE_ROOM_BG.sunroom;

export const GAME_ROOM_BG = ESTATE_ROOM_BG.gameRoom;

export const LIBRARY_ROOM_BG = ESTATE_ROOM_BG.stairwayReadingNook;

export const STUDY_ROOM_BG = ESTATE_ROOM_BG.studyHall;

/** User-facing homestead room catalog — matches the companion home architecture. */
export const COMPANION_HOMESTEAD_ROOMS: readonly HomesteadRoomEntry[] = [
  {
    id: "living-room",
    name: "Living Room",
    purpose: "Everyday conversation",
    permanentBackground: LIVING_ROOM_BG,
    backgroundKind: "homestead-scene",
    signatureMotion: "time-of-day-lighting",
    signatureMotionDescription: "Time-of-day lighting changes",
    placeIds: ["living-room", "window-seat"],
    sections: ["home", "today", "welcome-room"],
    status: "live",
  },
  {
    id: "sunroom",
    name: "Sunroom",
    purpose: "Focus My Brain",
    permanentBackground: SUNROOM_BUTTERFLY_VIDEO,
    backgroundKind: "video",
    signatureMotion: "butterflies-drifting",
    signatureMotionDescription: "Butterflies drifting",
    placeIds: ["sunroom-over-pond"],
    sections: ["focus"],
    status: "live",
  },
  {
    id: "game-room",
    name: "Game Room",
    purpose: "Momentum Builders",
    permanentBackground: GAME_ROOM_BG,
    backgroundKind: "image",
    signatureMotion: "playful-ambient",
    signatureMotionDescription: "Subtle movement, playful ambient effects",
    placeIds: ["garden-path"],
    sections: ["games", "activities"],
    status: "live",
  },
  {
    id: "library",
    name: "Library",
    purpose: "Learning and knowledge",
    permanentBackground: LIBRARY_ROOM_BG,
    backgroundKind: "image",
    signatureMotion: "dust-motes-page-turn",
    signatureMotionDescription: "Dust motes, page-turn ambience",
    placeIds: ["library", "reading-nook"],
    sections: ["how-do-i", "growth-library", "momentum-institute"],
    status: "live",
  },
  {
    id: "study",
    name: "Study",
    purpose: "Planning and work",
    permanentBackground: STUDY_ROOM_BG,
    backgroundKind: "image",
    signatureMotion: "morning-light-desk",
    signatureMotionDescription: "Morning light across the desk",
    placeIds: ["planning-table"],
    sections: ["plan-my-day", "time-block"],
    status: "live",
  },
  {
    id: "peaceful-places",
    name: "Peaceful Places",
    purpose: "Regulation and restoration",
    permanentBackground: "chosen-destination",
    backgroundKind: "destination",
    signatureMotion: "nature-specific",
    signatureMotionDescription: "Nature-specific movement (waves, rain, leaves, snow)",
    placeIds: ["reading-nook", "garden"],
    sections: ["focus-audio", "breathe"],
    status: "partial",
  },
] as const;

const ROOM_BY_ID = new Map(
  COMPANION_HOMESTEAD_ROOMS.map((room) => [room.id, room]),
);

const SECTION_TO_ROOM = new Map<AppSection, HomesteadRoomId>(
  COMPANION_HOMESTEAD_ROOMS.flatMap((room) =>
    room.sections.map((section) => [section, room.id] as const),
  ),
);

export function homesteadRoomById(id: HomesteadRoomId): HomesteadRoomEntry {
  return ROOM_BY_ID.get(id)!;
}

export function homesteadRoomForSection(
  section: AppSection,
): HomesteadRoomEntry | null {
  const id = SECTION_TO_ROOM.get(section);
  return id ? homesteadRoomById(id) : null;
}

export function homesteadRoomForPlace(
  placeId: CompanionPlaceId,
): HomesteadRoomEntry | null {
  return (
    COMPANION_HOMESTEAD_ROOMS.find((room) => room.placeIds.includes(placeId)) ??
    null
  );
}

export type PeacefulPlaceNatureMotion =
  | "rain"
  | "waves"
  | "leaves"
  | "snow"
  | "interior-glow";

/** Maps a peaceful-place destination to its nature motion profile. */
export function peacefulPlaceNatureMotion(input: {
  placeId?: string;
  experienceName?: string;
  soundscapeId?: string;
}): PeacefulPlaceNatureMotion {
  const hay = [
    input.placeId ?? "",
    input.experienceName ?? "",
    input.soundscapeId ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (/\b(storm|rain|thunder|shower)\b/.test(hay)) return "rain";
  if (/\b(ocean|wave|beach|shore|pond|water)\b/.test(hay)) return "waves";
  if (/\b(snow|winter|frost)\b/.test(hay)) return "snow";
  if (/\b(forest|garden|leaves|wind|meadow)\b/.test(hay)) return "leaves";
  return "interior-glow";
}
