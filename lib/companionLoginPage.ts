/**
 * Companion login page — copy and asset constants.
 */

import { WELCOME_HOME_BACKGROUND } from "@/lib/welcomeRoom/types";

/** Login uses the same scene as the estate Welcome Home room. */
export const COMPANION_LOGIN_BACKGROUND = WELCOME_HOME_BACKGROUND;

/** Official Spark Studio Companions logo — transparent background. */
export const COMPANION_LOGIN_LOGO =
  "/images/shari/shari-images/ssc-logo-no-background.jpg" as const;

export type CompanionLoginVisitor = "first" | "returning";

export function companionLoginHeadline(visitor: CompanionLoginVisitor): string {
  return visitor === "returning" ? "Welcome back." : "Welcome.";
}

/** True when prior conversations or activity exist on this device. */
export function companionLoginHasHistory(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const prefsRaw = localStorage.getItem("companion-prefs-v1");
    if (prefsRaw) {
      const prefs = JSON.parse(prefsRaw) as { hasChatted?: boolean };
      if (prefs.hasChatted) return true;
    }
    return Boolean(localStorage.getItem("companion-last-activity-v1"));
  } catch {
    return false;
  }
}

export function companionLoginSubtext(
  visitor: CompanionLoginVisitor,
  hasCompanionHistory = false,
): string {
  if (visitor === "first") {
    return "I'm glad you're here.";
  }
  if (hasCompanionHistory) {
    return "We can continue where we left off whenever you're ready.";
  }
  return "It's nice to see you again.";
}

export const COMPANION_LOGIN_PRIVACY_LINE =
  "Your privacy is always protected." as const;

export const COMPANION_LOGIN_OPENING_MESSAGE =
  "Opening your space…" as const;

export const COMPANION_LOGIN_FORGOT_PASSWORD_LABEL = "Forgot password?" as const;
