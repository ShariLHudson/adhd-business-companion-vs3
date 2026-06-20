/**
 * Today panel — graceful postpone without deleting work.
 */

import {
  dismissHomeResumeForSession,
  findLatestHomeResumeItem,
  isHomeResumeDismissedForSession,
  type HomeResumeItem,
} from "./homeResumeItem";

const PLAN_MY_DAY_DISMISS_KEY = "companion-today-plan-dismiss-v1";

export const TODAY_RESUME_LATER_MESSAGE =
  "No problem. We can come back to that later.";

export const TODAY_PLAN_LATER_MESSAGE =
  "That's okay. What would help most right now?";

/** Resume item for Today — null when dismissed for this session. */
export function findTodayResumeItem(): HomeResumeItem | null {
  const item = findLatestHomeResumeItem();
  if (!item) return null;
  if (isHomeResumeDismissedForSession(item.id)) return null;
  return item;
}

export function dismissTodayResume(item: HomeResumeItem): void {
  dismissHomeResumeForSession(item.id);
}

export function isPlanMyDayDismissedForSession(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(PLAN_MY_DAY_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissPlanMyDayForSession(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PLAN_MY_DAY_DISMISS_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearPlanMyDayDismissForSession(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(PLAN_MY_DAY_DISMISS_KEY);
  } catch {
    /* ignore */
  }
}
