/**
 * Deep-link intent for opening a specific Business Estate room.
 *
 * `openProfileDestinationCore("my-business-estate")` opens the estate overlay
 * but carries no target room. This tiny pub/sub lets a caller (chat "continue
 * your business profile", a resume action) name the room to land in. The
 * MyBusinessEstatePanel consumes the pending intent when it mounts and also
 * subscribes so a request while already open re-navigates.
 *
 * Mirrors the established estate how-to-guide pattern
 * (lib/estateRoomGuides/openGuide.ts). No new storage model — sessionStorage
 * only carries the transient hand-off between navigation and mount.
 */

import {
  BUSINESS_ESTATE_SECTIONS,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";

export const BUSINESS_ESTATE_SECTION_OPEN_EVENT =
  "business-estate-section-open" as const;

export type BusinessEstateSectionOpenDetail = {
  sectionId: BusinessEstateSectionId;
};

const PENDING_KEY = "business-estate-section-pending-v1";

function isKnownSection(value: string): value is BusinessEstateSectionId {
  return BUSINESS_ESTATE_SECTIONS.some((section) => section.id === value);
}

/** Request the estate overlay to open (or move to) a specific room. */
export function requestOpenBusinessEstateSection(
  sectionId: BusinessEstateSectionId,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, sectionId);
  } catch {
    /* noop */
  }
  window.dispatchEvent(
    new CustomEvent<BusinessEstateSectionOpenDetail>(
      BUSINESS_ESTATE_SECTION_OPEN_EVENT,
      { detail: { sectionId } },
    ),
  );
}

/** Consume a pending room request after the panel mounts (chat navigation). */
export function consumePendingBusinessEstateSection(): BusinessEstateSectionId | null {
  if (typeof window === "undefined") return null;
  try {
    const pending = window.sessionStorage.getItem(PENDING_KEY);
    if (!pending) return null;
    window.sessionStorage.removeItem(PENDING_KEY);
    return isKnownSection(pending) ? pending : null;
  } catch {
    return null;
  }
}

export function subscribeBusinessEstateSectionOpen(
  onOpen: (sectionId: BusinessEstateSectionId) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<BusinessEstateSectionOpenDetail>)
      .detail;
    if (detail?.sectionId && isKnownSection(detail.sectionId)) {
      onOpen(detail.sectionId);
    }
  };
  window.addEventListener(BUSINESS_ESTATE_SECTION_OPEN_EVENT, handler);
  return () =>
    window.removeEventListener(BUSINESS_ESTATE_SECTION_OPEN_EVENT, handler);
}

/** Drop any pending room intent (used on entry so nav opens at the overview). */
export function clearPendingBusinessEstateSection(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* noop */
  }
}

export const BUSINESS_ESTATE_RESET_EVENT = "business-estate-reset" as const;

/**
 * Return Business Estate navigation to its beginning/overview. Clears any
 * pending room intent and, if the panel is already open, signals it back to the
 * overview. This is a NAVIGATION reset only — it never touches saved profile or
 * research data. Called on every entry from outside the experience; an explicit
 * resume (e.g. chat "continue my business profile") re-requests a room after.
 */
export function requestBusinessEstateReset(): void {
  clearPendingBusinessEstateSection();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BUSINESS_ESTATE_RESET_EVENT));
}

export function subscribeBusinessEstateReset(onReset: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onReset();
  window.addEventListener(BUSINESS_ESTATE_RESET_EVENT, handler);
  return () =>
    window.removeEventListener(BUSINESS_ESTATE_RESET_EVENT, handler);
}
