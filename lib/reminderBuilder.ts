/**
 * P0.49 — Structured Reminder Builder™ (no free-form time parsing).
 */

import type { Reminder, ReminderNotificationChannel } from "./reminderStore";

export const REMINDER_BUILDER_FREQUENCIES = [
  "once",
  "daily",
  "weekdays",
  "weekly",
  "monthly",
  "custom",
] as const;

export type ReminderBuilderFrequency = (typeof REMINDER_BUILDER_FREQUENCIES)[number];

export const BUILDER_DAY_ORDER = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type BuilderDayId = (typeof BUILDER_DAY_ORDER)[number];

export const BUILDER_DAY_LABELS: Record<BuilderDayId, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const JS_DAY_TO_ID: BuilderDayId[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export type ReminderBuilderFormState = {
  editId?: string;
  name: string;
  frequency: ReminderBuilderFrequency | "";
  times: string[];
  onceDate: string;
  weeklyDays: BuilderDayId[];
  customDays: BuilderDayId[];
  monthDay: number;
  customEndDate: string;
  channel: ReminderNotificationChannel;
};

export type ReminderBuilderValidation = {
  valid: boolean;
  issues: string[];
  title: string;
  times: string[];
  frequency: ReminderBuilderFrequency | null;
};

export function emptyReminderBuilderForm(): ReminderBuilderFormState {
  return {
    name: "",
    frequency: "",
    times: ["09:00"],
    onceDate: "",
    weeklyDays: [],
    customDays: [],
    monthDay: 1,
    customEndDate: "",
    channel: "both",
  };
}

export function formatTime12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h % 12 || 12;
  return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
}

function normalizedTimes(times: string[]): string[] {
  return [...new Set(times.filter((t) => /^\d{2}:\d{2}$/.test(t)))].sort();
}

export function validateReminderBuilderForm(
  form: ReminderBuilderFormState,
): ReminderBuilderValidation {
  const issues: string[] = [];
  const title = form.name.trim();

  if (!title) {
    issues.push("Enter a reminder name");
  }

  if (!form.frequency) {
    issues.push("Select a frequency");
  }

  const times = normalizedTimes(form.times);
  if (form.frequency && times.length === 0) {
    issues.push("Add at least one reminder time");
  }

  if (form.frequency === "once") {
    if (!form.onceDate) {
      issues.push("Select a date");
    }
    if (times.length > 1) {
      issues.push("Once reminders support one time only");
    }
  }

  if (form.frequency === "weekly" && form.weeklyDays.length === 0) {
    issues.push("Select at least one day of the week");
  }

  if (form.frequency === "monthly") {
    if (form.monthDay < 1 || form.monthDay > 31) {
      issues.push("Select a day of the month");
    }
  }

  if (form.frequency === "custom" && form.customDays.length === 0) {
    issues.push("Select at least one day");
  }

  return {
    valid: issues.length === 0,
    issues,
    title: title || "Reminder",
    times,
    frequency: form.frequency || null,
  };
}

function encodeDays(days: BuilderDayId[]): string {
  return [...days].sort().join(",");
}

function decodeDays(raw: string): BuilderDayId[] {
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d): d is BuilderDayId =>
      BUILDER_DAY_ORDER.includes(d as BuilderDayId),
    );
}

export function buildRecurrenceRule(
  frequency: ReminderBuilderFrequency,
  times: string[],
  opts: {
    weeklyDays?: BuilderDayId[];
    customDays?: BuilderDayId[];
    monthDay?: number;
    customEndDate?: string;
  },
): string {
  const joined = times.join(",");
  switch (frequency) {
    case "daily":
      return `daily-multi@${joined}`;
    case "weekdays":
      return `weekdays-multi@${joined}`;
    case "weekly":
      return `weekly-days@${encodeDays(opts.weeklyDays ?? [])}@${joined}`;
    case "monthly":
      return `monthly@${opts.monthDay ?? 1}@${joined}`;
    case "custom": {
      const base = `custom-days@${encodeDays(opts.customDays ?? [])}@${joined}`;
      return opts.customEndDate ? `${base}@end:${opts.customEndDate}` : base;
    }
    default:
      return `daily-multi@${joined}`;
  }
}

