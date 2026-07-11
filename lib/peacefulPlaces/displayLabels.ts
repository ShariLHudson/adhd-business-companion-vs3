/** Peaceful Places UI — no trademark symbol on user-facing labels. */
export function peacefulPlaceDisplayName(name: string): string {
  return name.replace(/\u2122|/g, "").trim();
}
