/**
 * Member display name for personalized estate stationery.
 * Wire to companion profile when available; localStorage fallback for dev.
 */

const STORAGE_KEY = "spark-member-display-name";

export function getMemberDisplayName(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw?.trim()) return raw.trim();
  } catch {
    /* storage unavailable */
  }
  return "";
}

export function getMemberFirstName(): string {
  const display = getMemberDisplayName();
  if (!display.trim()) return "";
  return display.trim().split(/\s+/)[0] ?? display.trim();
}

export function formatNoteCardAddress(memberName: string): { line: string } {
  const trimmed = memberName.trim();
  if (!trimmed) return { line: "For You." };
  return { line: `For You, ${trimmed}.` };
}
