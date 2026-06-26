import type { WelcomePresenceIntelligence } from "@/lib/welcomePresenceIntelligence";
import {
  resolveGuestPreparation,
  resolveVisitEnergy,
  resolveEffectiveHospitalityProfile,
} from "@/lib/companionHospitalityProfile";
import { selectWelcomePhotograph } from "./selectPhotograph";
import { resolveDailyDiscovery } from "./dailyDiscovery";
import { resolveIowaWeather } from "./iowaAtmosphere";
import { resolveMotionProfile, resolveRoomObjects } from "./resolveRoom";
import { defaultRoomPermissionContext } from "./permissionToShow";
import type {
  CompanionEnvironmentInput,
  CompanionEnvironmentIntelligence,
  LivingCompanionRoom,
  WelcomeRoomPrototypeOverrides,
} from "./types";

function resolveGuestPreparationForInput(
  input: CompanionEnvironmentInput,
  weather: CompanionEnvironmentInput["weather"],
) {
  const visitEnergy =
    input.visitEnergy ??
    resolveVisitEnergy({
      recoveryGentle: input.recoveryGentle,
      lowEnergy: input.lowEnergy,
      timeOfDay: input.timeOfDay,
      weather: weather ?? "clear",
    });

  return resolveGuestPreparation({
    profile: input.hospitalityProfile ?? {},
    visitEnergy,
  });
}

export function evaluateCompanionEnvironmentIntelligence(
  input: CompanionEnvironmentInput,
): CompanionEnvironmentIntelligence {
  const now = input.now ?? new Date();
  const weather =
    input.weather ??
    resolveIowaWeather({ season: input.season, now });
  const permissions =
    input.permissions ??
    defaultRoomPermissionContext({
      birthdayToday: input.birthdayToday,
      vacationDaysAway: input.vacationDaysAway,
    });
  const resolvedInput: CompanionEnvironmentInput = {
    ...input,
    weather,
    permissions,
  };
  const guestPreparation = resolveGuestPreparationForInput(
    resolvedInput,
    weather,
  );
  const objects = resolveRoomObjects(resolvedInput, guestPreparation);
  const photograph = selectWelcomePhotograph(resolvedInput);

  return {
    photograph,
    objects,
    motion: resolveMotionProfile(resolvedInput, objects, guestPreparation),
    dailyDiscovery: resolveDailyDiscovery(
      now,
      input.prototypeDiscovery ?? "auto",
    ),
    atmosphere: {
      timeOfDay: input.timeOfDay,
      season: input.season,
      weather,
    },
    guestPreparation,
  };
}

export function composeLivingCompanionRoom(input: {
  environment: CompanionEnvironmentIntelligence;
  conversation: WelcomePresenceIntelligence;
}): LivingCompanionRoom {
  return {
    layer1: input.environment.photograph,
    layer2: input.environment.objects,
    layer3: input.environment.motion,
    layer4: input.conversation,
    dailyDiscovery: input.environment.dailyDiscovery,
    atmosphere: input.environment.atmosphere,
    guestPreparation: input.environment.guestPreparation,
  };
}

export function hasActivePrototypeOverrides(
  overrides: WelcomeRoomPrototypeOverrides,
): boolean {
  return (
    (overrides.season != null && overrides.season !== "auto") ||
    (overrides.weather != null && overrides.weather !== "auto") ||
    (overrides.timeOfDay != null && overrides.timeOfDay !== "auto") ||
    (overrides.discovery != null && overrides.discovery !== "auto") ||
    (overrides.favoriteDrink != null && overrides.favoriteDrink !== "auto") ||
    (overrides.visitEnergy != null && overrides.visitEnergy !== "auto")
  );
}

export function recomposeLivingRoomWithPrototype(
  base: LivingCompanionRoom,
  overrides: WelcomeRoomPrototypeOverrides,
): LivingCompanionRoom {
  const timeOfDay =
    overrides.timeOfDay && overrides.timeOfDay !== "auto"
      ? overrides.timeOfDay
      : base.atmosphere.timeOfDay;
  const season =
    overrides.season && overrides.season !== "auto"
      ? overrides.season
      : base.atmosphere.season;
  const weather =
    overrides.weather && overrides.weather !== "auto"
      ? overrides.weather
      : resolveIowaWeather({ season, now: new Date() });
  const discovery = overrides.discovery ?? "auto";

  const memoryProfile =
    overrides.favoriteDrink === "auto" || overrides.favoriteDrink == null
      ? resolveEffectiveHospitalityProfile({ source: "memory" }).profile
      : undefined;

  const environment = evaluateCompanionEnvironmentIntelligence({
    now: new Date(),
    timeOfDay,
    season,
    weather,
    prototypeDiscovery: discovery,
    sessionVisitIndex: 12,
    isFirstMeeting: false,
    birthdayToday: discovery === "birthday",
    vacationDaysAway: discovery === "vacation" ? 3 : null,
    celebrationActive: false,
    recoveryGentle:
      overrides.visitEnergy === "recovery" || overrides.visitEnergy === "gentle",
    lowEnergy: overrides.visitEnergy === "gentle",
    visitEnergy:
      overrides.visitEnergy && overrides.visitEnergy !== "auto"
        ? overrides.visitEnergy
        : undefined,
    hospitalityProfile: {
      ...memoryProfile,
      favoriteDrink:
        overrides.favoriteDrink && overrides.favoriteDrink !== "auto"
          ? overrides.favoriteDrink
          : memoryProfile?.favoriteDrink ?? base.guestPreparation?.drink,
    },
  });

  return composeLivingCompanionRoom({
    environment,
    conversation: base.layer4,
  });
}
