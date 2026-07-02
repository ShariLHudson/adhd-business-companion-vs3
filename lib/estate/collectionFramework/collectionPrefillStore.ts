/**
 * Session prefill for collection rooms — opens compose with draft, never auto-saves.
 */

import type {
  EstateCollectionCaptureValues,
  EstateCollectionRoomId,
} from "./types";
import { ESTATE_COLLECTION_ROOM_IDS } from "./types";

const KEY_PREFIX = "spark:estate:collection-prefill:v1:";

export type CollectionPrefillPayload = {
  roomId: EstateCollectionRoomId;
  values: EstateCollectionCaptureValues;
  sourceText: string;
  savedAt: string;
};

function storageKey(roomId: EstateCollectionRoomId): string {
  return `${KEY_PREFIX}${roomId}`;
}

export function setCollectionPrefill(payload: CollectionPrefillPayload): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(payload.roomId), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function peekCollectionPrefill(
  roomId: EstateCollectionRoomId,
): CollectionPrefillPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(roomId));
    if (!raw) return null;
    return JSON.parse(raw) as CollectionPrefillPayload;
  } catch {
    return null;
  }
}

export function consumeCollectionPrefill(
  roomId: EstateCollectionRoomId,
): CollectionPrefillPayload | null {
  const payload = peekCollectionPrefill(roomId);
  if (!payload) return null;
  if (typeof sessionStorage === "undefined") return payload;
  try {
    sessionStorage.removeItem(storageKey(roomId));
  } catch {
    /* ignore */
  }
  return payload;
}

export function clearAllCollectionPrefills(): void {
  if (typeof sessionStorage === "undefined") return;
  for (const roomId of ESTATE_COLLECTION_ROOM_IDS) {
    try {
      sessionStorage.removeItem(storageKey(roomId));
    } catch {
      /* ignore */
    }
  }
}
