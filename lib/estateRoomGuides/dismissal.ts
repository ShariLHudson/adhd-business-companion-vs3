/**
 * First-visit How to Use invite dismissal — local preference only.
 */

import type { EstateHowToGuideId } from "./types";

const DISMISS_KEYS: Record<EstateHowToGuideId, string> = {
  "chamber-of-momentum": "chamber-how-to-invite-dismissed-v1",
  "my-business-estate": "business-estate-how-to-invite-dismissed-v1",
};

export function hasDismissedEstateHowToInvite(
  guideId: EstateHowToGuideId,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISS_KEYS[guideId]) === "1";
  } catch {
    return false;
  }
}

export function dismissEstateHowToInvite(guideId: EstateHowToGuideId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISS_KEYS[guideId], "1");
  } catch {
    /* noop */
  }
}
