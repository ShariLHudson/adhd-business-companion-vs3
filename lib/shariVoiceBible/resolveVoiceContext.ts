import type { GreetingIntelligenceInput } from "@/lib/greetingIntelligence/types";
import type {
  ShariEmotionalTag,
  ShariSeason,
  ShariTimeOfDay,
  ShariVoiceCategory,
  ShariVoiceContext,
} from "./types";
import { relationshipStageFromVisits } from "./cooldownStore";

function mapTimeOfDay(
  timeOfDay: GreetingIntelligenceInput["timeOfDay"],
): ShariTimeOfDay {
  return timeOfDay === "night" ? "late_night" : timeOfDay;
}

function resolveVisitCategory(
  input: GreetingIntelligenceInput,
): ShariVoiceCategory | null {
  if (input.isFirstMeeting || input.homeState === "FIRST_VISIT") {
    return input.sessionVisitIndex <= 1 ? "first_visit" : "second_visit";
  }
  const days = input.returnIntervalDays;
  if (days == null) return null;
  if (days >= 180) return "return_long_absence";
  if (days >= 42) return "return_six_months";
  if (days >= 28) return "return_one_month";
  if (days >= 6) return "return_one_week";
  if (days >= 1) return "return_one_day";
  return null;
}

function resolveEmotionalTag(
  input: GreetingIntelligenceInput,
): ShariEmotionalTag | undefined {
  if (input.recoveryGentle) return "grief";
  if (input.lowEnergy) return "exhausted";
  if (input.celebrationActive || input.projectRecentlyCompleted) {
    return "celebrating";
  }
  return "neutral";
}

export function resolveVoiceContext(
  input: GreetingIntelligenceInput,
): ShariVoiceContext {
  const now = input.now ?? new Date();
  const day = now.getDay();
  const season = (input.season ?? "summer") as ShariSeason;

  return {
    now,
    sessionVisitIndex: input.sessionVisitIndex,
    relationshipStage: relationshipStageFromVisits(input.sessionVisitIndex),
    timeOfDay: mapTimeOfDay(input.timeOfDay),
    season,
    weather: input.weather,
    isWeekend: input.isWeekend ?? [0, 6].includes(day),
    isMonday: day === 1,
    isFriday: day === 5,
    isFirstMeeting: input.isFirstMeeting,
    isSecondVisit: input.sessionVisitIndex === 2,
    returnIntervalHours: input.returnIntervalHours,
    returnIntervalDays: input.returnIntervalDays,
    birthdayToday: input.birthdayToday,
    holidaySeason: season === "holiday" || season === "winter",
    emotionalTag: resolveEmotionalTag(input),
    lastRoom: null,
    previousTopic: input.previousTopic,
    projectRecentlyCompleted: input.projectRecentlyCompleted,
    vacationDaysAway: input.vacationDaysAway,
    lowEnergy: input.lowEnergy,
    recoveryGentle: input.recoveryGentle,
    firstName: input.firstName,
    visitCategory: resolveVisitCategory(input),
  };
}

export type ResolvedVoiceContext = ShariVoiceContext;
