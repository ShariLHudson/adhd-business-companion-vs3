/**
 * Member-facing reminder form helpers — maps UI fields onto reminderStore.
 * Does not invent a new recurrence engine; only uses store-compatible rules.
 */

import type { Reminder, ReminderType } from "@/lib/reminderStore";

export type ReminderRepeatOption =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export const REMINDER_REPEAT_OPTIONS: {
  id: ReminderRepeatOption;
  label: string;
}[] = [
  { id: "none", label: "Does not repeat" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "custom", label: "Custom" },
];

export const REMINDERS_HOW_DO_I_COPY =
  "A Reminder remembers a specific thing — usually one moment or task. Add what you don’t want to forget; a date and time are optional.";

export type ReminderFormValues = {
  title: string;
  date: string;
  time: string;
  repeat: ReminderRepeatOption;
  notes: string;
  /** Free-text for Custom repeat (plain wording). */
  customRepeatNote: string;
};

export const EMPTY_REMINDER_FORM: ReminderFormValues = {
  title: "",
  date: "",
  time: "",
  repeat: "none",
  notes: "",
  customRepeatNote: "",
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** HH:mm from optional time field, default 09:00. */
export function resolveReminderClock(time: string): { hour: number; minute: number } {
  const trimmed = time.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    const [h, m] = trimmed.split(":").map(Number);
    return { hour: h ?? 9, minute: m ?? 0 };
  }
  return { hour: 9, minute: 0 };
}

export function buildScheduledAt(date: string, time: string): string | undefined {
  const d = date.trim();
  if (!d) return undefined;
  const { hour, minute } = resolveReminderClock(time);
  const iso = new Date(`${d}T${pad2(hour)}:${pad2(minute)}:00`);
  if (Number.isNaN(iso.getTime())) return undefined;
  return iso.toISOString();
}

function weekdayNameFromDate(date: string): string {
  if (!date.trim()) return "monday";
  const d = new Date(`${date.trim()}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "monday";
  return [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][d.getDay()]!;
}

/**
 * Map UI repeat → store recurrenceRule.
 * Engine advances: hourly, daily@, weekdays@, weekly@, monthly@, yearly@, custom@.
 */
export function buildRecurrenceRule(
  repeat: ReminderRepeatOption,
  date: string,
  time: string,
  customNote: string,
): string | undefined {
  if (repeat === "none") return undefined;
  const { hour, minute } = resolveReminderClock(time);
  const hhmm = `${pad2(hour)}:${pad2(minute)}`;
  switch (repeat) {
    case "daily":
      return `daily@${hhmm}`;
    case "weekly":
      return `weekly@${weekdayNameFromDate(date)}@${hhmm}`;
    case "monthly": {
      const day = date.trim()
        ? pad2(new Date(`${date.trim()}T12:00:00`).getDate())
        : "1";
      return `monthly@${day}@${hhmm}`;
    }
    case "yearly": {
      if (date.trim()) {
        const d = new Date(`${date.trim()}T12:00:00`);
        return `yearly@${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}@${hhmm}`;
      }
      return `yearly@01-01@${hhmm}`;
    }
    case "custom": {
      const note = customNote.trim() || "custom";
      return `custom@${note.slice(0, 80)}`;
    }
    default:
      return undefined;
  }
}

export function repeatOptionFromReminder(reminder: Reminder): ReminderRepeatOption {
  const rule = reminder.recurrenceRule ?? "";
  if (!rule || reminder.reminderType !== "recurring") return "none";
  if (rule.startsWith("daily@")) return "daily";
  if (rule.startsWith("weekly@") || rule.startsWith("weekdays@")) return "weekly";
  if (rule.startsWith("monthly@")) return "monthly";
  if (rule.startsWith("yearly@")) return "yearly";
  if (rule.startsWith("custom@") || rule === "hourly") return "custom";
  return "custom";
}

export function formValuesFromReminder(reminder: Reminder): ReminderFormValues {
  let date = "";
  let time = "";
  if (reminder.scheduledAt) {
    const d = new Date(reminder.scheduledAt);
    if (!Number.isNaN(d.getTime())) {
      date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    }
  }
  const repeat = repeatOptionFromReminder(reminder);
  const customNote =
    reminder.recurrenceRule?.startsWith("custom@")
      ? reminder.recurrenceRule.slice("custom@".length)
      : "";
  return {
    title: reminder.title,
    date,
    time,
    repeat,
    notes: reminder.message === reminder.title ? "" : reminder.message,
    customRepeatNote: customNote,
  };
}

export function reminderPayloadFromForm(values: ReminderFormValues): {
  title: string;
  message: string;
  reminderType: ReminderType;
  scheduledAt?: string;
  recurrenceRule?: string;
  source: "chat";
} {
  const title = values.title.trim();
  const notes = values.notes.trim();
  const recurrenceRule = buildRecurrenceRule(
    values.repeat,
    values.date,
    values.time,
    values.customRepeatNote,
  );
  const reminderType: ReminderType = recurrenceRule ? "recurring" : "one_time";
  let scheduledAt = buildScheduledAt(values.date, values.time);
  if (reminderType === "recurring" && !scheduledAt) {
    const { hour, minute } = resolveReminderClock(values.time);
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= Date.now()) {
      next.setDate(next.getDate() + 1);
    }
    scheduledAt = next.toISOString();
  }
  return {
    title,
    message: notes || title,
    reminderType,
    scheduledAt,
    recurrenceRule,
    source: "chat",
  };
}

export function formatReminderWhen(reminder: Reminder): string {
  if (reminder.recurrenceRule) {
    const rule = reminder.recurrenceRule;
    if (rule === "hourly") return "Every hour";
    if (rule.startsWith("daily@")) return "Every day";
    if (rule.startsWith("weekdays@")) return "Weekdays";
    if (rule.startsWith("weekly@")) {
      const day = rule.split("@")[1];
      return day ? `Every ${day}` : "Weekly";
    }
    if (rule.startsWith("monthly@")) return "Monthly";
    if (rule.startsWith("yearly@")) return "Yearly";
    if (rule.startsWith("custom@")) {
      return rule.slice("custom@".length) || "Custom";
    }
    return rule;
  }
  if (reminder.scheduledAt) {
    return new Date(reminder.scheduledAt).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return "No date set";
}

export function partitionReminders(reminders: Reminder[]): {
  upcoming: Reminder[];
  recurring: Reminder[];
  completed: Reminder[];
} {
  const active = reminders.filter((r) => r.status === "active");
  return {
    upcoming: active.filter((r) => r.reminderType !== "recurring"),
    recurring: active.filter((r) => r.reminderType === "recurring"),
    completed: reminders.filter((r) => r.status === "completed"),
  };
}

export function reminderSaveSuccessMessage(reminder: Reminder): string {
  if (reminder.reminderType === "recurring") {
    return "Saved under Recurring.";
  }
  return "Saved under Upcoming.";
}

export const REMINDER_SAVE_FAILURE_MESSAGE =
  "We couldn’t save that reminder. Your information is still here—please try again.";
