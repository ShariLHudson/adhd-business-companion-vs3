/**
 * Deterministic Business Estate / Business Profile navigation intent.
 *
 * Phrases like "open business builder" / "go to my business estate" /
 * "help me work on my business" — and, added here, "complete / continue /
 * finish my business profile", "business information", "finish setting up my
 * business" — match none of the capability or direct-command detectors, so they
 * otherwise fall through to the answer-first path and get a generic coaching
 * reply instead of opening the member's business record. This recognizer lets
 * handleSend open the (estate-envelope-backed) Business Estate overlay directly.
 *
 * Client Avatar / People I Help language is intentionally NOT matched here — it
 * is already deterministic through the universal-capability recognizer.
 */

const CLIENT_AVATAR_RE =
  /\b(?:client\s+avatar|people\s+i\s+(?:help|serve)|ideal\s+client|icp)\b/i;

/** Open/work-in-the-Business-Estate phrasing (the original recognizer). */
const BUSINESS_ESTATE_NAV_RE =
  /(?:\bbusiness\s+builder\b|\bbusiness\s+estate\b|\b(?:open|go\s+to|take\s+me\s+to|bring\s+up|work\s+on|manage|build|help\s+me\s+(?:with|work\s+on|build|manage)|let'?s\s+(?:work\s+on|build|manage))\s+(?:my\s+)?business\b)/i;

/**
 * Business-Profile-specific phrasing — completing / continuing / updating the
 * member's business record, referred to by many natural names.
 */
const BUSINESS_PROFILE_NAV_RE =
  /\b(?:business|company)\s+(?:profile|information|description|foundation)\b|\b(?:complete|continue|finish|update|review|revisit|set\s+up|finish\s+setting\s+up)\s+(?:setting\s+up\s+)?(?:my\s+)?business\b|\bset(?:ting)?\s+up\s+(?:my\s+)?business\b|\btell\s+(?:spark(?:\s+estate)?|us|me)?\s*(?:about\s+)?(?:my\s+)?business\b|\bcomplete\s+my\s+business\s+estate\b|\bupdate\s+what\s+(?:i\s+do|my\s+business\s+(?:do(?:es)?|offers?))\b/i;

/** True when the member is asking to open / continue their Business Profile. */
export function detectBusinessProfileNavIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (CLIENT_AVATAR_RE.test(t)) return false;
  return BUSINESS_PROFILE_NAV_RE.test(t);
}

/** True when the member is asking to open / work in their Business Estate. */
export function detectBusinessEstateNavIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  // Keep People I Help / client-avatar routing with the capability recognizer.
  if (CLIENT_AVATAR_RE.test(t)) return false;
  return BUSINESS_ESTATE_NAV_RE.test(t) || BUSINESS_PROFILE_NAV_RE.test(t);
}
