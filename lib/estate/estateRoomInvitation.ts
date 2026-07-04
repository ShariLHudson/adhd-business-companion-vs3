/**
 * Arrival Before Activity™ — concierge invitations per room.
 * @see docs/estate/ARRIVAL_BEFORE_ACTIVITY.md
 */

import {
  ESTATE_INVITATION_LEAD,
  ESTATE_INVITATION_MAX_PRIMARY,
  ESTATE_INVITATION_PREAMBLE,
  ESTATE_ROOM_PRIMARY_CATALOG,
  ESTATE_UNIVERSAL_CLOSER_COPY,
} from "./estateRoomInvitationCatalog";
import { resolveDynamicEstateInvitations } from "./estateRoomInvitationDynamic";
import { resolveEstateRoomWelcomeLine } from "./estateRoomTemplate/resolveEstateRoomTemplate";
import type {
  EstateRoomInvitationAction,
  EstateRoomInvitationItem,
  EstateRoomInvitationSet,
} from "./estateRoomInvitationTypes";

export type {
  EstateRoomInvitationAction,
  EstateRoomInvitationItem,
  EstateRoomInvitationSet,
  EstateRoomInvitationTier,
} from "./estateRoomInvitationTypes";

/** Invitation choices that continue in the frosted chat — not room activity panels. */
export function estateInvitationKeepsInConversation(
  action: EstateRoomInvitationAction,
): boolean {
  switch (action.kind) {
    case "conversation":
    case "presence":
    case "estate-map":
    case "companion-continue":
    case "plan-my-day":
    case "show-suggestions":
      return true;
    default:
      return false;
  }
}

/** Gentle presence-first lines — never route or solve on arrival. */
export const ESTATE_PRESENCE_GREETINGS = [
  "I'm glad you're here.",
  "We don't have to accomplish anything right now.",
  "Sometimes it's enough just to slow down.",
  "We can simply enjoy the space for a moment.",
] as const;

export function estatePresenceGreeting(roomId: string): string {
  const welcome = resolveEstateRoomWelcomeLine(roomId);
  if (welcome && welcome !== "I'm glad you're here.") {
    return welcome;
  }
  const idx =
    roomId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
    ESTATE_PRESENCE_GREETINGS.length;
  return ESTATE_PRESENCE_GREETINGS[idx]!;
}

function universalClosers(roomId: string): EstateRoomInvitationItem[] {
  const copy = ESTATE_UNIVERSAL_CLOSER_COPY[roomId] ?? {};
  const includePresence = copy.includePresence !== false;
  const includeChat = copy.includeChat !== false;
  const items: EstateRoomInvitationItem[] = [];
  if (includeChat) {
    items.push({
      id: "universal-chat",
      emoji: "💬",
      label: copy.chat ?? "Just Chat with Shari",
      action: { kind: "conversation" },
      tier: "universal",
    });
  }
  items.push({
    id: "universal-navigate",
    emoji: "🚶",
    label: copy.navigate ?? "Visit Another Room",
    action: { kind: "estate-map" },
    tier: "universal",
  });
  if (includePresence) {
    items.push({
      id: "universal-presence",
      emoji: "🌿",
      label: copy.presence ?? "I'm Happy Just Being Here",
      action: { kind: "presence" },
      tier: "universal",
    });
  }
  return items;
}

function dedupeById(items: EstateRoomInvitationItem[]): EstateRoomInvitationItem[] {
  const seen = new Set<string>();
  const out: EstateRoomInvitationItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/** Full concierge invitation — dynamic + primary (≤5) + universal closers. */
export function resolveEstateRoomInvitationSet(
  roomId: string,
): EstateRoomInvitationSet {
  const dynamic = resolveDynamicEstateInvitations(roomId);
  const staticPrimary = (ESTATE_ROOM_PRIMARY_CATALOG[roomId] ?? []).filter(
    (item) =>
      !dynamic.some(
        (d) =>
          d.id === item.id ||
          (d.action.kind === "companion-continue" &&
            item.action.kind === "companion-continue"),
      ),
  );
  const roomPrimary = dedupeById([...dynamic, ...staticPrimary]).slice(
    0,
    ESTATE_INVITATION_MAX_PRIMARY,
  );

  const universal = universalClosers(roomId);
  const primaryEndIndex = roomPrimary.length;

  return {
    lead: ESTATE_INVITATION_LEAD,
    preamble: ESTATE_INVITATION_PREAMBLE,
    items: [...roomPrimary, ...universal],
    primaryEndIndex,
  };
}

/** Flat list for callers that only need ordered choices. */
export function resolveEstateRoomInvitations(
  roomId: string,
): EstateRoomInvitationItem[] {
  return resolveEstateRoomInvitationSet(roomId).items;
}

export function estateRoomUsesInvitationAfterArrival(roomId: string): boolean {
  return resolveEstateRoomInvitations(roomId).length > 1;
}
