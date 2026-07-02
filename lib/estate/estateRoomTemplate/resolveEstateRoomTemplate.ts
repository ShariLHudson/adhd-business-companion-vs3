/**
 * Resolve the five-layer Estate Room Template™ for a room id.
 */

import { resolveEstateArrivalExperience } from "@/lib/estate/estateArrivalExperience";
import { getEstateRoomById } from "@/lib/estate/estateRoomRegistry";
import {
  ESTATE_ROOM_EMPTY_STATE_COPY,
  ESTATE_ROOM_HERO_COPY,
  ESTATE_ROOM_TEMPLATE_DEFAULT_EMPTY,
  ESTATE_ROOM_TEMPLATE_DEFAULT_WELCOME,
  ESTATE_ROOM_WELCOME_COPY,
} from "./catalog";
import type { EstateRoomTemplate } from "./types";

export function resolveEstateRoomTemplate(roomId: string): EstateRoomTemplate {
  const room = getEstateRoomById(roomId);
  const arrival = resolveEstateArrivalExperience(roomId);

  const heroOverride = ESTATE_ROOM_HERO_COPY[roomId];
  const title =
    heroOverride?.title ??
    arrival?.title ??
    room?.trademark ??
    room?.name ??
    roomId;
  const subtitle =
    heroOverride?.subtitle ??
    arrival?.motto ??
    room?.emotionalFeeling ??
    "";
  const purpose = heroOverride?.purpose ?? room?.purpose ?? "";

  const welcome =
    ESTATE_ROOM_WELCOME_COPY[roomId] ??
    (arrival?.shariGreeting
      ? { shariLine: arrival.shariGreeting }
      : ESTATE_ROOM_TEMPLATE_DEFAULT_WELCOME);

  const emptyState =
    ESTATE_ROOM_EMPTY_STATE_COPY[roomId] ?? ESTATE_ROOM_TEMPLATE_DEFAULT_EMPTY;

  return {
    roomId,
    hero: { title, subtitle, purpose },
    welcome,
    emptyState,
  };
}

export function resolveEstateRoomWelcomeLine(roomId: string): string {
  const { welcome } = resolveEstateRoomTemplate(roomId);
  return [welcome.shariLine, ...(welcome.shariParagraphs ?? [])]
    .filter(Boolean)
    .join(" ");
}

export function resolveEstateRoomEmptyState(roomId: string) {
  return resolveEstateRoomTemplate(roomId).emptyState;
}
