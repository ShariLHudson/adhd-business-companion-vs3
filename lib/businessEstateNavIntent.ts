/**
 * Deterministic Business Estate navigation intent.
 *
 * Phrases like "open business builder" / "go to my business estate" /
 * "help me work on my business" match none of the capability or direct-command
 * detectors, so they otherwise fall through to a section-less direct-estate
 * visit that never mounts MyBusinessEstatePanel (a blank / black screen). This
 * recognizer lets handleSend open the focused Business Estate overlay directly.
 *
 * Client Avatar / People I Help language is intentionally NOT matched here — it
 * is already deterministic through the universal-capability recognizer.
 */

const BUSINESS_ESTATE_NAV_RE =
  /(?:\bbusiness\s+builder\b|\bbusiness\s+estate\b|\b(?:open|go\s+to|take\s+me\s+to|bring\s+up|work\s+on|manage|build|help\s+me\s+(?:with|work\s+on|build|manage)|let'?s\s+(?:work\s+on|build|manage))\s+(?:my\s+)?business\b)/i;

/** True when the member is asking to open / work in their Business Estate. */
export function detectBusinessEstateNavIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  // Keep People I Help / client-avatar routing with the capability recognizer.
  if (/\b(?:client\s+avatar|people\s+i\s+help|ideal\s+client|icp)\b/i.test(t)) {
    return false;
  }
  return BUSINESS_ESTATE_NAV_RE.test(t);
}
