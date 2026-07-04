/**
 * Estate place navigation intents — separate room routing from audio / planned places.
 *
 * Swimming pool is planned (not live). Celebration sounds are audio settings, not rooms.
 */

import { formatEstatePlaceSuggestionMenu } from "./estatePlaceIdentityLock";

/** Explicit swim / pool navigation — route to Summer Terrace™ via alias registry. */
export const EXPLICIT_POOL_NAV_RE =
  /\b(?:(?:take\s+me|go|head|bring\s+me)\s+to\s+(?:the\s+)?(?:swimming\s+)?pool|(?:show\s+me|open|visit)\s+(?:the\s+)?(?:swimming\s+)?pool|swimming\s+pool)\b/i;

/** Vague swim activity — offer water-adjacent alternatives when pool terrace isn't named. */
export const VAGUE_SWIM_ACTIVITY_RE =
  /\b(?:let(?:'s| us)\s+go\s+swimming|go\s+(?:for\s+a\s+)?swimming|take\s+a\s+swim)\b/i;

export function isExplicitPoolNavigationRequest(text: string): boolean {
  return EXPLICIT_POOL_NAV_RE.test(text.trim());
}

export function isVagueSwimmingActivityRequest(text: string): boolean {
  return VAGUE_SWIM_ACTIVITY_RE.test(text.trim());
}

/** @deprecated Use isExplicitPoolNavigationRequest or isVagueSwimmingActivityRequest */
export function isSwimmingPoolNavigationRequest(text: string): boolean {
  const trimmed = text.trim();
  return (
    isExplicitPoolNavigationRequest(trimmed) ||
    isVagueSwimmingActivityRequest(trimmed)
  );
}

/** Celebration audio — not Celebration Room™ / Hall™ / Garden™ navigation. */
export const CELEBRATION_SOUNDS_INTENT_RE =
  /\b(?:(?:show(?:\s+me)?|turn\s+on|enable|play|start)\s+(?:the\s+)?celebration\s+sounds?|celebration\s+sounds?\s+(?:on|please))\b/i;

export const SWIMMING_POOL_ALTERNATIVE_PLACE_IDS = [
  "seat-at-pond",
  "peaceful-places",
] as const;

export function isCelebrationSoundsIntent(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (!CELEBRATION_SOUNDS_INTENT_RE.test(trimmed)) return false;
  if (
    /\b(?:take\s+me\s+to|go\s+to|visit|celebration\s+(?:room|hall|garden))\b/i.test(
      trimmed,
    )
  ) {
    return false;
  }
  return true;
}

export function formatSwimmingPoolUnavailableReply(): string {
  return `The swimming pool isn't on the Estate yet — it's still being shaped, and I think you'll love it when it opens. For water and quiet nearby, we could visit Seat at the Pond™ or Peaceful Places™ — or stay right here.`;
}

export function formatSwimmingPoolOfferLine(): string {
  return `${formatSwimmingPoolUnavailableReply()}\n\n${formatEstatePlaceSuggestionMenu([
    ...SWIMMING_POOL_ALTERNATIVE_PLACE_IDS,
  ])}`;
}

export function formatCelebrationSoundsReply(): string {
  return `Celebration sounds live in your audio settings — they're not a room on the map. I can help you turn them on while we stay here, or we can open Estate Soundscapes™ for focus and calm music.`;
}
