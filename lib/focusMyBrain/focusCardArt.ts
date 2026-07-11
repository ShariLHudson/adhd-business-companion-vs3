import type { FocusFeelingId } from "@/lib/focusHub";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

/** Panoramic banners for conservatory destination plaques. */
export const FOCUS_HUB_CARD_ART: Record<FocusFeelingId, string> = {
  stuck: "/backgrounds/peaceful-places/peaceful-places-pathway.png",
  "need-break": "/backgrounds/evening/living-room-at-twilight-bg.png",
};

export function focusHubCardArt(feelingId: FocusFeelingId): string {
  return FOCUS_HUB_CARD_ART[feelingId];
}

/** Soft illustrations for workspace tool cards. */
export const FOCUS_TOOL_CARD_ART: Record<string, string> = {
  "next-small-step": "/backgrounds/peaceful-places/peaceful-places-pathway.png",
  "break-smaller": "/backgrounds/woodland-pathway.png",
  "prioritize-options": ESTATE_ROOM_BG.studyHall,
  "focus-audio": "/backgrounds/peaceful-places/summer-storm-covered-deck.png",
  "momentum-builders": ESTATE_ROOM_BG.gameRoom,
  "sixty-second-reset": "/backgrounds/peaceful-places/cozy-cafeimage.png",
  "calm-moment": "/backgrounds/peaceful-places/cozy-cafeimage.png",
  "brain-break-games": ESTATE_ROOM_BG.gameRoom,
  "sensory-reset": ESTATE_ROOM_BG.sunroom,
  "brain-dump": ESTATE_ROOM_BG.sunroom,
  "chat-guide": "/backgrounds/life-experience-room.png",
  "mind-slow-breathe": "/backgrounds/audio-rain-background.png",
  "mind-slow-places": "/backgrounds/woodland-pathway.png",
  "overwhelm-prioritize": ESTATE_ROOM_BG.studyHall,
  "overwhelm-break-down": "/backgrounds/woodland-pathway.png",
  "overwhelm-clear": ESTATE_ROOM_BG.sunroom,
  "overwhelm-breathe": "/backgrounds/audio-rain-background.png",
};

export function focusToolCardArt(toolId: string): string {
  return (
    FOCUS_TOOL_CARD_ART[toolId] ??
    "/backgrounds/peaceful-places/peaceful-places-pathway.png"
  );
}
