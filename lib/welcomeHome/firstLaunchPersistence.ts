import { getPrefs, savePrefs } from "@/lib/companionStore";

/** Local fallback — mirrors `hasSeenWelcomeIntro` on member prefs. */
const STORAGE_KEY = "companion-welcome-home-first-launch-v1";
const LEGACY_COMPLETE = "complete";

export const HAS_SEEN_WELCOME_INTRO_PREFS_KEY = "hasSeenWelcomeIntro" as const;

export function hasSeenWelcomeIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (getPrefs().hasSeenWelcomeIntro) return true;
    return localStorage.getItem(STORAGE_KEY) === LEGACY_COMPLETE;
  } catch {
    return true;
  }
}

/** @deprecated Use hasSeenWelcomeIntro */
export const hasCompletedWelcomeHomeFirstLaunch = hasSeenWelcomeIntro;

export function markWelcomeIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    savePrefs({ hasSeenWelcomeIntro: true });
    localStorage.setItem(STORAGE_KEY, LEGACY_COMPLETE);
  } catch {
    /* quota */
  }
}

/** @deprecated Use markWelcomeIntroSeen */
export const recordWelcomeHomeFirstLaunchComplete = markWelcomeIntroSeen;

export function resetWelcomeHomeFirstLaunchForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  savePrefs({ hasSeenWelcomeIntro: false });
}
