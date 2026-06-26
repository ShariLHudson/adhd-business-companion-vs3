import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { ShariPresenceState } from "@/lib/sharisPresence/types";

/** Layer 3 output — how Shari exists; never owned by rooms or renderers. */
export const PRESENCE_STATES = [
  "invisible",
  "nearby",
  "beside-you",
  "across-the-room",
  "walking-with-you",
  "listening",
  "working-together",
  "celebrating",
  "speaking",
  "host",
  "returning",
] as const;

export type PresenceStateId = (typeof PRESENCE_STATES)[number];

export type PresenceState = {
  state: PresenceStateId;
  /** Canonical Shari's Presence™ state used for render hints */
  sharisState: ShariPresenceState;
  showShariImage: boolean;
  showEvidenceObjects: boolean;
  communicationAnchorPrimary: boolean;
  conversationPrimary: boolean;
  hostLine: string;
  dataAttributes: Record<string, string>;
};

export type PresenceInput = {
  workspaceId?: string;
  section?: string;
  placeId?: CompanionPlaceId;
  writingActive?: boolean;
  voiceConversation?: boolean;
  overwhelmed?: boolean;
  celebrating?: boolean;
};
