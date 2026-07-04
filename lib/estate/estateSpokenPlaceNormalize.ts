/**
 * Normalize how members actually say place names — typos, missing words, speech quirks.
 * Applied before alias resolution; not a full fuzzy matcher.
 */

const SPOKEN_REPLACEMENTS: ReadonlyArray<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bjourn(?:al|el|le|el)\b/gi, replacement: "journal" },
  { pattern: /\bgazee?bo\b/gi, replacement: "gazebo" },
  { pattern: /\bobservat(?:ory|ery|ry)\b/gi, replacement: "observatory" },
  { pattern: /\bconservat(?:ory|ery|ry)\b/gi, replacement: "conservatory" },
  { pattern: /\blibrar(?:y|ie)\b/gi, replacement: "library" },
  { pattern: /\bhammoc?k\b/gi, replacement: "hammock" },
  { pattern: /\bverand?ah?\b/gi, replacement: "verandah" },
  { pattern: /\bswim(?:ming)?\s*pool\b/gi, replacement: "swimming pool" },
  { pattern: /\breading\s*nook\b/gi, replacement: "reading nook" },
  { pattern: /\bcoffe?e\s*house\b/gi, replacement: "coffee house" },
  { pattern: /\btea\s*room\b/gi, replacement: "tea room" },
  { pattern: /\bmusci\b/gi, replacement: "music" },
  { pattern: /\bpond\b/gi, replacement: "pond" },
];

/** Strip filler words members add around a place name. */
const SPOKEN_FILLER_RE =
  /^(?:i\s+(?:want|need|would like|'d like)\s+(?:to\s+go\s+to\s+|the\s+)?|(?:can\s+we|let(?:'s| us))\s+(?:go\s+to\s+|visit\s+)?(?:the\s+)?|(?:take\s+me\s+to\s+)?(?:the\s+)?)/i;

export function normalizeSpokenPlaceText(text: string): string {
  let normalized = text.trim();
  if (!normalized) return normalized;

  for (const { pattern, replacement } of SPOKEN_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  normalized = normalized.replace(SPOKEN_FILLER_RE, "").trim();
  return normalized;
}
