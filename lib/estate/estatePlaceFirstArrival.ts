/**
 * Place-First Arrival — every destination follows the same sequence:
 * 1. Room visible immediately (full-screen photograph)
 * 2. Optional in-room animation (never a blocking modal)
 * 3. Spark greets naturally in conversation
 * 4. Member interaction begins
 */

import {
  estateArrivalShariGreeting,
  shouldPlayEstateArrival,
} from "./estateArrivalExperience";
import { dispatchEstateArrivalStart } from "./estateArrivalSession";

export const ESTATE_PLACE_FIRST_ARRIVAL_SEQUENCE = [
  "room-visible",
  "optional-animation",
  "spark-greeting",
  "member-interaction",
] as const;

/** Invitation grids and blocking overlays never gate destination entry. */
export function shouldSuppressDestinationInvitationGrid(): boolean {
  return true;
}

/**
 * Begin optional in-room arrival animation. Room must already be mounted beneath.
 * Spark greeting is delivered after animation via EstateArrivalHost.
 */
export function playPlaceFirstArrival(
  roomId: string,
  shariGreeting?: string | null,
): void {
  const greeting =
    shariGreeting ?? estateArrivalShariGreeting(roomId) ?? undefined;

  if (!shouldPlayEstateArrival(roomId)) {
    return;
  }

  dispatchEstateArrivalStart({
    roomId,
    shariGreeting: greeting,
  });
}
