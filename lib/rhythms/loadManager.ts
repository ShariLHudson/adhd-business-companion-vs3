/**
 * Notification Load Manager — Phase 1 + Phase 3 awareness.
 * Coordinates reminders, rhythms, optional companion prompts, Discovery Keys,
 * and future suggestion systems against the Daily Context Engine.
 *
 * Critical reminders remain highest priority.
 * Optional items respect today's context — never permanent schedule changes.
 */

import type { DailyContext } from "@/lib/dailyContextEngine/types";
import { buildDailyContext } from "@/lib/dailyContextEngine/buildDailyContext";
import type { MemberRhythm, RhythmPriority } from "./types";
import {
  getRhythmPrefs,
  incrementPromptedCount,
  isInQuietHours,
} from "./prefs";
import { isWithinFlexibleWindow } from "./scheduling";
import type { Reminder } from "@/lib/reminderStore";

export type DeliverableKind = "rhythm" | "reminder";

export type OptionalPromptKind =
  | "companion_prompt"
  | "discovery_key"
  | "future_suggestion";

export type Deliverable = {
  kind: DeliverableKind;
  id: string;
  title: string;
  body: string;
  priority: RhythmPriority;
  dueAt?: string;
  rhythmId?: string;
  reminderId?: string;
  destinationId?: string;
};

const PRIORITY_RANK: Record<RhythmPriority, number> = {
  critical: 0,
  important: 1,
  supportive: 2,
  optional: 3,
};

const PROMPT_COOLDOWN_MS = 55_000;

function reminderPriority(r: Reminder): RhythmPriority {
  return (r.priority as RhythmPriority | undefined) ?? "important";
}

/**
 * When a rhythm and its linked reminder are both due, keep the reminder only
 * (reminder is the delivery vehicle — prevents duplicate chimes).
 */
export function dedupeLinkedDeliverables(
  items: Deliverable[],
): Deliverable[] {
  const linkedRhythmIds = new Set(
    items
      .filter((d) => d.kind === "reminder" && d.rhythmId)
      .map((d) => d.rhythmId!),
  );
  return items.filter((d) => {
    if (d.kind === "rhythm" && linkedRhythmIds.has(d.id)) return false;
    return true;
  });
}

export type FilterDeliverablesOptions = {
  now?: Date;
  /** Shared Daily Context — when omitted, built from live stores. */
  dailyContext?: DailyContext;
  activeFocusSession?: boolean;
};

function applyDailyContextOptionalFilter(
  items: Deliverable[],
  ctx: DailyContext,
): Deliverable[] {
  // Critical always survives.
  const critical = items.filter((d) => d.priority === "critical");
  let rest = items.filter((d) => d.priority !== "critical");

  if (
    ctx.quietHoursActive ||
    ctx.activeFocusSession ||
    ctx.interruptibility === "do_not_disturb"
  ) {
    return critical;
  }

  if (
    ctx.dayCondition === "quiet" ||
    ctx.dayCondition === "low_energy" ||
    ctx.dayCondition === "overwhelmed" ||
    ctx.energy === "low"
  ) {
    rest = rest.filter(
      (d) => d.priority === "important",
    );
  } else if (ctx.dayCondition === "focus" || ctx.focusLevel === "deep") {
    rest = rest.filter((d) => d.priority !== "optional");
  }

  if (ctx.loads.optionalPromptPressure === "high") {
    rest = rest.filter((d) => d.priority === "important");
  }

  return [...critical, ...rest];
}

/**
 * Optional prompts (companion, Discovery Key, future suggestions) respect
 * Daily Context. Critical reminders are never gated by this helper.
 */
export function shouldDeliverOptionalPrompt(
  kind: OptionalPromptKind,
  dailyContext?: DailyContext,
  input?: { activeFocusSession?: boolean; now?: Date },
): boolean {
  const ctx =
    dailyContext ??
    buildDailyContext({
      now: input?.now,
      activeFocusSession: input?.activeFocusSession,
    });

  if (ctx.optionalPromptAllowance === false) return false;
  if (ctx.quietHoursActive) return false;
  if (ctx.activeFocusSession) return false;
  if (ctx.interruptibility === "do_not_disturb") return false;
  if (ctx.dayCondition === "quiet") return false;
  if (ctx.dayCondition === "overwhelmed") return false;
  if (ctx.energy === "low" || ctx.dayCondition === "low_energy") return false;
  if (ctx.loads.optionalPromptPressure === "high") return false;

  if (kind === "discovery_key") {
    if (ctx.dayCondition === "focus") return false;
    if (ctx.companionAvailability === "deferred") return false;
  }

  if (kind === "companion_prompt") {
    if (ctx.companionAvailability === "deferred") return false;
    if (ctx.companionAvailability === "light") {
      // Light availability still allows sparse companion prompts — caller
      // should reduce frequency; we allow the channel.
      return true;
    }
  }

  return true;
}

/**
 * Filter and order due items according to quiet hours, caps, Daily Context,
 * and links. Callers should pass reminders that are already "ready to fire"
 * when preserving legacy reminder recurrence semantics.
 */
