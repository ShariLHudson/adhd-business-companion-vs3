/**
 * Shari's Presence — the Companion does not need to be seen to be felt.
 * @see docs/companion-homestead/SHARIS_PRESENCE.md
 */

import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { CompanionExperienceId } from "@/lib/companionUniverse/companionPresenceEngine";

export const SHARI_PRESENCE_STATES = [
  "host",
  "beside-you",
  "nearby",
  "returning",
] as const;

export type ShariPresenceState = (typeof SHARI_PRESENCE_STATES)[number];

export type SharisPresenceInput = {
  placeId?: CompanionPlaceId;
  experienceId?: CompanionExperienceId;
  workspaceId?: string;
  section?: string;
  writingActive?: boolean;
  voiceConversation?: boolean;
};

export type SharisPresenceVerdict = {
  state: ShariPresenceState;
  principle: typeof SHARIS_PRESENCE_PRINCIPLE;
  placeId: CompanionPlaceId;
  /** Shari photograph in environment — Host only */
  showShariImage: boolean;
  /** Mug, journal, glasses — Nearby / Returning */
  showEvidenceObjects: boolean;
  evidenceObjects: readonly string[];
  /** Communication Anchor is primary — Beside You */
  communicationAnchorPrimary: boolean;
  conversationPrimary: boolean;
  guestFeelsWatched: false;
  guestFeelsWelcomed: true;
  hostLine: string;
  dataAttributes: Record<string, string>;
};

export const SHARIS_PRESENCE_PRINCIPLE =
  "The Companion does not need to be seen to be felt." as const;

export const SHARIS_PRESENCE_GOAL =
  "Make the guest feel they are never alone — without placing Shari in every room." as const;
