/**
 * Create reminder or rhythm from existing content (Phase 2).
 * Source items stay linked — never deleted or duplicated.
 */

import { saveReminder, type Reminder, type ReminderSource } from "@/lib/reminderStore";
import {
  findSimilarActiveReminder,
  findSimilarActiveRhythm,
} from "./duplicates";
import type { RememberSourceRef } from "./sourceLinks";
import { createMemberRhythm } from "./store";
import type {
  MemberRhythm,
  RhythmCadence,
  RhythmCategory,
  RhythmSource,
} from "./types";

export type ContentRememberSource =
  | "clear_my_mind"
  | "parking_lot"
  | "project"
  | "journal"
  | "plan_day"
  | "conversation"
  | "chamber";

export type RememberIntent = "reminder" | "rhythm" | "calendar" | "unclear";

const RHYTHM_SIGNALS =
  /\b(every|each|recurring|rhythm|routine|always|weekly|daily|monthly|quarterly|fridays?|mondays?|tuesdays?|wednesdays?|thursdays?|saturdays?|sundays?)\b/i;
const REMINDER_SIGNALS =
  /\b(remind me|tomorrow|tonight|in \d+|next week|don't let me forget|dont let me forget|after (my )?meeting)\b/i;
const CALENDAR_SIGNALS =
  /\b(put (it )?on (my )?calendar|schedule (a )?meeting|block (time|off))\b/i;
const GEO_FUTURE = /\bwhen i (get|arrive) home\b/i;
const REMEMBER_SOFT =
  /\b(remind me|help me remember|don't let me forget|dont let me forget|remember to)\b/i;

export function classifyRememberIntent(text: string): RememberIntent {
  const t = text.trim();
  if (!t) return "unclear";
  if (GEO_FUTURE.test(t)) return "unclear";
  if (CALENDAR_SIGNALS.test(t)) return "calendar";
  if (RHYTHM_SIGNALS.test(t)) return "rhythm";
  if (REMINDER_SIGNALS.test(t)) return "reminder";
  return "unclear";
}

/** Soft remember language without time or recurrence — ask one clarifying question. */
export function needsRememberClarification(text: string): boolean {
  const t = text.trim();
  if (!REMEMBER_SOFT.test(t)) return false;
  if (GEO_FUTURE.test(t)) return false;
  if (CALENDAR_SIGNALS.test(t)) return false;
  if (RHYTHM_SIGNALS.test(t)) return false;
  // Has relative time → reminder path can proceed
  if (
    /\b(tomorrow|tonight|today|in \d+\s*(minutes?|mins?|hours?|hrs?|days?)|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(:\d{2})?\s*(am|pm))\b/i.test(
      t,
    )
  ) {
    return false;
  }
  return true;
}

export function isUnsupportedLocationTrigger(text: string): boolean {
  return GEO_FUTURE.test(text.trim());
}

export function parseCadenceFromText(text: string): RhythmCadence | null {
  if (/\b(daily|every day|each day)\b/i.test(text)) return "daily";
  if (/\b(yearly|every year|annually)\b/i.test(text)) return "yearly";
  if (/\b(quarterly|every quarter)\b/i.test(text)) return "quarterly";
  if (/\b(monthly|every month)\b/i.test(text)) return "monthly";
  if (
    /\b(weekly|every week|each week|every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|fridays?|mondays?)\b/i.test(
      text,
    )
  ) {
    return "weekly";
  }
  return null;
}

export function extractRhythmTitle(userText: string): string {
  return userText
    .replace(
      /^(?:please\s+)?(?:remind me|help me remember|don't let me forget|dont let me forget)\s+(?:to\s+)?/i,
      "",
    )
    .replace(
      /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|day|week|month|quarter|year)\b/gi,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 120);
}

function mapSource(source: ContentRememberSource): {
  rhythm: RhythmSource;
  reminder: ReminderSource;
} {
  switch (source) {
    case "clear_my_mind":
      return { rhythm: "clear_my_mind", reminder: "clear_my_mind" };
    case "parking_lot":
      return { rhythm: "parking_lot", reminder: "parking_lot" };
    case "project":
      return { rhythm: "project", reminder: "project" };
    case "journal":
      return { rhythm: "journal", reminder: "journal" };
    case "plan_day":
      return { rhythm: "plan_item", reminder: "plan_day" };
    case "conversation":
      return { rhythm: "conversation", reminder: "chat" };
    default:
      return { rhythm: "user", reminder: "task" };
  }
}

export type CreateReminderFromContentResult =
  | { ok: true; reminder: Reminder; duplicate: false }
  | { ok: true; reminder: Reminder; duplicate: true }
  | { ok: false; reason: "empty_title" };

export type CreateRhythmFromContentResult =
  | { ok: true; rhythm: MemberRhythm; duplicate: false }
  | { ok: true; rhythm: MemberRhythm; duplicate: true }
  | { ok: false; reason: "empty_title" | "missing_cadence"; ask?: string };

export function createReminderFromContent(input: {
  title: string;
  message?: string;
  scheduledAt: string;
  source: ContentRememberSource;
  priority?: "critical" | "important" | "supportive" | "optional";
  sourceRef?: RememberSourceRef;
  /** When true, return existing similar reminder instead of creating. */
  allowDuplicate?: boolean;
}): CreateReminderFromContentResult {
  const title = input.title.trim().slice(0, 120);
  if (!title) return { ok: false, reason: "empty_title" };

  if (!input.allowDuplicate) {
    const existing = findSimilarActiveReminder(title);
    if (existing) {
      return { ok: true, reminder: existing, duplicate: true };
    }
  }

  const mapped = mapSource(input.source);
  const reminder = saveReminder({
    title,
    message: (input.message ?? input.title).trim().slice(0, 500),
    reminderType: "one_time",
    scheduledAt: input.scheduledAt,
    source: mapped.reminder,
    priority: input.priority ?? "important",
    originatedFromId: input.sourceRef?.originatedFromId,
    originatedFromKind: input.sourceRef?.originatedFromKind,
  });
  return { ok: true, reminder, duplicate: false };
}

export function createRhythmFromContent(input: {
  title: string;
  details?: string;
  cadence?: RhythmCadence;
  source: ContentRememberSource;
  category?: RhythmCategory;
  window?: MemberRhythm["window"];
  destinationId?: string;
  sourceRef?: RememberSourceRef;
  /** Infer cadence from details/title text when omitted. */
  inferCadenceFromText?: string;
  allowDuplicate?: boolean;
}): CreateRhythmFromContentResult {
  const title = input.title.trim().slice(0, 120);
  if (!title) return { ok: false, reason: "empty_title" };

  const cadence =
    input.cadence ??
    (input.inferCadenceFromText
      ? parseCadenceFromText(input.inferCadenceFromText)
      : null) ??
    null;

  if (!cadence) {
    return {
      ok: false,
      reason: "missing_cadence",
      ask: `Would you like “${title}” daily, weekly, or on another rhythm?`,
    };
  }

  if (!input.allowDuplicate) {
    const existing = findSimilarActiveRhythm(title);
    if (existing) {
      return { ok: true, rhythm: existing, duplicate: true };
    }
  }

  const mapped = mapSource(input.source);
  const rhythm = createMemberRhythm({
    title,
    details: input.details,
    cadence,
    source: mapped.rhythm,
    category: input.category ?? "personal",
    window: input.window ?? "morning",
    destinationId: input.destinationId,
    priority: "supportive",
    originatedFromId: input.sourceRef?.originatedFromId,
    originatedFromKind: input.sourceRef?.originatedFromKind,
  });
  return { ok: true, rhythm, duplicate: false };
}

/** Default schedule: tomorrow 10:00 local — used by CMM / Parking Lot quick create. */
export function defaultReminderScheduledAt(from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}
