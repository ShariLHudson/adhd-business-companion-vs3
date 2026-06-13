import { getPrefs, savePrefs } from "@/lib/companionStore";

const USERS_KEY = "companion-onboarded-users-v1";

function readUserMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Whether this signed-in user (or anonymous visitor) finished the 2-min setup. */
export function hasUserOnboarded(userId: string | undefined): boolean {
  if (userId) {
    return Boolean(readUserMap()[userId]);
  }
  return getPrefs().onboarded;
}

export function markUserOnboarded(userId: string | undefined): void {
  savePrefs({ onboarded: true });
  if (!userId || typeof window === "undefined") return;
  const map = readUserMap();
  map[userId] = true;
  localStorage.setItem(USERS_KEY, JSON.stringify(map));
}
