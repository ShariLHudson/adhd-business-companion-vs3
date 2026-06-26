import type { RecognitionStore } from "@/lib/recognition/recognitionStore";
import type { PersonalDate } from "@/lib/recognition/types";
import { isSafePersonalDateForHospitality } from "./hospitalityMemoryPermissions";
import type { HospitalityTodayContext } from "./types";

function sameMonthDay(
  month: number,
  day: number,
  now: Date,
): boolean {
  return month === now.getMonth() + 1 && day === now.getDate();
}

function daysUntil(targetIso: string, now: Date): number {
  const [year, month, day] = targetIso.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function nearestVacationDays(
  dates: PersonalDate[],
  now: Date,
): number | null {
  let nearest: number | null = null;

  for (const date of dates) {
    if (date.kind !== "vacation" || !date.targetDate) continue;
    if (!isSafePersonalDateForHospitality(date)) continue;
    const days = daysUntil(date.targetDate, now);
    if (days < 0 || days > 14) continue;
    if (nearest == null || days < nearest) nearest = days;
  }

  return nearest;
}

function projectRecentlyCompleted(
  recognition: RecognitionStore,
  now: Date,
): boolean {
  const completedAt = recognition.businessMilestones.first_project_completed;
  if (!completedAt) return false;
  const completed = new Date(completedAt);
  const days = Math.round(
    (now.getTime() - completed.getTime()) / 86_400_000,
  );
  return days >= 0 && days <= 7;
}

export function resolveTodayContextFromRecognition(
  recognition: RecognitionStore,
  now = new Date(),
  partial: Partial<HospitalityTodayContext> = {},
): HospitalityTodayContext {
  const birthdayToday =
    partial.birthdayToday ??
    (recognition.birthday
      ? sameMonthDay(
          recognition.birthday.month,
          recognition.birthday.day,
          now,
        )
      : false);

  const vacationDaysAway =
    partial.vacationDaysAway ??
    nearestVacationDays(recognition.personalDates, now);

  return {
    now,
    birthdayToday,
    vacationDaysAway,
    projectRecentlyCompleted:
      partial.projectRecentlyCompleted ??
      projectRecentlyCompleted(recognition, now),
    recoveryGentle: partial.recoveryGentle,
    lowEnergy: partial.lowEnergy,
  };
}
