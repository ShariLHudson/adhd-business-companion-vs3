/**
 * Quiet secondary discovery invite — never a fourth primary choice.
 */

import { todayStr } from "@/lib/companionStore";
import { daysSinceRelationshipStart } from "@/lib/phase3AdaptiveRelationship";
import type { DailyOpeningMomentKind } from "./buildDailyOpeningWelcome";
import type { DailyOpeningEntryPoint, DailyOpeningDiscoveryInvite } from "./types";
import { DAILY_OPENING_DISCOVERY_DAY_STORAGE } from "./types";

const HIDDEN: DailyOpeningDiscoveryInvite = {
  show: false,
  title: "Something New to Discover",
  line: "There is one part of Spark Estate you can explore whenever you are ready.",
  primaryLabel: "Show Me",
  secondaryLabel: "Not Today",
};

function readLastDiscoveryDay(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(DAILY_OPENING_DISCOVERY_DAY_STORAGE);
  } catch {
    return null;
  }
}

export function markDailyOpeningDiscoveryPresented(day = todayStr()): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DAILY_OPENING_DISCOVERY_DAY_STORAGE, day);
  } catch {
    /* ignore */
  }
}

export function resolveDailyOpeningDiscoveryInvite(input: {
  entryPoint: DailyOpeningEntryPoint;
  momentKind: DailyOpeningMomentKind;
  /** Soft energy / overwhelm signal from arrival when available. */
  suppressForRecovery?: boolean;
  now?: Date;
}): DailyOpeningDiscoveryInvite {
  if (input.suppressForRecovery) return { ...HIDDEN };
  if (input.momentKind === "absence-return") return { ...HIDDEN };

  const days = daysSinceRelationshipStart(input.now ?? new Date());
  // First 60 days: at most one small learning suggestion, not every day.
  if (days >= 0 && days < 60) {
    const last = readLastDiscoveryDay();
    const today = todayStr();
    if (last === today) return { ...HIDDEN };
    // Show on first platform opening or Settings New Day — not same-day returns.
    if (
      input.entryPoint === "first-platform-opening" ||
      (input.entryPoint === "settings-new-day" &&
        input.momentKind === "first-of-day")
    ) {
      return {
        show: true,
        title: "Something New to Discover",
        line: "There is one part of Spark Estate you can explore whenever you are ready.",
        primaryLabel: "Show Me",
        secondaryLabel: "Not Today",
      };
    }
    return { ...HIDDEN };
  }

  // After 60 days — still quiet and infrequent.
  return { ...HIDDEN };
}