export function parseRecurrenceRule(rule: string): {
  frequency: ReminderBuilderFrequency;
  times: string[];
  weeklyDays?: BuilderDayId[];
  customDays?: BuilderDayId[];
  monthDay?: number;
  customEndDate?: string;
} | null {
  if (rule.startsWith("daily-multi@")) {
    return {
      frequency: "daily",
      times: rule.replace("daily-multi@", "").split(",").filter(Boolean),
    };
  }
  if (rule.startsWith("weekdays-multi@")) {
    return {
      frequency: "weekdays",
      times: rule.replace("weekdays-multi@", "").split(",").filter(Boolean),
    };
  }
  const weekly = rule.match(/^weekly-days@([^@]+)@(.+)$/);
  if (weekly) {
    return {
      frequency: "weekly",
      weeklyDays: decodeDays(weekly[1]!),
      times: weekly[2]!.split(",").filter(Boolean),
    };
  }
  const monthly = rule.match(/^monthly@(\d{1,2})@(.+)$/);
  if (monthly) {
    return {
      frequency: "monthly",
      monthDay: Number(monthly[1]),
      times: monthly[2]!.split(",").filter(Boolean),
    };
  }
  const custom = rule.match(/^custom-days@([^@]+)@([^@]+)(?:@end:(.+))?$/);
  if (custom) {
    return {
      frequency: "custom",
      customDays: decodeDays(custom[1]!),
      times: custom[2]!.split(",").filter(Boolean),
      customEndDate: custom[3] ?? "",
    };
  }
  return null;
}

export function builderFormFromReminder(reminder: Reminder): ReminderBuilderFormState {
  const base = emptyReminderBuilderForm();
  base.editId = reminder.id;
  base.name = reminder.title;
  base.channel = reminder.notificationChannel ?? "both";

  if (reminder.reminderType === "one_time" && reminder.scheduledAt) {
    const d = new Date(reminder.scheduledAt);
    base.frequency = "once";
    base.onceDate = d.toISOString().slice(0, 10);
    base.times = [
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    ];
    return base;
  }

  if (reminder.recurrenceRule) {
    const parsed = parseRecurrenceRule(reminder.recurrenceRule);
    if (parsed) {
      base.frequency = parsed.frequency;
      base.times = parsed.times.length ? parsed.times : ["09:00"];
      base.weeklyDays = parsed.weeklyDays ?? [];
      base.customDays = parsed.customDays ?? [];
      base.monthDay = parsed.monthDay ?? 1;
      base.customEndDate = parsed.customEndDate ?? "";
      return base;
    }
  }

  base.frequency = "daily";
  base.times = reminder.dailyTimes?.length ? reminder.dailyTimes : ["09:00"];
  return base;
}

function isWeekdayDate(d: Date): boolean {
  const dow = d.getDay();
  return dow !== 0 && dow !== 6;
}

function nextMultiDailyFire(
  dailyTimes: string[],
  from = new Date(),
): string | null {
  if (!dailyTimes.length) return null;
  const now = from.getTime();
  const candidates: number[] = [];
  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    for (const hhmm of dailyTimes) {
      const [h, m] = hhmm.split(":").map(Number);
      const d = new Date(from);
      d.setDate(d.getDate() + dayOffset);
      d.setHours(h!, m!, 0, 0);
      if (d.getTime() > now) candidates.push(d.getTime());
    }
  }
  if (!candidates.length) return null;
  return new Date(Math.min(...candidates)).toISOString();
}

