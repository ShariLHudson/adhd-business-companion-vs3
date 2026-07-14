/**
 * Member-facing Rhythms form helpers — maps UI onto lib/rhythms store.
 * Does not create a second store or change storage keys.
 */

import type {
  MemberRhythm,
  RhythmCadence,
  RhythmSchedule,
  RhythmTimeWindow,
  Weekday,
} from "./types";
import { RHYTHM_CADENCE_OPTIONS } from "./types";

export const RHYTHMS_HOW_DO_I_COPY =
  "Create repeatable routines for the things you regularly return to. Choose how often each rhythm should happen.";

export type DailyMode = "every_day" | "weekdays" | "selected_days";
export type MonthlyMode = "day_of_month" | "nth_weekday";
export type NthWeekday = "first" | "second" | "third" | "fourth" | "last";

export type RhythmFormValues = {
  title: string;
  description: string;
  cadence: RhythmCadence;
  dailyMode: DailyMode;
  weekdays: Weekday[];
  monthlyMode: MonthlyMode;
  dayOfMonth: number;
  nthWeekday: NthWeekday;
  monthlyWeekday: Weekday;
  /** 1–12 — quarterly starting month */
  quarterlyStartMonth: number;
  yearlyMonth: number;
  yearlyDay: number;
  /** Plain wording for Custom (and optional notes elsewhere). */
  customNote: string;
  time: string;
  notes: string;
};

export const WEEKDAY_OPTIONS: { id: Weekday; label: string; short: string }[] =
  [
    { id: "monday", label: "Monday", short: "Mon" },
    { id: "tuesday", label: "Tuesday", short: "Tue" },
    { id: "wednesday", label: "Wednesday", short: "Wed" },
    { id: "thursday", label: "Thursday", short: "Thu" },
    { id: "friday", label: "Friday", short: "Fri" },
    { id: "saturday", label: "Saturday", short: "Sat" },
    { id: "sunday", label: "Sunday", short: "Sun" },
  ];

export const WEEKDAY_DAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const NTH_WEEKDAY_OPTIONS: { id: NthWeekday; label: string }[] = [
  { id: "first", label: "First" },
  { id: "second", label: "Second" },
  { id: "third", label: "Third" },
  { id: "fourth", label: "Fourth" },
  { id: "last", label: "Last" },
];

export const MONTH_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const EMPTY_RHYTHM_FORM: RhythmFormValues = {
  title: "",
  description: "",
  cadence: "daily",
  dailyMode: "every_day",
  weekdays: ["monday"],
  monthlyMode: "day_of_month",
  dayOfMonth: 1,
  nthWeekday: "first",
  monthlyWeekday: "monday",
  quarterlyStartMonth: 1,
  yearlyMonth: 1,
  yearlyDay: 1,
  customNote: "",
  time: "",
  notes: "",
};

export const RHYTHM_FREQUENCY_OPTIONS = RHYTHM_CADENCE_OPTIONS;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function thisYear(): number {
  return new Date().getFullYear();
}

function clampDay(day: number): number {
  return Math.min(31, Math.max(1, Math.floor(day) || 1));
}

function clampMonth(month: number): number {
  return Math.min(12, Math.max(1, Math.floor(month) || 1));
}

/** Parse plain custom wording into an interval when obvious (days). */
export function parseCustomIntervalDays(note: string): number | undefined {
  const t = note.trim().toLowerCase();
  const weeks = t.match(/every\s+(\d+)\s+weeks?/);
  if (weeks) return Math.max(1, Number(weeks[1])) * 7;
  const days = t.match(/every\s+(\d+)\s+days?/);
  if (days) return Math.max(1, Number(days[1]));
  const months = t.match(/every\s+(\d+)\s+months?/);
  if (months) return Math.max(1, Number(months[1])) * 30;
  if (/\bevery\s+2\s+weeks\b/.test(t) || /\bbi[- ]?weekly\b/.test(t)) return 14;
  return undefined;
}

function weekdayLabel(id: Weekday): string {
  return WEEKDAY_OPTIONS.find((w) => w.id === id)?.label ?? id;
}

export function summarizeRhythmSchedule(rhythm: MemberRhythm): string {
  const cadence =
    RHYTHM_CADENCE_OPTIONS.find((c) => c.id === rhythm.cadence)?.label ??
    rhythm.cadence;
  const parts: string[] = [cadence];
  if (rhythm.schedule.weekdays?.length) {
    parts.push(
      rhythm.schedule.weekdays.map((d) => weekdayLabel(d).slice(0, 3)).join(", "),
    );
  }
  if (rhythm.schedule.exactTime) {
    parts.push(rhythm.schedule.exactTime);
  }
  if (rhythm.customNote?.trim()) {
    parts.push(rhythm.customNote.trim());
  }
  return parts.join(" · ");
}

