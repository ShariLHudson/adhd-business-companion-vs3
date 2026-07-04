/**
 * P0.24 — ADHD-Friendly Notifications & Reminders
 * Natural-language detection, parsing, and short confirmations.
 */

import type { TimeBlock } from "./companionStore";
import { blockDateTime } from "./companionStore";
import type { Reminder, ReminderType } from "./reminderStore";
import { saveReminder, saveReminders } from "./reminderStore";

export type ReminderDraft = {
  title: string;
  message: string;
  reminderType: ReminderType;
  scheduledAt?: string;
  recurrenceRule?: string;
  eventId?: string;
  eventTitle?: string;
  offsets?: number[];
  missing: "time" | "am_pm" | "event" | null;
  ambiguousHour?: number;
};

export type ReminderTurnOutcome =
  | { kind: "not_reminder" }
  | { kind: "ask"; reply: string; draft: ReminderDraft }
  | { kind: "confirm"; reply: string; reminders: Reminder[] };

const REMINDER_REQUEST_RE =
  /\b(?:remind me|notify me|alert me|nudge me|check in with me|don'?t let me forget|don'?t forget)\b/i;

/** List capture / brain dump — not a timed reminder even when "don't forget" appears. */
const LIST_CAPTURE_EXCLUSION_RE =
  /\b(?:make|write|create|need)\s+(?:a\s+)?(?:list|todo|to-?do)|\blist of\b|\bthings i need to do\b|\bbrain dump\b|\bget (?:it|this|everything) (?:out|down)\b/i;

const LIST_WRITE_NOW_RE =
  /\b(?:write|make|create)\s+(?:the\s+)?(?:list|todo|to-?do)\b|\blist\b.*\bright now\b|\bright now\b.*\blist\b/i;

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
  if (LIST_CAPTURE_EXCLUSION_RE.test(t)) return false;
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
  return text
    .replace(
      /^(?:please\s+)?(?:remind me|notify me|alert me|nudge me|check in with me|don'?t let me forget|don'?t forget)\s+(?:to\s+)?/i,
      "",
    )
    .trim();
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
      scheduledAt: draft.scheduledAt,
      recurrenceRule: draft.recurrenceRule,
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
      missing: "time",
    };
  }

  if (RECURRENCE_RE.test(text)) {
    return {
      title,
      message,
      reminderType: "recurring",
      missing: "time",
    };
  }

  return {
    title,
    message,
    reminderType: "one_time",
    missing: "time",
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
  if (LIST_WRITE_NOW_RE.test(answer) || LIST_CAPTURE_EXCLUSION_RE.test(answer)) {
    return { kind: "not_reminder" };
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
    const reparsed = parseReminderDraft(`remind me to ${draft.message} ${answer}`, now);
    if (reparsed && !reparsed.missing) {
      return finalizeDraft(reparsed, blocks, now);
    }
    return {
      kind: "ask",
      reply: "When would you like me to remind you?",
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
  if (draft.missing === "time") {
    return {
      kind: "ask",
      reply: "When would you like me to remind you?",
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
