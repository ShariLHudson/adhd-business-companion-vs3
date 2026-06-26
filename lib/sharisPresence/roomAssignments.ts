import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { ShariPresenceState } from "./types";

/** Constitutional room assignments — presence must feel natural for the guest's task */
export const ROOM_PRESENCE_ASSIGNMENTS: Record<CompanionPlaceId, ShariPresenceState> = {
  "living-room": "host",
  "window-seat": "beside-you",
  "planning-table": "beside-you",
  "business-office": "beside-you",
  "kitchen-table": "nearby",
  "reading-nook": "nearby",
  "creative-studio": "nearby",
  "workshop": "nearby",
  "focus-studio": "beside-you",
  "sunroom-over-pond": "nearby",
  "garden": "nearby",
  "garden-path": "nearby",
  "greenhouse": "nearby",
  "back-deck": "host",
  library: "nearby",
  "front-porch": "host",
  barn: "nearby",
  "outlook-point": "nearby",
  "adventure-room": "nearby",
  "future-wings": "nearby",
  "fire-circle": "host",
};

export const SECTION_TO_PLACE_FOR_PRESENCE: Record<string, CompanionPlaceId> = {
  home: "living-room",
  today: "living-room",
  "brain-dump": "window-seat",
  "plan-my-day": "planning-table",
  "decision-compass": "business-office",
  focus: "sunroom-over-pond",
  "visual-focus": "focus-studio",
  "content-generator": "creative-studio",
  "my-work": "creative-studio",
  growth: "reading-nook",
  "my-journey": "reading-nook",
};

export const EXPERIENCE_TO_PLACE: Record<string, CompanionPlaceId> = {
  "living-room": "living-room",
  "clear-my-mind": "window-seat",
  "window-seat": "window-seat",
  "plan-my-day": "planning-table",
  "planning-table": "planning-table",
  "creative-studio": "creative-studio",
  "reading-nook": "reading-nook",
  "business-office": "business-office",
  "kitchen-table": "kitchen-table",
  "focus-studio": "focus-studio",
  "sunroom-over-pond": "sunroom-over-pond",
};

export function presenceStateForPlace(placeId: CompanionPlaceId): ShariPresenceState {
  return ROOM_PRESENCE_ASSIGNMENTS[placeId] ?? "nearby";
}
