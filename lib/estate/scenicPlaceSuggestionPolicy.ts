/**
 * Global policy for Estate scenic / place suggestions from companion conversation.
 *
 * Unsolicited place menus (Peaceful Places, Lakeside Hammock, Ocean Conservatory,
 * multi-place "wander there together" scripts) stay OFF until intent routing is reliable.
 * Explicit place / room / scenic asks still resolve.
 */

/** Kill-switch: unsolicited scenic place recommendations from ordinary chat. */
export const scenicPlaceAutoSuggestionsEnabled = false;

/**
 * Member clearly asked for a place, room, or scenic/calming destination —
 * not mere overwhelm / stress / brain / calm keywords.
 */
export function isExplicitScenicPlaceRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  // Named scenic hubs / sensory destinations
  if (
    /\b(?:peaceful places|lakeside hammock|ocean conservatory|soundscapes?|sensory)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // Explore / map the Estate
  if (
    /\b(?:show me the estate|explore (?:the )?estate|estate map|what (?:rooms|places) do you have)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // Show / suggest / give me N places (including "show me three calming places")
  if (
    /\b(?:show|suggest|recommend|give)\s+me\b.{0,60}\b(?:places?|rooms?|spots?)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\b(?:three|a few|some|couple|two|\d+)\s+(?:\w+\s+){0,3}(?:calming|peaceful|quiet|calm)\s+places?\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // Take me / go somewhere (place-seeking)
  if (/\b(?:take me|bring me|go)\s+somewhere\b/i.test(t)) return true;
  if (
    /\b(?:take me|bring me|go to|visit|head to|open)\b.{0,80}\b(?:place|room|garden|hammock|conservatory|peaceful|quiet|calm|calming)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // Explicit place-seeking language (somewhere / a place to / which room…)
  if (
    /\b(?:somewhere|some place|a place to|quiet place|peaceful place|calm(?:ing)? place|which room|what room|room for|space (?:to|for)|settle into)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // somewhere / a place + calm/scenic language (belt-and-suspenders)
  if (
    /\b(?:somewhere|some place|a place)\b/i.test(t) &&
    /\b(?:quiet|peaceful|calm|calming|relax|reflect|rest|scenic|unwind|read)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // place/room/spot to relax/reflect (not bare "need to relax")
  if (
    /\b(?:place|room|spot|somewhere)\b.{0,36}\b(?:relax|reflect|unwind|rest|calm)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\b(?:relax|reflect|unwind)\b.{0,36}\b(?:place|room|spot|somewhere)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // Explicit "where should I go"
  if (
    /\b(?:where (?:should|can|do|would|might) i go|don'?t know where to go|not sure where to go|no idea where to go)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  // Fresh air / outdoors as a physical setting ask
  if (
    /\b(?:need|want|could use).{0,20}fresh\s+air\b|\b(?:get|be)\s+outside\b|\b(?:somewhere|place).{0,20}(?:outside|outdoors)\b/i.test(
      t,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Whether companion conversation may offer Estate place recommendations.
 * When auto-suggestions are disabled, only explicit place asks pass.
 */
export function mayOfferScenicPlaceSuggestions(text: string): boolean {
  if (scenicPlaceAutoSuggestionsEnabled) return true;
  return isExplicitScenicPlaceRequest(text);
}

/** How many place options to offer for an explicit ask (1 unless they asked for several). */
export function scenicPlaceSuggestionCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  if (/\b(?:three|3)\b/i.test(t) && /\bplaces?\b/i.test(t)) return 3;
  if (
    /\b(?:a few|some|couple|two|2)\b/i.test(t) &&
    /\bplaces?\b/i.test(t)
  ) {
    return 3;
  }
  // Singular: "somewhere peaceful", "a quiet place", "take me somewhere…"
  if (
    /\bsomewhere\b/i.test(t) ||
    /\ba (?:quiet|peaceful|calm(?:ing)?)\s+place\b/i.test(t) ||
    /\b(?:take me|bring me)\s+somewhere\b/i.test(t)
  ) {
    return 1;
  }
  return 3;
}
