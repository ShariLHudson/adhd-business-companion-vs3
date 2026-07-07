/**
 * Detect questions about the member's current Estate location.
 */

const LOCATION_HERE_RE =
  /\b(?:what is here|what'?s here|what can i do here|what else is in (?:this|the) (?:room|place|house)|show me around|where can i go from here)\b/i;

const LOCATION_AREAS_RE =
  /\b(?:what are (?:all )?the places (?:in|here|around)|what places are (?:in|here)|all the places in)\b/i;

const NAMED_LOCATION_IN_QUERY_RE =
  /\b(?:possibility house|treehouse(?: possibility house)?|house in the trees)\b/i;

export function isLocationHereQuery(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (LOCATION_HERE_RE.test(t)) return true;
  if (LOCATION_AREAS_RE.test(t)) return true;
  if (NAMED_LOCATION_IN_QUERY_RE.test(t) && /\b(?:places?|areas?|rooms?|what)\b/i.test(t)) {
    return true;
  }
  return false;
}

export function namedLocationFamilyFromQuery(userText: string): string | null {
  const t = userText.toLowerCase();
  if (
    /\b(?:possibility house|treehouse|house in the trees)\b/.test(t)
  ) {
    return "house-possibility";
  }
  return null;
}
