/**
 * P0.24 — ADHD-Friendly Notifications & Reminders
 * Natural-language detection, parsing, and short confirmations.
 */

import type { TimeBlock } from "./companionStore";
import { blockDateTime } from "./companionStore";
import type { Reminder, ReminderNotificationChannel, ReminderType } from "./reminderStore";
import { saveReminder, saveReminders } from "./reminderStore";
import { advanceBuilderRecurrenceFire } from "./reminderBuilder";

export type ReminderDraft = {
  title: string;
  message: string;
  reminderType: ReminderType;
  scheduledAt?: string;
  recurrenceRule?: string;
  eventId?: string;
  eventTitle?: string;
  offsets?: number[];
  dailyTimes?: string[];
  notificationChannel?: ReminderNotificationChannel;
  missing: "name" | "time" | "am_pm" | "event" | "frequency" | null;
  ambiguousHour?: number;
};

export type ReminderTurnOutcome =
  | { kind: "not_reminder" }
  | { kind: "ask"; reply: string; draft: ReminderDraft }
  | { kind: "confirm"; reply: string; reminders: Reminder[] };

/** Guided chat intake steps (P0.57 golden path). */
export type ReminderIntakeStep =
  | "createReminder"
  | "ask_name"
  | "ask_times"
  | "ask_frequency"
  | "complete";

const GENERIC_REMINDER_NAME_RE = /^(?:reminder|a reminder)$/i;

export function isGenericReminderName(title: string): boolean {
  return GENERIC_REMINDER_NAME_RE.test(title.trim());
}

/** Map draft + turn outcome to the current intake step for debugging and UI locks. */
export function getReminderIntakeStep(
  draft: ReminderDraft | null,
  outcome: Pick<ReminderTurnOutcome, "kind"> | ReminderTurnOutcome["kind"],
): ReminderIntakeStep {
  const kind = typeof outcome === "string" ? outcome : outcome.kind;
  if (kind === "confirm") return "complete";
  if (!draft) return "createReminder";
  if (draft.missing === "name" || draft.missing === "event") return "ask_name";
  if (draft.missing === "time" || draft.missing === "am_pm") return "ask_times";
  if (draft.missing === "frequency") return "ask_frequency";
  return "complete";
}

/** True while chat should stay in reminder intake (conversation locked). */
export function isReminderIntakeAwaitingAnswer(
  draft: ReminderDraft | null,
  outcome: ReminderTurnOutcome,
): boolean {
  return outcome.kind === "ask" && getReminderIntakeStep(draft, outcome) !== "complete";
}

const REMINDER_REQUEST_RE =
  /\b(?:(?:need|want|i need|i want)(?:\s+a)?\s+reminder|remind me|set up (?:a )?reminder(?:\s+for(?:\s+me)?)?|create (?:a )?reminder|set (?:a )?reminder|schedule (?:a )?reminder|notify me|alert me|nudge me|check in with me|don'?t let me forget|don'?t forget|recurring reminder|reminder (?:for|to|at))\b/i;

const REMINDER_INTAKE_MESSAGE_RE =
  /\bwhen would you like (?:me to remind you|the reminder)\b/i;

const REMINDER_NAME_ASK_RE =
  /\bwhat should I remind you about\b/i;

const REMINDER_AFFIRMATION_RE =
  /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|please|do that|go ahead|sounds good|that works|perfect|great|do it|every day|daily)\.?$/i;

const REMINDER_SETUP_OFFER_RE =
  /\b(?:help (?:you )?(?:set(?:ting)? up|create|make)(?:\s+a)?\s+reminder|set (?:that|a|the) reminder up)\b/i;

const RECURRENCE_RE =
  /\b(?:every\s+hour|every\s+day|every\s+week|every\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|weekdays?\s+(?:at\s+)?|every\s+friday|every\s+monday)\b/i;

const EVENT_OFFSET_RE =
  /\b(\d+)\s*(minute|minutes|min|hour|hours|hr|hrs|day|days)\s+before\b/i;

const MULTIPLE_OFFSET_RE =
  /\b(\d+)\s*(minute|minutes|min|hours?|hrs?|days?)\s+before\b/gi;

const TIME_AT_RE =
  /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;

const IN_MINUTES_RE = /\bin\s+(\d+)\s+minutes?\b/i;

const RELATIVE_DAY_RE =
  /\b(today|tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i;

const MORNING_EVENING_RE = /\b(tomorrow\s+)?(morning|afternoon|evening)\b/i;

const WEEKDAYS_RE = /\bweekdays?\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;

const EVERY_DAY_AT_RE =
  /\bevery\s+day\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;

const EVERY_HOUR_RE = /\bevery\s+hour\b/i;

const EVERY_WEEKDAY_RE =
  /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(morning|afternoon|evening))?\b/i;

