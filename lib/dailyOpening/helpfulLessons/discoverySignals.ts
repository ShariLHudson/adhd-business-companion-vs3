/**
 * Read-only discovery signals for Show Me Something Helpful selection.
 *
 * Reads existing stores only — profile completion, room-visit memory, and the
 * relationship-age clock. It never writes and never duplicates completion
 * tracking. Every reader degrades to a safe default ("unknown" / empty) on any
 * error, and completion is derived from SAVED FIELDS, not page visits.
 */

import {
  getPeopleIHelpFacingStatus,
  listEstateOverviewRooms,
} from "@/lib/profile/businessEstateRedesign/roomProgress";
import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";
import { resolveWelcomeDayIndex } from "@/lib/dailyOpening/first60Days";
import { resolveSettingsCompletion } from "./settingsCompletionSignal";
import type {
  HelpfulLessonCompletionArea,
  HelpfulLessonLifecycleWindow,
} from "./types";

export type CompletionStatus = "empty" | "started" | "complete" | "unknown";

export type CompletionSignal = {
  status: CompletionStatus;
  /** Remaining pieces where a real count is known; otherwise null. */
  remaining: number | null;
};

export type HelpfulDiscoverySignals = {
  completion: Record<HelpfulLessonCompletionArea, CompletionSignal>;
  visitCounts: Record<string, number>;
  lastUnfinishedRoomId: string | null;
  /** Soft only — never surfaced to the user; "unknown" when no reliable clock. */
  lifecycleWindow: HelpfulLessonLifecycleWindow | "unknown";
  currentActivityDestinationId: string | null;
};

const UNKNOWN: CompletionSignal = { status: "unknown", remaining: null };

/** Business profile — aggregate saved-field progress across the estate rooms. */
export function resolveBusinessCompletion(): CompletionSignal {
  try {
    const rooms = listEstateOverviewRooms().filter((r) => r.kind === "room");
    if (rooms.length === 0) return UNKNOWN;
    const incomplete = rooms.filter((r) => r.progressPercent < 100);
    if (incomplete.length === 0) return { status: "complete", remaining: 0 };
    const anyProgress = rooms.some((r) => r.progressPercent > 0);
    return {
      status: anyProgress ? "started" : "empty",
      remaining: incomplete.length,
    };
  } catch {
    return UNKNOWN;
  }
}

/** People I Help — from saved avatar depth, not page visits. */
export function resolvePeopleCompletion(): CompletionSignal {
  try {
    const facing = getPeopleIHelpFacingStatus();
    if (facing === "not-personalized") return { status: "empty", remaining: null };
    if (facing === "well-defined") return { status: "complete", remaining: 0 };
    // getting-started / growing / useful-foundation / ready-to-review
    return { status: "started", remaining: null };
  } catch {
    return UNKNOWN;
  }
}

function resolveVisit(): { visitCounts: Record<string, number>; lastUnfinishedRoomId: string | null } {
  try {
    const mem = getEstateMemory().roomVisitMemory;
    return {
      visitCounts: mem?.visitCounts ?? {},
      lastUnfinishedRoomId: mem?.lastUnfinishedActivity?.roomId ?? null,
    };
  } catch {
    return { visitCounts: {}, lastUnfinishedRoomId: null };
  }
}

/**
 * Soft lifecycle window from the existing relationship clock. Used only to
 * gently boost window-tagged lessons — never surfaced and never a hard gate, so
 * a defaulted/absent clock cannot invent a fake day number in the UI.
 */
export function resolveLifecycleWindow(): HelpfulLessonLifecycleWindow | "unknown" {
  try {
    const { dayIndex } = resolveWelcomeDayIndex();
    if (!Number.isFinite(dayIndex) || dayIndex < 1) return "unknown";
    if (dayIndex <= 14) return "days-1-14";
    if (dayIndex <= 30) return "days-15-30";
    if (dayIndex <= 60) return "days-31-60";
    if (dayIndex <= 90) return "days-61-90";
    return "day-90-plus";
  } catch {
    return "unknown";
  }
}

export function resolveHelpfulDiscoverySignals(options?: {
  currentActivityDestinationId?: string | null;
}): HelpfulDiscoverySignals {
  const visit = resolveVisit();
  return {
    completion: {
      business: resolveBusinessCompletion(),
      "people-i-help": resolvePeopleCompletion(),
      settings: resolveSettingsCompletion(),
    },
    visitCounts: visit.visitCounts,
    lastUnfinishedRoomId: visit.lastUnfinishedRoomId,
    lifecycleWindow: resolveLifecycleWindow(),
    currentActivityDestinationId: options?.currentActivityDestinationId ?? null,
  };
}
