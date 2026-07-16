/**
 * P0.24 — Fire due reminders and reschedule recurring ones.
 */

import { getTimeBlocks } from "./companionStore";
import {
  nextRecurrenceFire,
  remindersReadyToFire,
} from "./reminderIntelligence";
import {
  getActiveReminders,
  updateReminder,
  type Reminder,
} from "./reminderStore";

export type ReminderAlert = {
  reminder: Reminder;
  title: string;
  body: string;
};

export function collectDueReminderAlerts(now = Date.now()): ReminderAlert[] {
  const blocks = getTimeBlocks();
  const due = remindersReadyToFire(getActiveReminders(), blocks, now);
  return due.map((reminder) => ({
    reminder,
    title: reminder.title,
    body: reminder.message,
  }));
}

export function afterReminderFired(reminder: Reminder, now = Date.now()): void {
  try {
    const firedAt = new Date().toISOString();

    if (reminder.reminderType === "one_time") {
      updateReminder(reminder.id, {
        status: "completed",
        lastFiredAt: firedAt,
      });
      return;
    }

    if (reminder.reminderType === "recurring" && reminder.recurrenceRule) {
      const from = reminder.scheduledAt
        ? new Date(reminder.scheduledAt)
        : new Date(now);
      const next =
        nextRecurrenceFire(reminder.recurrenceRule, from) ??
        (() => {
          /** Never drop recurring solely because advance returned null. */
          const fallback = new Date(now);
          fallback.setDate(fallback.getDate() + 1);
          return fallback.toISOString();
        })();
      updateReminder(reminder.id, {
        scheduledAt: next,
        lastFiredAt: undefined,
        status: "active",
      });
      return;
    }

    if (reminder.reminderType === "event_offset") {
      updateReminder(reminder.id, {
        status: "completed",
        lastFiredAt: firedAt,
      });
    }
  } catch (err) {
    console.warn(
      "[companion] Reminder follow-up skipped — storage may be full.",
      err,
    );
  }
}
