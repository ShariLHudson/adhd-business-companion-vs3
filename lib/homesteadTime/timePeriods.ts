import type { HomesteadTimePeriod } from "./types";

export type TimePeriodDefinition = {
  period: HomesteadTimePeriod;
  label: string;
  /** Inclusive start minute from midnight (0–1439). */
  startMinute: number;
  /** Exclusive end minute; wraps past midnight for night. */
  endMinute: number;
};

export const HOMESTEAD_TIME_PERIODS: TimePeriodDefinition[] = [
  { period: "dawn", label: "Dawn", startMinute: 5 * 60, endMinute: 7 * 60 },
  { period: "morning", label: "Morning", startMinute: 7 * 60, endMinute: 11 * 60 },
  { period: "midday", label: "Midday", startMinute: 11 * 60, endMinute: 14 * 60 },
  {
    period: "afternoon",
    label: "Afternoon",
    startMinute: 14 * 60,
    endMinute: 17 * 60,
  },
  {
    period: "golden-hour",
    label: "Golden Hour",
    startMinute: 17 * 60,
    endMinute: 19 * 60 + 30,
  },
  { period: "evening", label: "Evening", startMinute: 19 * 60 + 30, endMinute: 22 * 60 },
  { period: "night", label: "Night", startMinute: 22 * 60, endMinute: 5 * 60 },
];

export function minuteOfDay(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function resolveHomesteadTimePeriod(now = new Date()): HomesteadTimePeriod {
  const minute = minuteOfDay(now);
  for (const definition of HOMESTEAD_TIME_PERIODS) {
    if (definition.startMinute <= definition.endMinute) {
      if (minute >= definition.startMinute && minute < definition.endMinute) {
        return definition.period;
      }
    } else if (minute >= definition.startMinute || minute < definition.endMinute) {
      return definition.period;
    }
  }
  return "night";
}

export function periodLabel(period: HomesteadTimePeriod): string {
  return (
    HOMESTEAD_TIME_PERIODS.find((entry) => entry.period === period)?.label ??
    period
  );
}
