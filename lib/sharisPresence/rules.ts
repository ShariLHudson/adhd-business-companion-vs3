import type { ShariPresenceState } from "./types";

/** Shari never competes with guest work — never feels watched */
export const GUEST_NEVER_FEELS_WATCHED = true;

export function shariImageAllowedForState(state: ShariPresenceState): boolean {
  return state === "host";
}

export function evidenceAllowedForState(state: ShariPresenceState): boolean {
  return state === "nearby" || state === "returning" || state === "beside-you";
}

export function communicationAnchorPrimaryForState(
  state: ShariPresenceState,
): boolean {
  return state === "beside-you";
}

export function conversationPrimaryForState(state: ShariPresenceState): boolean {
  return state === "host";
}
