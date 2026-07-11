import { getRoomBackdropImageUrl } from "@/lib/chatBackdrop/chatBackdropPreference";
import { WELCOME_ROOM_ASSET } from "@/lib/welcomeRoom/types";

/**
 * Welcome Home lobby photograph — room-specific override only.
 * Never falls back to global everyday-chat backdrop (e.g. Fireside Deck).
 */
export function resolveWelcomeHomeHeroImageUrl(): string {
  return getRoomBackdropImageUrl("welcome-home") ?? WELCOME_ROOM_ASSET;
}
