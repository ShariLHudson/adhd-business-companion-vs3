/**
 * Pending collection save offer — permission before opening a room.
 */

import type { EstateCollectionCaptureValues, EstateCollectionRoomId } from "./types";

const STORAGE_KEY = "spark:estate:collection-pending-offer:v1";
const COOLDOWN_KEY = "spark:estate:collection-offer-cooldown:v1";

export type CollectionPendingPhase = "room_suggested" | "choose_room";

export type CollectionPendingOffer = {
  phase: CollectionPendingPhase;
  sourceUserText: string;
  suggestedRoomId: EstateCollectionRoomId;
  /** When the Playbook suggests more than one resting place. */
  alternateRoomIds?: EstateCollectionRoomId[];
  prefill: EstateCollectionCaptureValues;
  offeredAtTurn: number;
  offerLine: string;
  savedAt: string;
};

export function saveCollectionPendingOffer(offer: CollectionPendingOffer): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(offer));
  } catch {
    /* ignore */
  }
}

export function loadCollectionPendingOffer(): CollectionPendingOffer | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CollectionPendingOffer;
  } catch {
    return null;
  }
}

export function clearCollectionPendingOffer(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function markCollectionOfferCooldown(turn: number): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(COOLDOWN_KEY, String(turn));
  } catch {
    /* ignore */
  }
}

export function isCollectionOfferCooldownActive(currentTurn: number): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(COOLDOWN_KEY);
    if (!raw) return false;
    const last = Number(raw);
    if (Number.isNaN(last)) return false;
    return currentTurn - last < 8;
  } catch {
    return false;
  }
}

export function peekCollectionOfferCooldownTurn(): number | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(COOLDOWN_KEY);
    if (!raw) return null;
    const last = Number(raw);
    return Number.isNaN(last) ? null : last;
  } catch {
    return null;
  }
}
