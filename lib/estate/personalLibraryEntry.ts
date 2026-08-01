/**
 * Personal Library entry intent — which sub-view of the ONE canonical
 * PersonalLibraryRoom a natural-language request should land on.
 *
 * All Personal Library / Spark Collection / Find / Recent phrases resolve to the
 * same canonical place id ("personal-library"); this classifier decides whether
 * to open the room plainly, open the saved-Spark collection, focus Find/Search,
 * or show Recent — without creating any duplicate route.
 */
export type PersonalLibraryEntryView = "room" | "collection" | "find" | "recent";

/** Classify a Personal Library navigation request into an entry view. */
export function resolvePersonalLibraryEntryView(
  userText: string | null | undefined,
): PersonalLibraryEntryView {
  const t = (userText ?? "").toLowerCase();

  // Recent first — "recent" is more specific than the generic saved/collection.
  if (/\brecent\b/.test(t)) return "recent";

  // Find / search — including "find a saved card", "find my saved note".
  if (/\bfind\b|\bsearch\b|look (?:for|up)|saved card|saved note/.test(t)) {
    return "find";
  }

  // Spark Collection / saved items.
  if (/spark collection|saved spark|saved item|my collection|\bcollection\b/.test(t)) {
    return "collection";
  }

  return "room";
}
