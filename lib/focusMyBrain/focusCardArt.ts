import type { FocusFeelingId } from "@/lib/focusHub";

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
  "break-smaller": "/backgrounds/peaceful-places/woodland-pathway.png",
  "prioritize-options": "/backgrounds/plan-my-day-background.png",
  "focus-audio": "/backgrounds/peaceful-places/summer-storm-covered-deck.png",
  "momentum-builders": "/backgrounds/focus-my-brain-games-background.png",
  "breathe-reset": "/backgrounds/audio-rain-background.png",
  "sixty-second-reset": "/backgrounds/peaceful-places/cozy-cafeimage.png",
  "calm-moment": "/backgrounds/peaceful-places/cozy-cafeimage.png",
  "brain-break-games": "/backgrounds/focus-my-brain-games-background.png",
  "sensory-reset": "/backgrounds/clear-my-mind-background.png",
  "brain-dump": "/backgrounds/clear-my-mind-background.png",
  "chat-guide": "/backgrounds/life-experience-room.png",
  "mind-slow-breathe": "/backgrounds/audio-rain-background.png",
  "mind-slow-places": "/backgrounds/peaceful-places/woodland-pathway.png",
  "overwhelm-prioritize": "/backgrounds/plan-my-day-background.png",
  "overwhelm-break-down": "/backgrounds/peaceful-places/woodland-pathway.png",
  "overwhelm-clear": "/backgrounds/clear-my-mind-background.png",
  "overwhelm-breathe": "/backgrounds/audio-rain-background.png",
};

export function focusToolCardArt(toolId: string): string {
  return (
    FOCUS_TOOL_CARD_ART[toolId] ??
    "/backgrounds/peaceful-places/peaceful-places-pathway.png"
  );
}
