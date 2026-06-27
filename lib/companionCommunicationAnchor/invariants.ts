import type { ArrivalBeat } from "@/lib/arrivalExperience/types";

/**
 * Companion Communication Anchor — non-negotiable homestead invariant.
 * Shari must always be reachable. Life may change; communication access may not.
 */
export const COMMUNICATION_ANCHOR_RULES = {
  alwaysReachable: true,
  requiresTextInput: true,
  requiresMicButton: true,
  requiresSendButton: true,
  mustNotHideBehindMenus: true,
  preserveDuringRoomTransitions: true,
  preserveDuringOverlays: true,
  decorativeLayersMustNotBlockInput: true,
  noAutoFocusDuringArrivalPause: true,
  mustNotRequireLeavingRoomToSpeak: true,
} as const;

export const COMMUNICATION_ANCHOR_TEST_IDS = {
  anchor: "companion-communication-anchor",
  mic: "companion-communication-mic",
  input: "companion-communication-input",
  send: "companion-communication-send",
} as const;

export type CommunicationAnchorVariant =
  | "default"
  | "living-room"
  | "workspace"
  | "window-seat"
  | "focus-studio"
  | "minimal";

export type CommunicationAnchorMode = "quiet" | "full";

/** Primary screens that must render a communication anchor. */
export const PRIMARY_SCREEN_SHELLS = [
  "living-room",
  "companion-chat",
  "workspace-split",
  "workspace-focus",
  "games-minimal",
  "breathing-minimal",
  "focus-audio-minimal",
  "mobile-sticky",
] as const;

export type PrimaryScreenShell = (typeof PRIMARY_SCREEN_SHELLS)[number];

/**
 * Living Change Engine / arrival rule — life layers never remove speech access.
 */
export const LIVING_CHANGE_COMMUNICATION_RULE =
  "Living changes must never remove, hide, or block the Companion Communication Anchor.";

/** Communication anchor is always present on every arrival beat. */
export function beatShowsCommunicationAnchor(_beat: ArrivalBeat): boolean {
  return true;
}

/**
 * Full prominence during active conversation beats.
 * Quiet (still reachable) during arrival pause — no auto-focus disruption.
 */
export function resolveCommunicationAnchorMode(
  beat: ArrivalBeat,
): CommunicationAnchorMode {
  if (beat === "reality" || beat === "staying" || beat === "invite") {
    return "full";
  }
  return "quiet";
}

export function arrivalBeatAllowsAutoFocus(beat: ArrivalBeat): boolean {
  return beat === "reality" || beat === "staying";
}
