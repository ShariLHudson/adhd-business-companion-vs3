/**
 * Daily Context Engine — build today's shared situation snapshot.
 */

import { getDayState, getTimeBlocks, todayStr } from "@/lib/companionStore";
import { getActiveReminders } from "@/lib/reminderStore";
import { getRhythmPrefs, isInQuietHours } from "@/lib/rhythms/prefs";
import { listActiveRhythms } from "@/lib/rhythms/store";
import type { DayCondition } from "@/lib/rhythms/types";
import type {
  BuildDailyContextInput,
  CompanionAvailability,
  DailyContext,
  DailyContextSourceSignal,
  DailyEnergyLevel,
  DailyFocusLevel,
  Interruptibility,
  MeetingLoad,
  OptionalPromptPressure,
  SignalProvenance,
} from "./types";

function dateKeyFrom(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function resolveTimezone(override?: string): string {
  if (override) return override;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  } catch {
    return "local";
  }
}

function mapEnergyFromDayState(): {
  energy: DailyEnergyLevel;
  provenance: SignalProvenance;
} {
  const day = getDayState();
  if (!day) return { energy: "unknown", provenance: "unknown" };
  if (day.energy === "low") return { energy: "low", provenance: "user_provided" };
  if (day.energy === "high") return { energy: "high", provenance: "user_provided" };
  if (day.energy === "medium") {
    return { energy: "medium", provenance: "user_provided" };
  }
  return { energy: "unknown", provenance: "unknown" };
}

function mapFocusFromCondition(
  condition: DayCondition | null,
  activeFocusSession: boolean,
): { focus: DailyFocusLevel; provenance: SignalProvenance } {
  if (activeFocusSession) {
    return { focus: "deep", provenance: "computed" };
  }
  if (condition === "focus") {
    return { focus: "deep", provenance: "user_provided" };
  }
  if (
    condition === "overwhelmed" ||
    condition === "low_energy" ||
    condition === "unexpected"
  ) {
    return { focus: "scattered", provenance: "computed" };
  }
  if (condition === "quiet" || condition === "personal") {
    return { focus: "steady", provenance: "computed" };
  }
  return { focus: "unknown", provenance: "unknown" };
}

function meetingLoadForToday(now: Date): {
  load: MeetingLoad;
  provenance: SignalProvenance;
  blockCount: number;
} {
  const key = dateKeyFrom(now);
  const blocks = getTimeBlocks().filter(
    (b) =>
      b.date === key &&
      b.status !== "completed" &&
      b.status !== "not-today" &&
      b.status !== "missed",
  );
  const count = blocks.length;
  if (count === 0) {
    return { load: "none", provenance: "computed", blockCount: 0 };
  }
  if (count <= 2) {
    return { load: "light", provenance: "computed", blockCount: count };
  }
  if (count <= 4) {
    return { load: "moderate", provenance: "computed", blockCount: count };
  }
  return { load: "heavy", provenance: "computed", blockCount: count };
}

function dueCount(
  isoTimes: Array<string | undefined>,
  nowMs: number,
): number {
  return isoTimes.filter((t) => t && new Date(t).getTime() <= nowMs).length;
}

function resolveInterruptibility(input: {
  quietHoursActive: boolean;
  activeFocusSession: boolean;
  dayCondition: DayCondition | null;
  energy: DailyEnergyLevel;
  meetingLoad: MeetingLoad;
  reminderDueCount: number;
  rhythmDueCount: number;
}): Interruptibility {
  if (input.quietHoursActive || input.activeFocusSession) {
    return "do_not_disturb";
  }
  if (input.dayCondition === "quiet") {
    return "cautious";
  }
  if (
    input.dayCondition === "overwhelmed" ||
    input.dayCondition === "low_energy" ||
    input.dayCondition === "focus" ||
    input.energy === "low" ||
    input.meetingLoad === "heavy" ||
    input.reminderDueCount + input.rhythmDueCount >= 5
  ) {
    return "cautious";
  }
  return "open";
}