export function filterDeliverables(
  rhythms: MemberRhythm[],
  reminders: Reminder[],
  nowOrOptions: Date | FilterDeliverablesOptions = new Date(),
): Deliverable[] {
  const options: FilterDeliverablesOptions =
    nowOrOptions instanceof Date ? { now: nowOrOptions } : nowOrOptions;
  const now = options.now ?? new Date();
  const prefs = getRhythmPrefs();
  const inQuiet = isInQuietHours(now, prefs);
  const nowMs = now.getTime();

  const ctx =
    options.dailyContext ??
    buildDailyContext({
      now,
      activeFocusSession: options.activeFocusSession,
      quietHoursActive: inQuiet,
      dayCondition: prefs.dayCondition ?? null,
    });

  const fromRhythms: Deliverable[] = rhythms
    .filter((r) => r.status === "active" && r.nextDueAt)
    .filter((r) => new Date(r.nextDueAt!).getTime() <= nowMs)
    .filter((r) => isWithinFlexibleWindow(r, now))
    .filter((r) => {
      if (!r.lastPromptedAt) return true;
      return nowMs - new Date(r.lastPromptedAt).getTime() >= PROMPT_COOLDOWN_MS;
    })
    .filter((r) => {
      if (!inQuiet && !ctx.quietHoursActive) return true;
      if (r.quietHoursBehavior === "allow_critical" && r.priority === "critical") {
        return true;
      }
      return r.priority === "critical";
    })
    .map((r) => ({
      kind: "rhythm" as const,
      id: r.id,
      title: r.title,
      body: r.details || r.customNote || "A gentle check-in is ready when you are.",
      priority: r.priority,
      dueAt: r.nextDueAt,
      rhythmId: r.id,
      reminderId: r.linkedReminderId,
      destinationId: r.destinationId,
    }));

  const fromReminders: Deliverable[] = reminders
    .filter((r) => r.status === "active")
    .filter((r) => !r.snoozedUntil || new Date(r.snoozedUntil).getTime() <= nowMs)
    .filter((r) => r.scheduledAt && new Date(r.scheduledAt).getTime() <= nowMs)
    .filter((r) => {
      if (!r.lastFiredAt) return true;
      return nowMs - new Date(r.lastFiredAt).getTime() >= PROMPT_COOLDOWN_MS;
    })
    .map((r) => ({
      kind: "reminder" as const,
      id: r.id,
      title: r.title,
      body: r.message,
      priority: reminderPriority(r),
      dueAt: r.scheduledAt,
      reminderId: r.id,
      rhythmId: r.linkedRhythmId,
    }));

  let all = dedupeLinkedDeliverables([...fromRhythms, ...fromReminders]).sort(
    (a, b) => {
      const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (pr !== 0) return pr;
      const aT = a.dueAt ? new Date(a.dueAt).getTime() : 0;
      const bT = b.dueAt ? new Date(b.dueAt).getTime() : 0;
      return aT - bT;
    },
  );

  // Quiet hours: critical only (reminders + rhythms).
  if (inQuiet || ctx.quietHoursActive) {
    all = all.filter((d) => d.priority === "critical");
  } else {
    all = applyDailyContextOptionalFilter(all, ctx);
  }

  // Legacy prefs still apply as member-facing notification level.
  if (prefs.notificationLevel === "quiet") {
    all = all.filter((d) => d.priority === "critical");
  } else if (prefs.notificationLevel === "gentle") {
    all = all.filter((d) => d.priority !== "optional");
  }

  const cap = prefs.dailyFrequencyCap;
  if (cap !== "none") {
    const used = prefs.promptedCountToday ?? 0;
    if (cap === "critical_only") {
      all = all.filter((d) => d.priority === "critical");
    } else {
      const remaining = Math.max(0, Number(cap) - used);
      const critical = all.filter((d) => d.priority === "critical");
      const rest = all
        .filter((d) => d.priority !== "critical")
        .slice(0, remaining);
      all = [...critical, ...rest];
    }
  }

  const hasImportant = all.some(
    (d) => d.priority === "critical" || d.priority === "important",
  );
  if (hasImportant) {
    all = all.filter((d) => d.priority !== "optional");
  }

  // Stable priority: critical reminders first among critical.
  all = all.sort((a, b) => {
    const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pr !== 0) return pr;
    if (a.kind === "reminder" && b.kind !== "reminder") return -1;
    if (b.kind === "reminder" && a.kind !== "reminder") return 1;
    const aT = a.dueAt ? new Date(a.dueAt).getTime() : 0;
    const bT = b.dueAt ? new Date(b.dueAt).getTime() : 0;
    return aT - bT;
  });

  return all;
}

export function recordDelivery(deliverable: Deliverable): void {
  if (deliverable.priority !== "critical") {
    incrementPromptedCount();
  }
}

/** Occurrence-scoped key so snooze can re-fire in the same session. */
export function deliverableOccurrenceKey(d: Deliverable): string {
  return `${d.kind}:${d.id}:${d.dueAt ?? ""}`;
}

/** Phase 3 contract — Load Manager never permanently mutates schedules. */
export const LOAD_MANAGER_MAY_CHANGE_SCHEDULES = false as const;
