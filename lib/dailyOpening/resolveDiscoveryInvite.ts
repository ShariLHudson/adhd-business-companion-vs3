/**
 * Quiet secondary discovery invite — never a fourth primary choice.
 * First 60 days + adaptive day 61+ resolve through first60Days catalog.
 */

import { todayStr } from "@/lib/companionStore";
import type { DailyOpeningMomentKind } from "./buildDailyOpeningWelcome";
import { resolveDiscoveryForWelcomeDay } from "./first60Days";
import type { DailyOpeningEntryPoint, DailyOpeningDiscoveryInvite } from "./types";
import { DAILY_OPENING_DISCOVERY_DAY_STORAGE } from "./types";

const HIDDEN: DailyOpeningDiscoveryInvite = {
  show: false,
  title: "Today's Discovery",
  line: "There is one part of Spark Estate you can explore whenever you are ready.",
  primaryLabel: "Explore",
  secondaryLabel: "Skip",
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

  const last = readLastDiscoveryDay();
  const today = todayStr();
  if (last === today) return { ...HIDDEN };

  // Show on first platform opening or Settings New Day — not same-day returns.
  const eligibleEntry =
    input.entryPoint === "first-platform-opening" ||
    (input.entryPoint === "settings-new-day" &&
      input.momentKind === "first-of-day");

  if (!eligibleEntry) return { ...HIDDEN };

  const now = input.now ?? new Date();
  const resolved = resolveDiscoveryForWelcomeDay({ now, dayKey: today });
  if (!resolved) return { ...HIDDEN };

  return {
    show: true,
    title: "Today's Discovery",
    featureTitle: resolved.title,
    line: resolved.why,
    whyToday: resolved.whyToday,
    discoveryId: resolved.id,
    destinationId: resolved.destinationId,
    primaryLabel: "Explore",
    secondaryLabel: "Skip",
  };
}