function resolveCompanionAvailability(
  interruptibility: Interruptibility,
  dayCondition: DayCondition | null,
  companionAvailable?: boolean,
): CompanionAvailability {
  if (companionAvailable === false) return "deferred";
  if (interruptibility === "do_not_disturb") return "deferred";
  if (dayCondition === "quiet") return "deferred";
  if (interruptibility === "cautious") return "light";
  return "available";
}

function resolveOptionalPressure(input: {
  reminderDueCount: number;
  rhythmDueCount: number;
  meetingLoad: MeetingLoad;
  dayCondition: DayCondition | null;
}): OptionalPromptPressure {
  const due = input.reminderDueCount + input.rhythmDueCount;
  if (
    input.dayCondition === "overwhelmed" ||
    input.meetingLoad === "heavy" ||
    due >= 4
  ) {
    return "high";
  }
  if (due >= 2 || input.meetingLoad === "moderate") return "moderate";
  return "low";
}

function resolveOptionalPromptAllowance(input: {
  quietHoursActive: boolean;
  activeFocusSession: boolean;
  dayCondition: DayCondition | null;
  energy: DailyEnergyLevel;
  interruptibility: Interruptibility;
  optionalPromptPressure: OptionalPromptPressure;
}): boolean {
  if (input.quietHoursActive) return false;
  if (input.activeFocusSession) return false;
  if (input.interruptibility === "do_not_disturb") return false;
  if (input.dayCondition === "quiet") return false;
  if (input.dayCondition === "overwhelmed") return false;
  if (input.dayCondition === "low_energy") return false;
  if (input.energy === "low") return false;
  if (input.optionalPromptPressure === "high") return false;
  return true;
}

function pushSignal(
  signals: DailyContextSourceSignal[],
  key: string,
  value: string | number | boolean | null,
  provenance: SignalProvenance,
): void {
  signals.push({ key, value, provenance });
}

/**
 * Build (or rebuild) today's Daily Context.
 * Pure snapshot — does not mutate reminders, rhythms, or schedules.
 */
