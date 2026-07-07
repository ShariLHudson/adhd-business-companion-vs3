/**
 * Stable keys for journey item engagement tracking.
 */

import type { JourneyItemRef } from "./types";

export function journeyItemKey(ref: JourneyItemRef): string {
  return `${ref.type}:${ref.id}`;
}

export function parseJourneyItemKey(key: string): JourneyItemRef | null {
  const split = key.indexOf(":");
  if (split <= 0) return null;
  const type = key.slice(0, split);
  const id = key.slice(split + 1);
  if (!type || !id) return null;
  if (
    type !== "room" &&
    type !== "feature" &&
    type !== "tool" &&
    type !== "setting" &&
    type !== "discovery"
  ) {
    return null;
  }
  return { type, id };
}
