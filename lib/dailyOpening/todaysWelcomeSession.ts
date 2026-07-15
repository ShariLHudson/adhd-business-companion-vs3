/**
 * Session gate for Today's Welcome Card — show once per calendar day per tab,
 * then stay dismissed while the member moves between rooms.
 */

import { todayStr } from "@/lib/companionStore";

export const TODAYS_WELCOME_SESSION_DISMISS_KEY =
  "spark-todays-welcome-dismissed-day-v1";

export function isTodaysWelcomeDismissedThisSession(
  day = todayStr(),
): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.sessionStorage.getItem(TODAYS_WELCOME_SESSION_DISMISS_KEY) === day
    );
  } catch {
    return false;
  }
}

export function markTodaysWelcomeDismissedThisSession(
  day = todayStr(),
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TODAYS_WELCOME_SESSION_DISMISS_KEY, day);
  } catch {
    /* ignore */
  }
}

export function clearTodaysWelcomeSessionDismissForTests(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(TODAYS_WELCOME_SESSION_DISMISS_KEY);
  } catch {
    /* ignore */
  }
}