function nextWeekdaysMultiFire(
  dailyTimes: string[],
  from = new Date(),
): string | null {
  if (!dailyTimes.length) return null;
  const now = from.getTime();
  const candidates: number[] = [];
  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const d = new Date(from);
    d.setDate(d.getDate() + dayOffset);
    if (!isWeekdayDate(d)) continue;
    for (const hhmm of dailyTimes) {
      const [h, m] = hhmm.split(":").map(Number);
      const slot = new Date(d);
      slot.setHours(h!, m!, 0, 0);
      if (slot.getTime() > now) candidates.push(slot.getTime());
    }
  }
  if (!candidates.length) return null;
  return new Date(Math.min(...candidates)).toISOString();
}

function advanceWeekdaysMultiFire(
  dailyTimes: string[],
  from: Date,
): string | null {
  const current = `${String(from.getHours()).padStart(2, "0")}:${String(from.getMinutes()).padStart(2, "0")}`;
  const idx = dailyTimes.indexOf(current);
  if (idx >= 0 && idx < dailyTimes.length - 1) {
    const [h, m] = dailyTimes[idx + 1]!.split(":").map(Number);
    const d = new Date(from);
    d.setHours(h!, m!, 0, 0);
    return d.toISOString();
  }
  const [h, m] = dailyTimes[0]!.split(":").map(Number);
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  d.setHours(h!, m!, 0, 0);
  while (!isWeekdayDate(d)) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString();
}

function nextSelectedDaysFire(
  days: BuilderDayId[],
  times: string[],
  from = new Date(),
  endDate?: string,
): string | null {
  if (!days.length || !times.length) return null;
  const daySet = new Set(days);
  const endMs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;
  const now = from.getTime();
  const candidates: number[] = [];

  for (let offset = 0; offset <= 366; offset++) {
    const d = new Date(from);
    d.setDate(d.getDate() + offset);
    if (endMs && d.getTime() > endMs) break;
    const dayId = JS_DAY_TO_ID[d.getDay()]!;
    if (!daySet.has(dayId)) continue;
    for (const hhmm of times) {
      const [h, m] = hhmm.split(":").map(Number);
      const slot = new Date(d);
      slot.setHours(h!, m!, 0, 0);
      if (slot.getTime() > now) candidates.push(slot.getTime());
    }
    if (candidates.length) break;
  }
  if (!candidates.length) return null;
  return new Date(Math.min(...candidates)).toISOString();
}

function nextMonthlyFire(
  dayOfMonth: number,
  times: string[],
  from = new Date(),
): string | null {
  if (!times.length) return null;
  const now = from.getTime();
  const candidates: number[] = [];
  for (let monthOffset = 0; monthOffset <= 14; monthOffset++) {
    const d = new Date(from.getFullYear(), from.getMonth() + monthOffset, dayOfMonth);
    if (d.getDate() !== dayOfMonth) continue;
    for (const hhmm of times) {
      const [h, m] = hhmm.split(":").map(Number);
      const slot = new Date(d);
      slot.setHours(h!, m!, 0, 0);
      if (slot.getTime() > now) candidates.push(slot.getTime());
    }
    if (candidates.length) break;
  }
  if (!candidates.length) return null;
  return new Date(Math.min(...candidates)).toISOString();
}

export function initialScheduledAt(
  frequency: ReminderBuilderFrequency,
  times: string[],
  opts: {
    onceDate?: string;
    weeklyDays?: BuilderDayId[];
    customDays?: BuilderDayId[];
    monthDay?: number;
    customEndDate?: string;
  },
): string | undefined {
  switch (frequency) {
    case "once": {
      if (!opts.onceDate || !times[0]) return undefined;
      const [h, m] = times[0]!.split(":").map(Number);
      const d = new Date(`${opts.onceDate}T00:00:00`);
      d.setHours(h!, m!, 0, 0);
      return d.toISOString();
    }
    case "daily":
      return nextMultiDailyFire(times) ?? undefined;
    case "weekdays":
      return nextWeekdaysMultiFire(times) ?? undefined;
    case "weekly":
      return (
        nextSelectedDaysFire(opts.weeklyDays ?? [], times) ?? undefined
      );
    case "monthly":
      return nextMonthlyFire(opts.monthDay ?? 1, times) ?? undefined;
    case "custom":
      return (
        nextSelectedDaysFire(
          opts.customDays ?? [],
          times,
          new Date(),
          opts.customEndDate || undefined,
        ) ?? undefined
      );
    default:
      return undefined;
  }
}

