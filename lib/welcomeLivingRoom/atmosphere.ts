import type { ArrivalGraphRecord } from "@/lib/arrivalIntelligence/livingIntelligenceGraph";

export type WelcomeTimeOfDay = ArrivalGraphRecord["timeOfDay"];

export type WelcomeSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "holiday";

export function seasonBucket(now = new Date()): WelcomeSeason {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (month === 12 && day >= 15) return "holiday";
  if (month === 1 && day <= 5) return "holiday";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function resolveWelcomeAtmosphere(input: {
  timeOfDay: WelcomeTimeOfDay;
  now?: Date;
}): { timeOfDay: WelcomeTimeOfDay; season: WelcomeSeason } {
  return {
    timeOfDay: input.timeOfDay,
    season: seasonBucket(input.now),
  };
}
