/** Visitor display name for ceremony & greetings — quiet, never interrogates. */

const NAME_KEYS = [
  "companion-member-display-name",
  "spark-member-display-name",
  "companion-member-name",
] as const;

export function getJournalGazeboVisitorName(): string {
  if (typeof window === "undefined") return "";
  try {
    for (const key of NAME_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw?.trim()) return raw.trim();
    }
  } catch {
    /* ignore */
  }
  return "";
}