export function buildReminderFromBuilderForm(
  form: ReminderBuilderFormState,
): Omit<Reminder, "id" | "createdAt" | "status"> | null {
  const validation = validateReminderBuilderForm(form);
  if (!validation.valid || !validation.frequency) return null;

  const { title, times, frequency } = validation;
  const channel = form.channel;

  if (frequency === "once") {
    const scheduledAt = initialScheduledAt("once", times, {
      onceDate: form.onceDate,
    });
    if (!scheduledAt) return null;
    return {
      title,
      message: title,
      reminderType: "one_time",
      scheduledAt,
      notificationChannel: channel,
      source: "chat",
    };
  }

  const recurrenceRule = buildRecurrenceRule(frequency, times, {
    weeklyDays: form.weeklyDays,
    customDays: form.customDays,
    monthDay: form.monthDay,
    customEndDate: form.customEndDate || undefined,
  });

  return {
    title,
    message: title,
    reminderType: "recurring",
    recurrenceRule,
    dailyTimes: times,
    scheduledAt: initialScheduledAt(frequency, times, {
      weeklyDays: form.weeklyDays,
      customDays: form.customDays,
      monthDay: form.monthDay,
      customEndDate: form.customEndDate || undefined,
    }),
    notificationChannel: channel,
    source: "chat",
  };
}

export function frequencyLabel(frequency: ReminderBuilderFrequency): string {
  switch (frequency) {
    case "once":
      return "Once";
    case "daily":
      return "Daily";
    case "weekdays":
      return "Monday–Friday";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "custom":
      return "Custom";
    default:
      return frequency;
  }
}

