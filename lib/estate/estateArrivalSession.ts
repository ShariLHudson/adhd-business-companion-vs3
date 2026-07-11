/**
 * Estate Arrival Experience — cross-cutting session events (room open → arrival overlay).
 */

export const ESTATE_ARRIVAL_START_EVENT = "spark:estate-arrival-start";
export const ESTATE_ARRIVAL_COMPLETE_EVENT = "spark:estate-arrival-complete";

export type EstateArrivalStartDetail = {
  roomId: string;
  /** When set, Shari speaks this after the arrival animation — not during. */
  shariGreeting?: string;
  /** Skip veil/title when re-entering the same room quickly */
  subtle?: boolean;
  /** Default true — false for direct go-to-room (image only, no ambient audio). */
  playAmbience?: boolean;
};

let arrivalActive = false;
let blockingShari = false;

export function isEstateArrivalActive(): boolean {
  return arrivalActive;
}

/** True while Shari should wait for the arrival animation to finish. */
export function isEstateArrivalBlockingShari(): boolean {
  return blockingShari;
}

export function dispatchEstateArrivalStart(detail: EstateArrivalStartDetail): void {
  if (typeof window === "undefined") return;
  arrivalActive = true;
  blockingShari = true;
  window.dispatchEvent(
    new CustomEvent(ESTATE_ARRIVAL_START_EVENT, { detail }),
  );
}

export function dispatchEstateArrivalComplete(roomId: string): void {
  if (typeof window === "undefined") return;
  arrivalActive = false;
  blockingShari = false;
  window.dispatchEvent(
    new CustomEvent(ESTATE_ARRIVAL_COMPLETE_EVENT, { detail: { roomId } }),
  );
}

export function subscribeEstateArrivalStart(
  listener: (detail: EstateArrivalStartDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    listener((event as CustomEvent<EstateArrivalStartDetail>).detail);
  };
  window.addEventListener(ESTATE_ARRIVAL_START_EVENT, handler);
  return () => window.removeEventListener(ESTATE_ARRIVAL_START_EVENT, handler);
}

export function subscribeEstateArrivalComplete(
  listener: (detail: { roomId: string }) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    listener((event as CustomEvent<{ roomId: string }>).detail);
  };
  window.addEventListener(ESTATE_ARRIVAL_COMPLETE_EVENT, handler);
  return () => window.removeEventListener(ESTATE_ARRIVAL_COMPLETE_EVENT, handler);
}