export function buildDailyContext(
  input: BuildDailyContextInput = {},
): DailyContext {
  const now = input.now ?? new Date();
  const timezone = resolveTimezone(input.timezone);
  const prefs = getRhythmPrefs();
  const dayCondition =
    input.dayCondition !== undefined
      ? input.dayCondition
      : prefs.dayCondition ?? null;
  const dayConditionProvenance: SignalProvenance =
    input.dayCondition !== undefined
      ? input.dayCondition == null
        ? "unknown"
        : "user_provided"
      : prefs.dayCondition
        ? "user_provided"
        : "unknown";

  const quietHoursActive =
    input.quietHoursActive ?? isInQuietHours(now, prefs);
  const quietProvenance: SignalProvenance =
    input.quietHoursActive !== undefined ? "user_provided" : "computed";
  const activeFocusSession = Boolean(input.activeFocusSession);

  const reminders = getActiveReminders();
  const rhythms = listActiveRhythms();
  const nowMs = now.getTime();

  const reminderCount = input.reminderCount ?? reminders.length;
  const reminderDueCount =
    input.reminderDueCount ??
    dueCount(
      reminders.map((r) => r.scheduledAt),
      nowMs,
    );
  const rhythmCount = input.rhythmCount ?? rhythms.length;
  const rhythmDueCount =
    input.rhythmDueCount ??
    dueCount(
      rhythms.map((r) => r.nextDueAt),
      nowMs,
    );

  const meetingResolved =
    input.meetingLoad !== undefined
      ? {
          load: input.meetingLoad,
          provenance: "user_provided" as SignalProvenance,
          blockCount: -1,
        }
      : meetingLoadForToday(now);
  const meetingLoad = meetingResolved.load;

  const energyResolved =
    input.energy !== undefined
      ? {
          energy: input.energy,
          provenance:
            input.energy === "unknown"
              ? ("unknown" as SignalProvenance)
              : ("user_provided" as SignalProvenance),
        }
      : mapEnergyFromDayState();
  const energy = energyResolved.energy;

  const focusResolved =
    input.focusLevel !== undefined
      ? {
          focus: input.focusLevel,
          provenance:
            input.focusLevel === "unknown"
              ? ("unknown" as SignalProvenance)
              : ("user_provided" as SignalProvenance),
        }
      : mapFocusFromCondition(dayCondition, activeFocusSession);
  const focusLevel = focusResolved.focus;

  const interruptibility = resolveInterruptibility({
    quietHoursActive,
    activeFocusSession,
    dayCondition,
    energy,
    meetingLoad,
    reminderDueCount,
    rhythmDueCount,
  });

  const companionAvailability = resolveCompanionAvailability(
    interruptibility,
    dayCondition,
    input.companionAvailable,
  );

  const optionalPromptPressure = resolveOptionalPressure({
    reminderDueCount,
    rhythmDueCount,
    meetingLoad,
    dayCondition,
  });

  const optionalPromptAllowance = resolveOptionalPromptAllowance({
    quietHoursActive,
    activeFocusSession,
    dayCondition,
    energy,
    interruptibility,
    optionalPromptPressure,
  });

  const availableWorkMinutes =
    input.availableWorkMinutes === undefined
      ? null
      : input.availableWorkMinutes;

  const currentPriorities = input.currentPriorities ?? [];
  const currentPriorityIds = input.currentPriorityIds ?? [];
  const dateKey = dateKeyFrom(now) || todayStr();
  const builtAt = now.toISOString();

  const sourceSignals: DailyContextSourceSignal[] = [];
  pushSignal(
    sourceSignals,
    "dayCondition",
    dayCondition,
    dayConditionProvenance,
  );
  pushSignal(sourceSignals, "energyLevel", energy, energyResolved.provenance);
  pushSignal(sourceSignals, "focusLevel", focusLevel, focusResolved.provenance);
  pushSignal(
    sourceSignals,
    "availableTime",
    availableWorkMinutes,
    availableWorkMinutes == null ? "unknown" : "user_provided",
  );
  pushSignal(
    sourceSignals,
    "meetingLoad",
    meetingLoad,
    meetingResolved.provenance,
  );
  pushSignal(sourceSignals, "reminderLoad", reminderDueCount, "computed");
  pushSignal(sourceSignals, "rhythmLoad", rhythmDueCount, "computed");
  pushSignal(
    sourceSignals,
    "priorityLoad",
    currentPriorityIds.length || currentPriorities.length,
    currentPriorityIds.length || currentPriorities.length
      ? "user_provided"
      : "unknown",
  );
  pushSignal(sourceSignals, "quietHoursActive", quietHoursActive, quietProvenance);
  pushSignal(
    sourceSignals,
    "activeFocusSession",
    activeFocusSession,
    input.activeFocusSession !== undefined ? "user_provided" : "computed",
  );
  pushSignal(
    sourceSignals,
    "interruptibility",
    interruptibility,
    "computed",
  );
  pushSignal(
    sourceSignals,
    "optionalPromptAllowance",
    optionalPromptAllowance,
    "computed",
  );

  return {
    dateKey,
    date: dateKey,
    timezone,
    builtAt,
    generatedAt: builtAt,
    dayCondition,
    energy,
    energyLevel: energy,
    focusLevel,
    availableWorkMinutes,
    availableTime: availableWorkMinutes,
    loads: {
      reminderCount,
      reminderDueCount,
      rhythmCount,
      rhythmDueCount,
      meetingLoad,
      optionalPromptPressure,
    },
    meetingLoad,
    reminderLoad: reminderDueCount,
    rhythmLoad: rhythmDueCount,
    priorityLoad: currentPriorityIds.length || currentPriorities.length,
    interruptibility,
    currentPriorities,
    currentPriorityIds,
    activeFocusSession,
    quietHoursActive,
    companionAvailability,
    optionalPromptAllowance,
    sourceSignals,
    extensions: { ...(input.extensions ?? {}) },
  };
}

/** Convenience alias — same as buildDailyContext. */
export function getDailyContext(
  input: BuildDailyContextInput = {},
): DailyContext {
  return buildDailyContext(input);
}
