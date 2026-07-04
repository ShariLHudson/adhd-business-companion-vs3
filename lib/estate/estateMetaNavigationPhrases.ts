/**
 * Meta navigation phrase detection — no registry imports (avoids cycles).
 */

const ANOTHER_ROOM_RE =
  /\b(?:another|different|some\s+other|new)\s+room\b|\bvisit\s+another\s+room\b|\b(?:go|take\s+me)\s+(?:somewhere|elsewhere|another\s+place|a\s+different\s+place)\b/i;

const ROOM_LIST_RE =
  /\b(?:(?:list|show).{0,24}(?:of\s+)?rooms?|rooms?\s+(?:on|at|in|around)\s+the\s+estate|rooms?\s+i\s+can\s+visit|what\s+rooms?|which\s+rooms?|places\s+(?:on|at|in)\s+the\s+estate|places\s+i\s+can\s+(?:go|visit)|where\s+can\s+i\s+go\s+on\s+the\s+estate)\b/i;

const ESTATE_MAP_RE =
  /\b(?:estate\s+map|folded\s+map|show\s+(?:me\s+)?(?:the\s+)?map|explore\s+the\s+estate)\b/i;

/** "rooms I can visit" — not a navigation command. */
const VISIT_AS_LIST_RE =
  /\b(?:list|what|which|do you have).{0,50}\brooms?\b/i;

export function isEstateRoomListOrMapRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return ESTATE_MAP_RE.test(t) || ROOM_LIST_RE.test(t);
}

export function isAnotherRoomRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return ANOTHER_ROOM_RE.test(t);
}

export function isMetaNavigationDestinationPhrase(phrase: string): boolean {
  const t = phrase.trim().toLowerCase().replace(/^(?:the|a|an)\s+/, "");
  if (!t) return true;
  if (/^another\s+room$/.test(t)) return true;
  if (/^(?:a\s+)?different\s+room$/.test(t)) return true;
  if (/^some\s+other\s+room$/.test(t)) return true;
  if (/^new\s+room$/.test(t)) return true;
  return isAnotherRoomRequest(t) || isEstateRoomListOrMapRequest(t);
}

/** True when text uses a hard nav verb — excluding room-list phrasing. */
export function hasHardEstateNavigationIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isEstateRoomListOrMapRequest(t) || isAnotherRoomRequest(t)) return false;
  if (VISIT_AS_LIST_RE.test(t)) return false;
  if (/\brooms?\b.{0,24}\b(?:i can|to|you can)\s+visit\b/i.test(t)) return false;
  return /\b(?:take me to|go to|visit|head to|bring me to|let(?:'s| us) go to)\b/i.test(
    t,
  );
}