const EVERY_FRIDAY_RE = /\bevery\s+friday(?:\s+(morning|afternoon|evening))?\b/i;

export function isReminderRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (!REMINDER_REQUEST_RE.test(t)) return false;
  if (/\bremind me (?:how|what|why|when|where)\b/i.test(t)) return false;
  return true;
}

function capitalize(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function stripReminderPrefix(text: string): string {
  const trimmed = text.trim();
  if (
    /^(?:please\s+)?(?:(?:set up|create|set|schedule)\s+(?:a\s+)?reminder)\s*$/i.test(
      trimmed,
    )
  ) {
    return "";
  }
  return trimmed
    .replace(
      /^(?:please\s+)?(?:(?:i\s+)?(?:need|want)\s+(?:a\s+)?reminder\s+(?:to|for)\s+|(?:set up|create|set|schedule)\s+(?:a\s+)?reminder(?:\s+for(?:\s+me)?)?\s*(?:to\s+)?(?:for\s+me\s+to\s+)?|remind me|notify me|alert me|nudge me|check in with me|don'?t let me forget|don'?t forget)\s*(?:to\s+)?(?:for\s+me\s+to\s+)?/i,
      "",
    )
    .trim();
}

export function isReminderSetupOfferMessage(assistantText: string): boolean {
  const t = assistantText.trim();
  if (!t) return false;
  if (isReminderIntakeMessage(t)) return true;
  return REMINDER_SETUP_OFFER_RE.test(t);
}

/** Find the most recent user message that started a reminder request. */
export function findRecentReminderUserText(
  messages: { role: string; content: string }[],
): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "user" && isReminderRequest(m.content)) {
      return m.content.trim();
    }
  }
  return null;
}

export function isReminderIntakeMessage(assistantText: string): boolean {
  const t = assistantText.trim();
  if (!t) return false;
  if (REMINDER_INTAKE_MESSAGE_RE.test(t)) return true;
  if (REMINDER_NAME_ASK_RE.test(t)) return true;
  if (/\bdo you mean \d{1,2} AM or \d{1,2} PM\b/i.test(t)) return true;
  if (/\bwhich .+ should I use\b/i.test(t)) return true;
  if (/\bone[- ]time or recurring\b/i.test(t)) return true;
  if (/\bevery day\?\s*$/i.test(t)) return true;
  if (/\bI'll remind you:\s*$/im.test(t)) return true;
  if (/^Got it\.\s*$/i.test(t) && /\b(?:AM|PM)\b/.test(t)) return true;
  return false;
}

export function isReminderAffirmation(text: string): boolean {
  return REMINDER_AFFIRMATION_RE.test(text.trim());
}

function stripTimePhrases(text: string): string {
  return text
    .replace(MULTIPLE_OFFSET_RE, "")
    .replace(EVENT_OFFSET_RE, "")
    .replace(TIME_AT_RE, "")
    .replace(IN_MINUTES_RE, "")
    .replace(RELATIVE_DAY_RE, "")
    .replace(MORNING_EVENING_RE, "")
    .replace(RECURRENCE_RE, "")
    .replace(/\b(?:before\s+(?:my\s+)?[\w\s]+)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[.,;]+$/, "")
    .trim();
}

function parseHour(
  hour: number,
  minute: number,
  ampm?: string,
): { hour24: number; ambiguous: boolean } {
  if (ampm) {
    const h = ampm.toLowerCase() === "pm" ? (hour % 12) + 12 : hour % 12;
    return { hour24: h, ambiguous: false };
  }
  if (hour > 12) return { hour24: hour, ambiguous: false };
  if (hour === 12) return { hour24: 12, ambiguous: true };
  return { hour24: hour, ambiguous: true };
}

function buildDateTime(
  base: Date,
  hour24: number,
  minute: number,
): string {
  const d = new Date(base);
  d.setHours(hour24, minute, 0, 0);
  return d.toISOString();
}

function resolveRelativeDay(text: string, now: Date): Date {
  const t = text.toLowerCase();
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (/\btomorrow\b/.test(t)) {
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (/\btoday\b/.test(t)) return d;
  const nextDay = t.match(
    /next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/,
  );
  if (nextDay) {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const target = days.indexOf(nextDay[1]!);
    const current = d.getDay();
    let delta = target - current;
    if (delta <= 0) delta += 7;
    d.setDate(d.getDate() + delta);
    return d;
  }
  return d;
}

function periodDefaultHour(period?: string): { hour: number; minute: number } {
  if (period === "afternoon") return { hour: 14, minute: 0 };
  if (period === "evening") return { hour: 18, minute: 0 };
  return { hour: 9, minute: 0 };
}

function offsetToMinutes(amount: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u.startsWith("day")) return amount * 24 * 60;
  if (u.startsWith("hour") || u === "hr" || u === "hrs") return amount * 60;
  return amount;
}

export function parseOffsets(text: string): number[] {
  const offsets: number[] = [];
  for (const match of text.matchAll(MULTIPLE_OFFSET_RE)) {
    offsets.push(offsetToMinutes(Number(match[1]), match[2]!));
  }
  return [...new Set(offsets)].sort((a, b) => b - a);
}

export function parseDailyTimeList(text: string): string[] | null {
  const result = validateReminderTimes(text);
  return result.times;
}

export type ReminderFrequencyKind = "daily" | "weekdays" | "once";

export type ReminderBuilderValidation = {
  valid: boolean;
  issues: string[];
  times: string[] | null;
  frequency: ReminderFrequencyKind | null;
  title: string;
};

/** Parse natural-language frequency for Reminder Builder™. */
export function parseReminderFrequency(text: string): ReminderFrequencyKind | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/\b(?:once|one[\s-]?time)\b/.test(t)) return "once";
  if (
    /\b(?:m-?f|mon-?fri|monday\s*(?:through|thru|to|–|-)\s*friday|weekdays?|every\s+weekday|business\s+days?)\b/.test(
      t,
    )
  ) {
    return "weekdays";
  }
  if (/\b(?:daily|every\s+day)\b/.test(t)) return "daily";
  return null;
}

