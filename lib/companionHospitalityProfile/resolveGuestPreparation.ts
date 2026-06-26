import type { WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import type {
  CompanionHospitalityProfile,
  FavoriteDrink,
} from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";
import {
  evaluatePresenceIntelligence,
  mapPresenceToGuestPreparation,
} from "@/lib/presenceIntelligence";

export type VisitEnergy = "recovery" | "gentle" | "steady" | "high";

export type GuestPreparation = {
  drink: FavoriteDrink;
  objectKind: "coffee" | "tea-set";
  vesselLabel: string;
  /** Host voice — null when care is discovered in the room, not announced. */
  line: string | null;
  blanket: boolean;
  brightMorning: boolean;
  visitEnergy: VisitEnergy;
};

export function resolveVisitEnergy(input: {
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  timeOfDay?: WelcomeTimeOfDay;
  weather?: WelcomeWeather;
}): VisitEnergy {
  if (input.recoveryGentle) return "recovery";
  if (input.lowEnergy) return "gentle";
  if (
    input.timeOfDay === "morning" &&
    (input.weather === "clear" || input.weather === undefined)
  ) {
    return "high";
  }
  return "steady";
}

/**
 * Layer 2 + 5 — what Shari prepares before arrival.
 * Presence Intelligence™ — silent preparation, never memory narration.
 */
export function resolveGuestPreparation(input: {
  profile: CompanionHospitalityProfile;
  visitEnergy?: VisitEnergy;
  timeOfDay?: WelcomeTimeOfDay;
  sessionVisitIndex?: number;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  projectRecentlyCompleted?: boolean;
  previousTopic?: string | null;
  isFirstMeeting?: boolean;
  returnIntervalHours?: number | null;
  returnIntervalDays?: number | null;
}): GuestPreparation {
  const { profile } = input;
  const visitEnergy =
    input.visitEnergy ??
    resolveVisitEnergy({
      recoveryGentle: input.recoveryGentle,
      lowEnergy: input.lowEnergy,
      timeOfDay: input.timeOfDay,
    });

  const presence = evaluatePresenceIntelligence({
    sessionVisitIndex: input.sessionVisitIndex ?? 1,
    timeOfDay: input.timeOfDay ?? "afternoon",
    favoriteDrink: profile.favoriteDrink,
    chronotype: profile.chronotype,
    prefersQuiet: profile.prefersQuiet,
    visitEnergy,
    recoveryGentle: input.recoveryGentle,
    lowEnergy: input.lowEnergy,
    projectRecentlyCompleted: input.projectRecentlyCompleted,
    previousTopic: input.previousTopic,
    isFirstMeeting: input.isFirstMeeting,
    returnIntervalHours: input.returnIntervalHours,
    returnIntervalDays: input.returnIntervalDays,
  });

  return mapPresenceToGuestPreparation(presence.preparation);
}