export function formatReminderScheduleSummary(reminder: Reminder): string {
  if (reminder.reminderType === "one_time" && reminder.scheduledAt) {
    const d = new Date(reminder.scheduledAt);
    return d.toLocaleString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const parsed = reminder.recurrenceRule
    ? parseRecurrenceRule(reminder.recurrenceRule)
    : null;
  if (!parsed) return formatWhenLegacy(reminder);

  const times = (parsed.times ?? reminder.dailyTimes ?? [])
    .map((t) => formatTime12(t))
    .join("\n");

  switch (parsed.frequency) {
    case "daily":
      return `Daily\n${times}`;
    case "weekdays":
      return `Monday–Friday\n${times}`;
    case "weekly": {
      const days = (parsed.weeklyDays ?? [])
        .map((d) => BUILDER_DAY_LABELS[d])
        .join(", ");
      return `${days}\n${times}`;
    }
    case "monthly":
      return `${parsed.monthDay}${ordinal(parsed.monthDay ?? 1)} of each month\n${times}`;
    case "custom": {
      const days = (parsed.customDays ?? [])
        .map((d) => BUILDER_DAY_LABELS[d])
        .join(", ");
      const end = parsed.customEndDate
        ? `\nUntil ${parsed.customEndDate}`
        : "";
      return `${days}${end}\n${times}`;
    }
    default:
      return times;
  }
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return "th";
  const digit = n % 10;
  if (digit === 1) return "st";
  if (digit === 2) return "nd";
  if (digit === 3) return "rd";
  return "th";
}

export function formatBuilderSaveConfirmation(reminder: Reminder): string {
  const schedule = formatReminderScheduleSummary(reminder);
  return `Done — reminder created.\n${reminder.title}\n${schedule}`;
}

export function formatReminderWhenLine(reminder: Reminder): string {
  if (reminder.paused) return "Paused";

  if (reminder.reminderType === "one_time" && reminder.scheduledAt) {
    return new Date(reminder.scheduledAt).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const parsed = reminder.recurrenceRule
    ? parseRecurrenceRule(reminder.recurrenceRule)
    : null;
  const times = (parsed?.times ?? reminder.dailyTimes ?? [])
    .map((t) => formatTime12(t))
    .join(" · ");

  if (parsed?.frequency === "weekdays") return `Weekdays · ${times}`;
  if (parsed?.frequency === "daily") return `Daily · ${times}`;
  if (parsed?.frequency === "weekly") {
    const days = (parsed.weeklyDays ?? [])
      .map((d) => BUILDER_DAY_LABELS[d].slice(0, 3))
      .join(", ");
    return `${days} · ${times}`;
  }
  if (parsed?.frequency === "monthly") {
    return `Monthly (${parsed.monthDay}${ordinal(parsed.monthDay ?? 1)}) · ${times}`;
  }
  if (parsed?.frequency === "custom") {
    const days = (parsed.customDays ?? [])
      .map((d) => BUILDER_DAY_LABELS[d].slice(0, 3))
      .join(", ");
    return `${days} · ${times}`;
  }

  return formatWhenLegacy(reminder);
}

function relativeDayLabel(date: Date, now = new Date()): string {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(date);
  startOfTarget.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function reminderTimes(reminder: Reminder): string[] {
  const parsed = reminder.recurrenceRule
    ? parseRecurrenceRule(reminder.recurrenceRule)
    : null;
  return parsed?.times ?? reminder.dailyTimes ?? [];
}

function timesPerDayLabel(count: number): string {
  if (count === 1) return "1 time/day";
  return `${count} times/day`;
}

export function formatReminderCollapsedSubtitle(reminder: Reminder): string {
  if (reminder.paused) return "Paused";

  if (reminder.reminderType === "one_time" && reminder.scheduledAt) {
    const d = new Date(reminder.scheduledAt);
    const day = relativeDayLabel(d);
    const time = formatTime12(
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    );
    return `${day} • ${time}`;
  }

  const parsed = reminder.recurrenceRule
    ? parseRecurrenceRule(reminder.recurrenceRule)
    : null;
  const times = reminderTimes(reminder);
  const countLabel = timesPerDayLabel(times.length || 1);

  if (parsed?.frequency === "weekdays") return `Weekdays • ${countLabel}`;
  if (parsed?.frequency === "daily") return `Daily • ${countLabel}`;
  if (parsed?.frequency === "weekly") return `Weekly • ${countLabel}`;
  if (parsed?.frequency === "monthly") return `Monthly • ${countLabel}`;
  if (parsed?.frequency === "custom") return `Custom • ${countLabel}`;

  if (reminder.recurrenceRule?.startsWith("weekdays-multi@")) {
    return `Weekdays • ${countLabel}`;
  }
  if (reminder.recurrenceRule?.startsWith("daily-multi@")) {
    return `Daily • ${countLabel}`;
  }

  return countLabel;
}

export function formatReminderExpandedScheduleLabel(reminder: Reminder): string {
  if (reminder.reminderType === "one_time" && reminder.scheduledAt) {
    return relativeDayLabel(new Date(reminder.scheduledAt));
  }

  const parsed = reminder.recurrenceRule
    ? parseRecurrenceRule(reminder.recurrenceRule)
    : null;
  if (!parsed) return formatWhenLegacy(reminder).split(" · ")[0] ?? "Scheduled";

  switch (parsed.frequency) {
    case "daily":
      return "Daily";
    case "weekdays":
      return "Weekdays";
    case "weekly": {
      const days = (parsed.weeklyDays ?? [])
        .map((d) => BUILDER_DAY_LABELS[d])
        .join(", ");
      return days || "Weekly";
    }
    case "monthly":
      return `${parsed.monthDay}${ordinal(parsed.monthDay ?? 1)} of each month`;
    case "custom": {
      const days = (parsed.customDays ?? [])
        .map((d) => BUILDER_DAY_LABELS[d])
        .join(", ");
      const end = parsed.customEndDate
        ? ` · Until ${parsed.customEndDate}`
        : "";
      return `${days}${end}` || "Custom";
    }
    default:
      return "Scheduled";
  }
}

export function getReminderExpandedTimes(reminder: Reminder): string[] {
  if (reminder.reminderType === "one_time" && reminder.scheduledAt) {
    const d = new Date(reminder.scheduledAt);
    return [
      formatTime12(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      ),
    ];
  }
  return reminderTimes(reminder).map((t) => formatTime12(t));
}

export function formatReminderNotificationLabel(
  channel?: ReminderNotificationChannel,
): string {
  switch (channel) {
    case "desktop":
      return "Desktop notification";
    case "sound":
      return "Sound";
    case "both":
      return "Desktop + Sound";
    default:
      return "Desktop + Sound";
  }
}

export function formatReminderCreatedDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const REMINDER_SAVED_TOAST = "✓ Reminder saved.";

function formatWhenLegacy(reminder: Reminder): string {
  if (reminder.recurrenceRule?.startsWith("daily-multi@") && reminder.dailyTimes?.length) {
    return `Daily · ${reminder.dailyTimes.map((t) => formatTime12(t)).join(" · ")}`;
  }
  if (reminder.recurrenceRule?.startsWith("weekdays-multi@") && reminder.dailyTimes?.length) {
    return `Weekdays · ${reminder.dailyTimes.map((t) => formatTime12(t)).join(" · ")}`;
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
  return reminder.recurrenceRule ?? "Scheduled";
}

export function isBuilderRecurringRule(rule?: string): boolean {
  if (!rule) return false;
  return (
    rule.startsWith("daily-multi@") ||
    rule.startsWith("weekdays-multi@") ||
    rule.startsWith("weekly-days@") ||
    rule.startsWith("monthly@") ||
    rule.startsWith("custom-days@")
  );
}

export function advanceBuilderRecurrenceFire(
  rule: string,
  from: Date,
): string | null {
  if (rule.startsWith("daily-multi@")) {
    const times = rule.replace("daily-multi@", "").split(",").filter(Boolean);
    return advanceMultiDailyFire(times, from);
  }
  if (rule.startsWith("weekdays-multi@")) {
    const times = rule.replace("weekdays-multi@", "").split(",").filter(Boolean);
    return advanceWeekdaysMultiFire(times, from);
  }
  const parsed = parseRecurrenceRule(rule);
  if (!parsed) return null;
  if (parsed.frequency === "weekly") {
    return nextSelectedDaysFire(parsed.weeklyDays ?? [], parsed.times, from);
  }
  if (parsed.frequency === "monthly") {
    return nextMonthlyFire(parsed.monthDay ?? 1, parsed.times, from);
  }
  if (parsed.frequency === "custom") {
    return nextSelectedDaysFire(
      parsed.customDays ?? [],
      parsed.times,
      from,
      parsed.customEndDate || undefined,
    );
  }
  return null;
}

function advanceMultiDailyFire(times: string[], from: Date): string | null {
  const current = `${String(from.getHours()).padStart(2, "0")}:${String(from.getMinutes()).padStart(2, "0")}`;
  const idx = times.indexOf(current);
  if (idx >= 0 && idx < times.length - 1) {
    const [h, m] = times[idx + 1]!.split(":").map(Number);
    const d = new Date(from);
    d.setHours(h!, m!, 0, 0);
    return d.toISOString();
  }
  const [h, m] = times[0]!.split(":").map(Number);
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  d.setHours(h!, m!, 0, 0);
  return d.toISOString();
}
