/**
 * What can chime in Settings → Notifications.
 * Reminders, Plan My Day rhythms, and time blocks are separate stores —
 * this inventory surfaces all three so empty "reminders" is not misleading.
 */

import {
  getTimeBlocks,
  todayStr,
  type TimeBlock,
} from "@/lib/companionStore";
import { listActiveRhythms, type MemberRhythm } from "@/lib/rhythms/store";
import { RHYTHM_CADENCE_OPTIONS } from "@/lib/rhythms/types";
import {
  getActiveReminders,
  getReminders,
  type Reminder,
} from "@/lib/reminderStore";

export type NotificationInventory = {
  activeRhythms: MemberRhythm[];
  todayTimeBlocks: TimeBlock[];
  upcomingReminders: Reminder[];
  recurringReminders: Reminder[];
  completedReminders: Reminder[];
};

export function cadenceLabel(cadence: string): string {
  return (
    RHYTHM_CADENCE_OPTIONS.find((c) => c.id === cadence)?.label ?? cadence
  );
}

export function formatRhythmWhen(rhythm: MemberRhythm): string {
  const cadence = cadenceLabel(rhythm.schedule?.cadence ?? rhythm.cadence);
  if (rhythm.nextDueAt) {
    const when = new Date(rhythm.nextDueAt).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return `${cadence} · next ${when}`;
  }
  return cadence;
}

export function formatTimeBlockWhen(block: TimeBlock): string {
  const [h, m] = block.startTime.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `Today · ${time}`;
}

/** Pending time blocks scheduled for today (can chime via time-block alerts). */
export function listTodayPendingTimeBlocks(): TimeBlock[] {
  const day = todayStr();
  return getTimeBlocks().filter(
    (b) => b.date === day && b.status === "pending" && Boolean(b.startTime),
  );
}

export function getNotificationInventory(): NotificationInventory {
  const all = getReminders();
  const active = getActiveReminders();
  return {
    activeRhythms: listActiveRhythms(),
    todayTimeBlocks: listTodayPendingTimeBlocks(),
    upcomingReminders: active.filter((r) => r.reminderType !== "recurring"),
    recurringReminders: active.filter((r) => r.reminderType === "recurring"),
    completedReminders: all.filter((r) => r.status === "completed"),
  };
}
