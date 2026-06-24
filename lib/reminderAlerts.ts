/**
 * P0.24 — Fire due reminders and reschedule recurring ones.
 */

import { getTimeBlocks } from "./companionStore";
import {
  nextRecurrenceFire,
  remindersReadyToFire,
} from "./reminderIntelligence";
import {
  completeReminder,
  getActiveReminders,
  markReminderFired,
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
  markReminderFired(reminder.id);

  if (reminder.reminderType === "one_time") {
    completeReminder(reminder.id);
    return;
  }

  if (reminder.reminderType === "recurring" && reminder.recurrenceRule) {
    const next = nextRecurrenceFire(
      reminder.recurrenceRule,
      reminder.scheduledAt ? new Date(reminder.scheduledAt) : new Date(now),
    );
    if (next) {
      updateReminder(reminder.id, {
        scheduledAt: next,
        lastFiredAt: undefined,
      });
    } else {
      completeReminder(reminder.id);
    }
    return;
  }

  if (reminder.reminderType === "event_offset") {
    completeReminder(reminder.id);
  }
}
