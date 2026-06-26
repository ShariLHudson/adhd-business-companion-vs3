import type { WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { HomesteadDayPace, HomesteadTimePeriod } from "./types";

/** Maps rich homestead periods onto existing four-bucket consumers. */
export function legacyTimeOfDayFromPeriod(
  period: HomesteadTimePeriod,
): WelcomeTimeOfDay {
  switch (period) {
    case "dawn":
    case "morning":
    case "midday":
      return "morning";
    case "afternoon":
      return "afternoon";
    case "golden-hour":
    case "evening":
      return "evening";
    case "night":
      return "night";
  }
}

export function dayPaceFromPeriod(period: HomesteadTimePeriod): HomesteadDayPace {
  switch (period) {
    case "dawn":
      return "hope";
    case "morning":
      return "awake";
    case "midday":
      return "energetic";
    case "afternoon":
      return "steady";
    case "golden-hour":
      return "warm";
    case "evening":
      return "cozy";
    case "night":
      return "resting";
  }
}
