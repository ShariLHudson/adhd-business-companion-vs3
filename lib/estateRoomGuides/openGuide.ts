/**
 * Open Estate How-to guides from chat or destination actions.
 * Destination panels listen; closing restores prior view without navigation.
 */

import type { EstateHowToGuideId } from "./types";

export const ESTATE_HOW_TO_GUIDE_OPEN_EVENT =
  "estate-how-to-guide-open" as const;

export type EstateHowToGuideOpenDetail = {
  guideId: EstateHowToGuideId;
};

const PENDING_KEY = "estate-how-to-guide-pending-v1";

export function requestOpenEstateHowToGuide(guideId: EstateHowToGuideId): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, guideId);
  } catch {
    /* noop */
  }
  window.dispatchEvent(
    new CustomEvent<EstateHowToGuideOpenDetail>(ESTATE_HOW_TO_GUIDE_OPEN_EVENT, {
      detail: { guideId },
    }),
  );
}

/** Consume a pending open request after destination mounts (chat navigation). */
export function consumePendingEstateHowToGuide(
  expected: EstateHowToGuideId,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const pending = window.sessionStorage.getItem(PENDING_KEY);
    if (pending !== expected) return false;
    window.sessionStorage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}

export function subscribeEstateHowToGuideOpen(
  guideId: EstateHowToGuideId,
  onOpen: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<EstateHowToGuideOpenDetail>).detail;
    if (detail?.guideId === guideId) onOpen();
  };
  window.addEventListener(ESTATE_HOW_TO_GUIDE_OPEN_EVENT, handler);
  return () =>
    window.removeEventListener(ESTATE_HOW_TO_GUIDE_OPEN_EVENT, handler);
}