export function validateReminderTimes(text: string): {
  times: string[] | null;
  issues: string[];
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { times: null, issues: ["Add at least one reminder time"] };
  }
  const matches = [...trimmed.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/gi)];
  if (matches.length === 0) {
    return {
      times: null,
      issues: [
        "Could not read any times — try 10am, 1pm, 5pm or 10:00 AM, 1:00 PM",
      ],
    };
  }
  const times: string[] = [];
  const issues: string[] = [];
  for (const m of matches) {
    const hour = Number(m[1]);
    const minute = m[2] ? Number(m[2]) : 0;
    const { hour24, ambiguous } = parseHour(hour, minute, m[3]);
    if (ambiguous) {
      issues.push(
        `Add AM or PM for ${hour}:${String(minute).padStart(2, "0")}`,
      );
      continue;
    }
    times.push(
      `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }
  if (issues.length > 0) return { times: null, issues };
  return { times: [...new Set(times)].sort(), issues: [] };
}

export function validateReminderBuilderInput(input: {
  name: string;
  timesText: string;
  frequencyText: string;
}): ReminderBuilderValidation {
  const title = input.name.trim() || "Reminder";
  const timeResult = validateReminderTimes(input.timesText);
  const frequency = parseReminderFrequency(input.frequencyText);
  const issues = [...timeResult.issues];

  if (!frequency) {
    issues.push(
      "Select frequency — e.g. daily, weekdays, Monday–Friday, or once",
    );
  }
  if (frequency === "once" && (timeResult.times?.length ?? 0) > 1) {
    issues.push("Once reminders support one time only");
  }

  return {
    valid: issues.length === 0 && Boolean(timeResult.times?.length),
    issues,
    times: timeResult.times,
    frequency,
    title,
  };
}

function isWeekdayDate(d: Date): boolean {
  const dow = d.getDay();
  return dow !== 0 && dow !== 6;
}

export function nextWeekdaysMultiFire(
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

export function advanceWeekdaysMultiFire(
  dailyTimes: string[],
  from: Date,
): string | null {
  const current = formatTime24(from);
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

export function buildReminderFromBuilderValidation(
  validation: ReminderBuilderValidation,
  channel: ReminderNotificationChannel,
): Omit<Reminder, "id" | "createdAt" | "status"> | null {
  if (!validation.valid || !validation.times?.length || !validation.frequency) {
    return null;
  }
  const { title, times, frequency } = validation;

  if (frequency === "once") {
    const [h, m] = times[0]!.split(":").map(Number);
    const d = new Date();
    d.setHours(h!, m!, 0, 0);
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
    return {
      title,
      message: title,
      reminderType: "one_time",
      scheduledAt: d.toISOString(),
      notificationChannel: channel,
      source: "chat",
    };
  }

  const rule =
    frequency === "weekdays"
      ? `weekdays-multi@${times.join(",")}`
      : `daily-multi@${times.join(",")}`;
  const scheduledAt =
    frequency === "weekdays"
      ? nextWeekdaysMultiFire(times) ?? undefined
      : nextMultiDailyFire(times) ?? undefined;

  return {
    title,
    message: title,
    reminderType: "recurring",
    recurrenceRule: rule,
    dailyTimes: times,
    scheduledAt,
    notificationChannel: channel,
    source: "chat",
  };
}

function formatTime12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h % 12 || 12;
  return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
}

function buildMultiTimeAskReply(draft: ReminderDraft): string {
  const lines = (draft.dailyTimes ?? []).map((t) => `• ${formatTime12(t)}`);
  return `Got it.\nI'll remind you:\n${lines.join("\n")}\n\nEvery day or weekdays (Monday–Friday)?`;
}

export function nextMultiDailyFire(
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

export function advanceMultiDailyFire(
  dailyTimes: string[],
  from: Date,
): string | null {
  const current = formatTime24(from);
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
  return d.toISOString();
}

function formatTime24(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function extractEventQuery(text: string): string | null {
  const about = text.match(
    /\babout\s+(.+?)(?:\s*,?\s*\d+\s*(?:minutes?|hours?|hrs?|days?)\s+before|\s*$)/i,
  );
  if (about) return about[1]!.trim();

  const m = text.match(
    /\b(?:\d+\s*(?:minutes?|hours?|hrs?|days?)\s+before\s+)(?:my\s+)?(.+?)(?:[.,]|$)/i,
  );
  if (!m) return null;
  return m[1]!.trim();
}

export function findMatchingEvents(
  query: string,
  blocks: TimeBlock[],
): TimeBlock[] {
  const q = query
    .toLowerCase()
    .replace(/\b(?:my|the|a|an)\b/g, "")
    .trim();
  if (!q) return [];
  return blocks.filter(
    (b) =>
      b.status === "pending" &&
      Boolean(b.date) &&
      (b.title.toLowerCase().includes(q) || q.includes(b.title.toLowerCase())),
  );
}

function formatTimeLabel(iso: string, now: Date): string {
  const d = new Date(iso);
  const today = now.toDateString() === d.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = tomorrow.toDateString() === d.toDateString();
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (today) return `today at ${time}`;
  if (isTomorrow) return `tomorrow at ${time}`;
  return `${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at ${time}`;
}

function formatRecurrence(rule: string): string {
  if (rule === "hourly") return "every hour";
  const daily = rule.match(/^daily@(\d{2}):(\d{2})$/);
  if (daily) {
    const h = Number(daily[1]);
    const suffix = h >= 12 ? "PM" : "AM";
    const display = h % 12 || 12;
    return `every day at ${display} ${suffix}`;
  }
  const weekly = rule.match(/^weekly@(\w+)@(\d{2}):(\d{2})$/);
  if (weekly) return `every ${weekly[1]}`;
  if (rule.startsWith("weekdays@")) return "weekdays";
  return rule;
}

export function buildConfirmationReply(reminders: Reminder[], now = new Date()): string {
  const r = reminders[0]!;
  if (r.recurrenceRule?.startsWith("daily-multi@") && r.dailyTimes?.length) {
    const lines = r.dailyTimes.map((t) => `• ${formatTime12(t)}`);
    const notif =
      r.notificationChannel === "both"
        ? "Desktop + sound"
        : r.notificationChannel === "sound"
          ? "Sound"
          : "Desktop";
    return [
      "Reminder created.",
      `**${r.title}**`,
      lines.join("\n"),
      `Recurring daily · ${r.dailyTimes.length} notification${r.dailyTimes.length === 1 ? "" : "s"} per day · ${notif}`,
    ].join("\n");
  }
  if (r.recurrenceRule?.startsWith("weekdays-multi@") && r.dailyTimes?.length) {
    const lines = r.dailyTimes.map((t) => `• ${formatTime12(t)}`);
    const notif =
      r.notificationChannel === "both"
        ? "Desktop + sound"
        : r.notificationChannel === "sound"
          ? "Sound"
          : "Desktop";
    return [
      "Reminder created.",
      `**${r.title}**`,
      lines.join("\n"),
      `Weekdays (Mon–Fri) · ${r.dailyTimes.length} notification${r.dailyTimes.length === 1 ? "" : "s"} per day · ${notif}`,
    ].join("\n");
  }
  if (r.reminderType === "recurring" && r.recurrenceRule) {
    return `Got it — I'll remind you ${formatRecurrence(r.recurrenceRule)} to ${r.message.toLowerCase()}.`;
  }
  if (r.reminderType === "event_offset" && r.offsets?.length) {
    const offset = r.offsets[0]!;
    const label =
      offset >= 1440
        ? `${offset / 1440} day${offset >= 2880 ? "s" : ""}`
        : offset >= 60
          ? `${offset / 60} hour${offset >= 120 ? "s" : ""}`
          : `${offset} minutes`;
    const event = r.eventTitle
      ? `your ${r.eventTitle.toLowerCase()}`
      : "your event";
    if (reminders.length > 1) {
      return `Got it — I'll notify you ${reminders.length} times before ${event}.`;
    }
    return `Got it — I'll notify you ${label} before ${event}.`;
  }
  if (r.scheduledAt) {
    return `Got it — I'll remind you to ${r.message.toLowerCase()} ${formatTimeLabel(r.scheduledAt, now)}.`;
  }
  return `Got it — I'll remind you to ${r.message.toLowerCase()}.`;
}

function buildRemindersFromDraft(draft: ReminderDraft): Omit<
  Reminder,
  "id" | "createdAt" | "status"
>[] {
  if (draft.reminderType === "event_offset" && draft.offsets?.length) {
    if (draft.offsets.length > 1 && draft.eventId) {
      return draft.offsets.map((offset) => ({
        title: draft.title,
        message: draft.message,
        reminderType: "event_offset" as const,
        eventId: draft.eventId,
        eventTitle: draft.eventTitle,
        offsets: [offset],
        scheduledAt: draft.scheduledAt,
        source: "chat" as const,
      }));
    }
    return [
      {
        title: draft.title,
        message: draft.message,
        reminderType: "event_offset",
        eventId: draft.eventId,
        eventTitle: draft.eventTitle,
        offsets: draft.offsets,
        scheduledAt: draft.scheduledAt,
        source: "chat",
      },
    ];
  }
  return [
    {
      title: draft.title,
      message: draft.message,
      reminderType: draft.reminderType,
      scheduledAt:
        draft.scheduledAt ??
        (draft.dailyTimes?.length
          ? nextMultiDailyFire(draft.dailyTimes)
          : undefined),
      recurrenceRule: draft.recurrenceRule,
      dailyTimes: draft.dailyTimes,
      notificationChannel: draft.notificationChannel ?? "both",
      eventId: draft.eventId,
      eventTitle: draft.eventTitle,
      offsets: draft.offsets,
      source: "chat",
    },
  ];
}

function persistReminders(
  drafts: Omit<Reminder, "id" | "createdAt" | "status">[],
): Reminder[] {
  return drafts.map((d) => saveReminder(d));
}

export function parseReminderDraft(
  text: string,
  now = new Date(),
): ReminderDraft | null {
  if (!isReminderRequest(text)) return null;
  const body = stripReminderPrefix(text);
  const message = capitalize(stripTimePhrases(body)) || "Reminder";
  const title = message;
  const offsets = parseOffsets(text);

  const multiTimes = parseDailyTimeList(text);
  if (multiTimes && multiTimes.length > 1) {
    return {
      title,
      message,
      reminderType: "recurring",
      dailyTimes: multiTimes,
      missing: "frequency",
    };
  }

  if (offsets.length > 0 || EVENT_OFFSET_RE.test(text)) {
    const eventTitle =
      (extractEventQuery(text) ??
        stripTimePhrases(body).replace(/^about\s+/i, "").trim()) ||
      undefined;
    const draft: ReminderDraft = {
      title: eventTitle ? capitalize(eventTitle) : message,
      message: eventTitle ? capitalize(eventTitle) : message,
      reminderType: "event_offset",
      offsets: offsets.length ? offsets : [15],
      missing: "event",
      eventTitle,
    };
    return draft;
  }

  if (EVERY_HOUR_RE.test(text)) {
    const next = new Date(now);
    next.setMinutes(next.getMinutes() + 60 - (next.getMinutes() % 60), 0, 0);
    return {
      title,
      message,
      reminderType: "recurring",
      recurrenceRule: "hourly",
      scheduledAt: next.toISOString(),
      missing: null,
    };
  }

  const everyDay = text.match(EVERY_DAY_AT_RE);
  if (everyDay) {
    const hour = Number(everyDay[1]);
    const minute = everyDay[2] ? Number(everyDay[2]) : 0;
    const { hour24, ambiguous } = parseHour(hour, minute, everyDay[3]);
    if (ambiguous) {
      return {
        title,
        message,
        reminderType: "recurring",
        recurrenceRule: `daily@${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        missing: "am_pm",
        ambiguousHour: hour,
      };
    }
    const base = resolveRelativeDay(text, now);
    return {
      title,
      message,
      reminderType: "recurring",
      recurrenceRule: `daily@${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      scheduledAt: buildDateTime(base, hour24, minute),
      missing: null,
    };
  }

  const weekdays = text.match(WEEKDAYS_RE);
  if (weekdays) {
    const hour = Number(weekdays[1]);
    const minute = weekdays[2] ? Number(weekdays[2]) : 0;
    const { hour24, ambiguous } = parseHour(hour, minute, weekdays[3]);
    if (ambiguous) {
      return {
        title,
        message,
        reminderType: "recurring",
        recurrenceRule: `weekdays@${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        missing: "am_pm",
        ambiguousHour: hour,
      };
    }
    return {
      title,
      message,
      reminderType: "recurring",
      recurrenceRule: `weekdays@${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      scheduledAt: buildDateTime(resolveRelativeDay(text, now), hour24, minute),
      missing: null,
    };
  }

  const everyWeekday =
    text.match(EVERY_WEEKDAY_RE) ?? text.match(EVERY_FRIDAY_RE);
  if (everyWeekday) {
    const day = everyWeekday[1] ?? "friday";
    const period = everyWeekday[2];
    const { hour, minute } = periodDefaultHour(period);
    return {
      title,
      message,
      reminderType: "recurring",
      recurrenceRule: `weekly@${day}@${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      scheduledAt: buildDateTime(resolveRelativeDay(`next ${day}`, now), hour, minute),
      missing: null,
    };
  }

  const inMinutes = text.match(IN_MINUTES_RE);
  if (inMinutes) {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + Number(inMinutes[1]));
    return {
      title,
      message,
      reminderType: "one_time",
      scheduledAt: d.toISOString(),
      missing: null,
    };
  }

  const atTime = text.match(TIME_AT_RE);
  if (atTime) {
    const hour = Number(atTime[1]);
    const minute = atTime[2] ? Number(atTime[2]) : 0;
    const { hour24, ambiguous } = parseHour(hour, minute, atTime[3]);
    if (ambiguous) {
      return {
        title,
        message,
        reminderType: "one_time",
        missing: "am_pm",
        ambiguousHour: hour,
      };
    }
    const base = resolveRelativeDay(text, now);
    let scheduled = buildDateTime(base, hour24, minute);
    if (new Date(scheduled).getTime() < now.getTime() && /\btoday\b/i.test(text)) {
      const tomorrow = new Date(base);
      tomorrow.setDate(tomorrow.getDate() + 1);
      scheduled = buildDateTime(tomorrow, hour24, minute);
    }
    return {
      title,
      message,
      reminderType: "one_time",
      scheduledAt: scheduled,
      missing: null,
    };
  }

  if (MORNING_EVENING_RE.test(text)) {
    const period = text.match(MORNING_EVENING_RE)?.[2] ?? "morning";
    const { hour, minute } = periodDefaultHour(period);
    const base = /\btomorrow\b/i.test(text)
      ? resolveRelativeDay("tomorrow", now)
      : resolveRelativeDay("today", now);
    return {
      title,
      message,
      reminderType: "one_time",
      scheduledAt: buildDateTime(base, hour, minute),
      missing: null,
    };
  }

  if (RELATIVE_DAY_RE.test(text) && !atTime) {
    return {
      title,
      message,
      reminderType: "one_time",
      missing: isGenericReminderName(message) ? "name" : "time",
    };
  }

  if (RECURRENCE_RE.test(text)) {
    return {
      title,
      message,
      reminderType: "recurring",
      missing: isGenericReminderName(message) ? "name" : "time",
    };
  }

  return {
    title,
    message,
    reminderType: "one_time",
    missing: isGenericReminderName(message) ? "name" : "time",
  };
}

export function resolveReminderTurn(input: {
  userText: string;
  draft?: ReminderDraft | null;
  timeBlocks?: TimeBlock[];
  now?: Date;
}): ReminderTurnOutcome {
  const now = input.now ?? new Date();
  const text = input.userText.trim();

  if (input.draft) {
    return continueReminderDraft(input.draft, text, input.timeBlocks ?? [], now);
  }

  if (!isReminderRequest(text)) return { kind: "not_reminder" };

  const draft = parseReminderDraft(text, now);
  if (!draft) return { kind: "not_reminder" };

  return finalizeDraft(draft, input.timeBlocks ?? [], now);
}

function continueReminderDraft(
  draft: ReminderDraft,
  answer: string,
  blocks: TimeBlock[],
  now: Date,
): ReminderTurnOutcome {
  if (draft.missing === "name") {
    const name = capitalize(answer.trim());
    if (!name || isGenericReminderName(name)) {
      return {
        kind: "ask",
        reply: "What should I remind you about?",
        draft,
      };
    }
    return {
      kind: "ask",
      reply: "When would you like the reminder?",
      draft: { ...draft, title: name, message: name, missing: "time" },
    };
  }

  if (draft.missing === "frequency") {
    const freq = parseReminderFrequency(answer);
    if (
      freq === "weekdays" ||
      /\b(?:weekdays?|monday\s*(?:through|thru|to|-)\s*friday|m-?f|mon-?fri|every\s+weekday)\b/i.test(
        answer.trim(),
      )
    ) {
      const times = draft.dailyTimes ?? [];
      const rule = `weekdays-multi@${times.join(",")}`;
      return finalizeDraft(
        {
          ...draft,
          missing: null,
          reminderType: "recurring",
          recurrenceRule: rule,
          scheduledAt: nextWeekdaysMultiFire(times, now) ?? undefined,
          notificationChannel: draft.notificationChannel ?? "both",
        },
        blocks,
        now,
      );
    }
    if (
      freq === "daily" ||
      isReminderAffirmation(answer) ||
      /\b(?:every day|daily|yes)\b/i.test(answer.trim())
    ) {
      const times = draft.dailyTimes ?? [];
      const rule = `daily-multi@${times.join(",")}`;
      return finalizeDraft(
        {
          ...draft,
          missing: null,
          reminderType: "recurring",
          recurrenceRule: rule,
          scheduledAt: nextMultiDailyFire(times, now) ?? undefined,
          notificationChannel: draft.notificationChannel ?? "both",
        },
        blocks,
        now,
      );
    }
    return {
      kind: "ask",
      reply: buildMultiTimeAskReply(draft),
      draft,
    };
  }

  if (draft.missing === "am_pm") {
    const isPm = /\bpm\b|p\.m\.?/i.test(answer);
    const isAm = /\bam\b|a\.m\.?/i.test(answer);
    if (!isAm && !isPm) {
      return {
        kind: "ask",
        reply: `Do you mean ${draft.ambiguousHour} AM or ${draft.ambiguousHour} PM?`,
        draft,
      };
    }
    const hour = draft.ambiguousHour ?? 2;
    const hour24 = isPm ? (hour % 12) + 12 : hour % 12;
    const base = resolveRelativeDay("", now);
    const updated: ReminderDraft = {
      ...draft,
      missing: null,
      scheduledAt: buildDateTime(base, hour24, 0),
      recurrenceRule: draft.recurrenceRule?.replace(
        /@(\d{2}):/,
        `@${String(hour24).padStart(2, "0")}:`,
      ),
    };
    return finalizeDraft(updated, blocks, now);
  }

  if (draft.missing === "time") {
    if (isReminderAffirmation(answer)) {
      return {
        kind: "ask",
        reply:
          "When would you like the reminder? You can say a time like **2 PM**, **in 30 minutes**, or **10am, 1pm, and 5pm**.",
        draft,
      };
    }
    const multiTimes = parseDailyTimeList(answer);
    if (multiTimes && multiTimes.length > 1) {
      const nextDraft: ReminderDraft = {
        ...draft,
        dailyTimes: multiTimes,
        missing: "frequency",
      };
      return {
        kind: "ask",
        reply: buildMultiTimeAskReply(nextDraft),
        draft: nextDraft,
      };
    }
    const reparsed = parseReminderDraft(`remind me to ${draft.message} ${answer}`, now);
    if (reparsed && !reparsed.missing) {
      return finalizeDraft(reparsed, blocks, now);
    }
    return {
      kind: "ask",
      reply: "When would you like the reminder?",
      draft,
    };
  }

  if (draft.missing === "event") {
    const matches = findMatchingEvents(answer, blocks);
    if (matches.length === 1) {
      const event = matches[0]!;
      const updated: ReminderDraft = {
        ...draft,
        missing: null,
        eventId: event.id,
        eventTitle: event.title,
        scheduledAt: blockDateTime(event).toISOString(),
      };
      return finalizeDraft(updated, blocks, now);
    }
    if (matches.length > 1) {
      return {
        kind: "ask",
        reply: `Which one — ${matches.map((m) => m.title).join(", ")}?`,
        draft,
      };
    }
    return {
      kind: "ask",
      reply: "Which event should I use?",
      draft: { ...draft, eventTitle: answer },
    };
  }

  return { kind: "not_reminder" };
}

function finalizeDraft(
  draft: ReminderDraft,
  blocks: TimeBlock[],
  now: Date,
): ReminderTurnOutcome {
  if (draft.missing === "name") {
    return {
      kind: "ask",
      reply: "What should I remind you about?",
      draft,
    };
  }
  if (draft.missing === "frequency") {
    return {
      kind: "ask",
      reply: buildMultiTimeAskReply(draft),
      draft,
    };
  }
  if (draft.missing === "time") {
    return {
      kind: "ask",
      reply: "When would you like the reminder?",
      draft,
    };
  }
  if (draft.missing === "am_pm") {
    return {
      kind: "ask",
      reply: `Do you mean ${draft.ambiguousHour} AM or ${draft.ambiguousHour} PM?`,
      draft,
    };
  }
  if (draft.missing === "event") {
    const query = draft.eventTitle ?? draft.message;
    const matches = findMatchingEvents(query, blocks);
    if (matches.length === 1) {
      const event = matches[0]!;
      return finalizeDraft(
        {
          ...draft,
          missing: null,
          eventId: event.id,
          eventTitle: event.title,
          scheduledAt: blockDateTime(event).toISOString(),
        },
        blocks,
        now,
      );
    }
    const label = query.replace(/\b(?:my|the)\b/gi, "").trim() || "event";
    return {
      kind: "ask",
      reply: `Which ${label} should I use?`,
      draft,
    };
  }

  const reminders = persistReminders(buildRemindersFromDraft(draft));
  return {
    kind: "confirm",
    reply: buildConfirmationReply(reminders, now),
    reminders,
  };
}

export function reminderHintForChat(): string {
  return [
    "REMINDER (P0.24): Short confirmation only.",
    "No relationship intelligence. No productivity lecture. No Visual Thinking or Create.",
  ].join("\n");
}

/** Compute next fire time for recurring reminders after a fire. */
export function nextRecurrenceFire(
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
  if (
    rule.startsWith("weekly-days@") ||
    rule.startsWith("monthly@") ||
    rule.startsWith("custom-days@")
  ) {
    return advanceBuilderRecurrenceFire(rule, from);
  }
  if (rule === "hourly") {
    const d = new Date(from);
    d.setHours(d.getHours() + 1);
    return d.toISOString();
  }
  const daily = rule.match(/^daily@(\d{2}):(\d{2})$/);
  if (daily) {
    const d = new Date(from);
    d.setDate(d.getDate() + 1);
    d.setHours(Number(daily[1]), Number(daily[2]), 0, 0);
    return d.toISOString();
  }
  const weekdays = rule.match(/^weekdays@(\d{2}):(\d{2})$/);
  if (weekdays) {
    const d = new Date(from);
    do {
      d.setDate(d.getDate() + 1);
    } while (d.getDay() === 0 || d.getDay() === 6);
    d.setHours(Number(weekdays[1]), Number(weekdays[2]), 0, 0);
    return d.toISOString();
  }
  const weekly = rule.match(/^weekly@(\w+)@(\d{2}):(\d{2})$/);
  if (weekly) {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const target = days.indexOf(weekly[1]!.toLowerCase());
    const d = new Date(from);
    let delta = target - d.getDay();
    if (delta <= 0) delta += 7;
    d.setDate(d.getDate() + delta);
    d.setHours(Number(weekly[2]), Number(weekly[3]), 0, 0);
    return d.toISOString();
  }
  return null;
}

export function computeEventOffsetFire(
  eventStartIso: string,
  offsetMinutes: number,
): string {
  const d = new Date(eventStartIso);
  d.setMinutes(d.getMinutes() - offsetMinutes);
  return d.toISOString();
}

export function remindersReadyToFire(
  reminders: Reminder[],
  blocks: TimeBlock[],
  now = Date.now(),
): Reminder[] {
  return reminders.filter((r) => {
    if (r.status !== "active") return false;
    if (r.paused) return false;
    if (r.snoozedUntil && new Date(r.snoozedUntil).getTime() > now) return false;
    if (r.lastFiredAt) {
      const fired = new Date(r.lastFiredAt).getTime();
      if (now - fired < 55_000) return false;
    }

    if (r.reminderType === "one_time" && r.scheduledAt) {
      return new Date(r.scheduledAt).getTime() <= now;
    }

    if (r.reminderType === "recurring" && r.scheduledAt) {
      return new Date(r.scheduledAt).getTime() <= now;
    }

    if (r.reminderType === "event_offset" && r.eventId && r.offsets?.length) {
      const block = blocks.find((b) => b.id === r.eventId);
      if (!block?.date) return false;
      const eventStart = blockDateTime(block).getTime();
      return r.offsets.some((offset) => {
        const fireAt = eventStart - offset * 60_000;
        return fireAt <= now && eventStart > now;
      });
    }

    return false;
  });
}
