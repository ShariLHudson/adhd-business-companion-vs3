/**
 * Library conversation intents — reading, resources, thinkers, authors.
 */

const WHATS_AVAILABLE_RE =
  /\b(?:what(?:'s| is)\s+available|what\s+do\s+you\s+have|what\s+can\s+i\s+(?:read|explore|find|browse)|i\s+don'?t\s+know.{0,40}(?:what|available|here))\b/i;

const GREAT_THINKERS_RE =
  /\b(?:great\s+thinkers?|learn\s+from\s+(?:great\s+)?thinkers?)\b/i;

const DAN_MARTELL_RE = /\bdan\s+martell\b/i;

const AUTHOR_READ_RE =
  /\b(?:read|find|something\s+from|do\s+you\s+have|anything\s+by)\b.{0,48}\b([a-z][a-z' -]{2,})\b/i;

export function isLibraryPlaceId(placeId?: string | null): boolean {
  if (!placeId) return false;
  return placeId === "library" || placeId === "growth-library";
}

export function isLibraryExplorationTurn(
  userText: string,
  currentPlaceId?: string | null,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (!isLibraryPlaceId(currentPlaceId)) return false;
  return (
    WHATS_AVAILABLE_RE.test(t) ||
    GREAT_THINKERS_RE.test(t) ||
    DAN_MARTELL_RE.test(t) ||
    AUTHOR_READ_RE.test(t)
  );
}

export function formatLibraryWhatsAvailableReply(): string {
  return "The Library holds stories and resources on the shelves — and the Momentum Institute nearby has business learning drawers. You can browse resources, ask for something specific, or tell me what you're curious about.";
}

export function formatLibraryGreatThinkersReply(): string {
  return "We can pull wisdom from entrepreneurs and teachers — scaling, leadership, craft. Tell me what kind of thinking you're hungry for, or say browse and I'll open the shelves.";
}

export function formatLibraryDanMartellReply(): string {
  return "Dan Martell writes on scaling SaaS and founder discipline — I don't have his full library loaded on the shelf yet. We can browse resources and search, or talk through what you hope to learn from him. Which sounds better?";
}

export function formatLibraryAuthorReply(authorHint: string): string {
  const name = authorHint.trim();
  if (!name) return formatLibraryWhatsAvailableReply();
  return `I can look for ${name} in the resource browser — or we can talk through what you're hoping to find. Want me to open Browse Resources?`;
}

export function evaluateLibraryConversationReply(
  userText: string,
  currentPlaceId?: string | null,
): string | null {
  if (!isLibraryExplorationTurn(userText, currentPlaceId)) return null;
  const t = userText.trim();
  if (GREAT_THINKERS_RE.test(t)) return formatLibraryGreatThinkersReply();
  if (DAN_MARTELL_RE.test(t)) return formatLibraryDanMartellReply();
  const authorMatch = t.match(AUTHOR_READ_RE);
  if (authorMatch?.[1] && !DAN_MARTELL_RE.test(t)) {
    return formatLibraryAuthorReply(authorMatch[1]);
  }
  if (WHATS_AVAILABLE_RE.test(t)) return formatLibraryWhatsAvailableReply();
  return null;
}
