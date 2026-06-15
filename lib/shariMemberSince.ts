/** First-visit timestamp for app-anniversary Shari presence. */

const MEMBER_SINCE_KEY = "companion-member-since-v1";

export function getMemberSinceIso(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = localStorage.getItem(MEMBER_SINCE_KEY);
    if (existing) return existing;
    const iso = new Date().toISOString();
    localStorage.setItem(MEMBER_SINCE_KEY, iso);
    return iso;
  } catch {
    return null;
  }
}

export function isAppAnniversaryToday(
  memberSinceIso: string | null | undefined,
  now = new Date(),
): boolean {
  if (!memberSinceIso) return false;
  const start = new Date(memberSinceIso);
  if (Number.isNaN(start.getTime())) return false;
  if (start.getFullYear() >= now.getFullYear()) return false;
  return (
    start.getMonth() === now.getMonth() && start.getDate() === now.getDate()
  );
}
