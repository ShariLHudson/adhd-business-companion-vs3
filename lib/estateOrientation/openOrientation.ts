/**
 * Open How Spark Estate Works Together from Help, onboarding, or room links.
 * Host listens; panel floats over the current place — no forced navigation.
 */

import type { EstateOrientationPlaceId } from "./types";

export const HOW_SPARK_ESTATE_WORKS_TOGETHER_OPEN_EVENT =
  "how-spark-estate-works-together-open" as const;

export type HowSparkEstateWorksTogetherOpenDetail = {
  /** Optional focus place when opened from a destination */
  focusPlaceId?: EstateOrientationPlaceId | null;
  /** Open directly into the optional Estate Tour invitation */
  startTour?: boolean;
};

const PENDING_KEY = "how-spark-estate-works-together-pending-v1";

export function requestOpenHowSparkEstateWorksTogether(
  detail: HowSparkEstateWorksTogetherOpenDetail = {},
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(detail));
  } catch {
    /* noop */
  }
  window.dispatchEvent(
    new CustomEvent<HowSparkEstateWorksTogetherOpenDetail>(
      HOW_SPARK_ESTATE_WORKS_TOGETHER_OPEN_EVENT,
      { detail },
    ),
  );
}

export function consumePendingHowSparkEstateWorksTogether(): HowSparkEstateWorksTogetherOpenDetail | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(PENDING_KEY);
    return JSON.parse(raw) as HowSparkEstateWorksTogetherOpenDetail;
  } catch {
    return null;
  }
}

export function subscribeHowSparkEstateWorksTogetherOpen(
  onOpen: (detail: HowSparkEstateWorksTogetherOpenDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const detail =
      (event as CustomEvent<HowSparkEstateWorksTogetherOpenDetail>).detail ??
      {};
    onOpen(detail);
  };
  window.addEventListener(HOW_SPARK_ESTATE_WORKS_TOGETHER_OPEN_EVENT, handler);
  return () =>
    window.removeEventListener(
      HOW_SPARK_ESTATE_WORKS_TOGETHER_OPEN_EVENT,
      handler,
    );
}
