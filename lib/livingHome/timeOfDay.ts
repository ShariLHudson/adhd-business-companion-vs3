import type { HomesteadTimePeriod } from "@/lib/homesteadTime";
import type { LivingHomeTimeProfile } from "./types";

export function livingHomeTimeProfileFromPeriod(
  period: HomesteadTimePeriod,
): LivingHomeTimeProfile {
  switch (period) {
    case "dawn":
      return "early-morning";
    case "morning":
      return "morning";
    case "midday":
    case "afternoon":
      return "afternoon";
    case "golden-hour":
      return "golden-hour";
    case "evening":
      return "evening";
    case "night":
      return "night";
    default:
      return "afternoon";
  }
}