export function formValuesFromRhythm(rhythm: MemberRhythm): RhythmFormValues {
  const weekdays = rhythm.schedule.weekdays?.length
    ? [...rhythm.schedule.weekdays]
    : ["monday"];
  let dailyMode: DailyMode = "every_day";
  if (rhythm.cadence === "daily" && rhythm.schedule.weekdays?.length) {
    const set = new Set(rhythm.schedule.weekdays);
    const isWeekdays =
      WEEKDAY_DAYS.every((d) => set.has(d)) &&
      !set.has("saturday") &&
      !set.has("sunday");
    dailyMode = isWeekdays ? "weekdays" : "selected_days";
  }

  let monthlyMode: MonthlyMode = "day_of_month";
  let nthWeekday: NthWeekday = "first";
  let monthlyWeekday: Weekday = weekdays[0] ?? "monday";
  const note = rhythm.customNote?.toLowerCase() ?? "";
  const nthMatch = note.match(
    /\b(first|second|third|fourth|last)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
  );
  if (rhythm.cadence === "monthly" && nthMatch) {
    monthlyMode = "nth_weekday";
    nthWeekday = nthMatch[1] as NthWeekday;
    monthlyWeekday = nthMatch[2] as Weekday;
  }

  const start = rhythm.schedule.startDate ?? "";
  const startParts = start.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const month = startParts ? Number(startParts[2]) : 1;
  const day = startParts ? Number(startParts[3]) : rhythm.schedule.startDate
    ? 1
    : 1;

  return {
    title: rhythm.title,
    description: rhythm.details ?? "",
    cadence: rhythm.cadence,
    dailyMode,
    weekdays,
    monthlyMode,
    dayOfMonth: clampDay(day),
    nthWeekday,
    monthlyWeekday,
    quarterlyStartMonth: clampMonth(month),
    yearlyMonth: clampMonth(month),
    yearlyDay: clampDay(day),
    customNote:
      rhythm.cadence === "custom" ? (rhythm.customNote ?? "") : "",
    time: rhythm.schedule.exactTime ?? "",
    notes:
      rhythm.cadence === "custom"
        ? ""
        : (rhythm.customNote ?? ""),
  };
}

export type RhythmCreatePayload = {
  title: string;
  details?: string;
  cadence: RhythmCadence;
  customNote?: string;
  schedule: Partial<RhythmSchedule>;
  window: RhythmTimeWindow;
  source: "user";
};

export function rhythmPayloadFromForm(
  values: RhythmFormValues,
): RhythmCreatePayload {
  const title = values.title.trim();
  const description = values.description.trim();
  const notes = values.notes.trim();
  const time = values.time.trim();
  const window: RhythmTimeWindow = time ? "exact" : "morning";
  const baseSchedule: Partial<RhythmSchedule> = {
    cadence: values.cadence,
  };
  if (time) baseSchedule.exactTime = time;

  let customNote: string | undefined;
  const detailsParts = [description, notes].filter(Boolean);
  let details = detailsParts.length ? detailsParts.join("\n\n") : undefined;

  switch (values.cadence) {
    case "daily": {
      if (values.dailyMode === "weekdays") {
        baseSchedule.weekdays = [...WEEKDAY_DAYS];
      } else if (values.dailyMode === "selected_days") {
        baseSchedule.weekdays =
          values.weekdays.length > 0 ? [...values.weekdays] : ["monday"];
      }
      if (notes) customNote = notes;
      details = description || undefined;
      break;
    }
    case "weekly": {
      baseSchedule.weekdays =
        values.weekdays.length > 0 ? [...values.weekdays] : ["monday"];
      if (notes) customNote = notes;
      details = description || undefined;
      break;
    }
    case "monthly": {
      if (values.monthlyMode === "day_of_month") {
        const d = clampDay(values.dayOfMonth);
        baseSchedule.startDate = `${thisYear()}-${pad2(new Date().getMonth() + 1)}-${pad2(d)}`;
        if (notes) customNote = notes;
      } else {
        baseSchedule.weekdays = [values.monthlyWeekday];
        const plain = `${NTH_WEEKDAY_OPTIONS.find((n) => n.id === values.nthWeekday)?.label ?? "First"} ${weekdayLabel(values.monthlyWeekday)} of each month`;
        customNote = notes ? `${plain}. ${notes}` : plain;
      }
      details = description || undefined;
      break;
    }
    case "quarterly": {
      const m = clampMonth(values.quarterlyStartMonth);
      baseSchedule.startDate = `${thisYear()}-${pad2(m)}-01`;
      customNote = notes
        ? `Every three months starting ${MONTH_OPTIONS.find((x) => x.value === m)?.label}. ${notes}`
        : `Every three months starting ${MONTH_OPTIONS.find((x) => x.value === m)?.label}`;
      details = description || undefined;
      break;
    }
    case "yearly": {
      const m = clampMonth(values.yearlyMonth);
      const d = clampDay(values.yearlyDay);
      baseSchedule.startDate = `${thisYear()}-${pad2(m)}-${pad2(d)}`;
      if (notes) customNote = notes;
      details = description || undefined;
      break;
    }
    case "custom": {
      const plain =
        values.customNote.trim() ||
        notes ||
        "Custom rhythm";
      customNote = plain;
      const interval = parseCustomIntervalDays(plain);
      if (interval) baseSchedule.interval = interval;
      details = description || undefined;
      break;
    }
  }

  return {
    title,
    details,
    cadence: values.cadence,
    customNote,
    schedule: baseSchedule,
    window,
    source: "user",
  };
}

export function groupRhythmsByCadence(
  rhythms: MemberRhythm[],
): { id: RhythmCadence; label: string; items: MemberRhythm[] }[] {
  return RHYTHM_CADENCE_OPTIONS.map((opt) => ({
    ...opt,
    items: rhythms.filter(
      (r) => r.cadence === opt.id && r.status !== "archived",
    ),
  }));
}

/** Member-facing group name for save confirmation, e.g. "Weekly Rhythms". */
export function rhythmFrequencyGroupLabel(cadence: RhythmCadence): string {
  const label =
    RHYTHM_CADENCE_OPTIONS.find((opt) => opt.id === cadence)?.label ?? "Custom";
  return `${label} Rhythms`;
}

export function rhythmSaveSuccessMessage(cadence: RhythmCadence): string {
  return `Saved under ${rhythmFrequencyGroupLabel(cadence)}.`;
}

export const RHYTHM_SAVE_FAILURE_MESSAGE =
  "We couldn’t save that rhythm. Your information is still here—please try again.";
