import { resolveContinuousHomesteadTime } from "./continuousTime";
import { resolveConversationRhythm } from "./conversationRhythm";
import { dayPaceFromPeriod, legacyTimeOfDayFromPeriod } from "./legacyMapping";
import { resolveRoomTimeProfile } from "./roomTimeProfiles";
import {
  periodLabel,
  resolveHomesteadTimePeriod,
} from "./timePeriods";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { HomesteadTime } from "./types";

/**
 * Homestead Time Engine™ — the house lives in the same day as the guest.
 */
export function resolveHomesteadTime(input?: {
  now?: Date;
  placeId?: CompanionPlaceId;
}): HomesteadTime {
  const now = input?.now ?? new Date();
  const period = resolveHomesteadTimePeriod(now);
  const continuous = resolveContinuousHomesteadTime(now, period);

  return {
    now: now.toISOString(),
    period,
    periodLabel: periodLabel(period),
    hour: now.getHours(),
    minute: now.getMinutes(),
    legacyTimeOfDay: legacyTimeOfDayFromPeriod(period),
    continuous,
    dayPace: dayPaceFromPeriod(period),
    conversation: resolveConversationRhythm(period, now),
    roomDefaults: resolveRoomTimeProfile({
      period,
      placeId: input?.placeId,
    }),
  };
}

export function homesteadTimeCssVars(
  time: HomesteadTime,
): Record<string, string> {
  const { continuous } = time;
  return {
    "--homestead-day-progress": String(continuous.dayProgress),
    "--homestead-sun-warmth": String(continuous.sunWarmth),
    "--homestead-shadow-length": String(continuous.shadowLength),
    "--homestead-interior-glow": String(continuous.interiorGlow),
    "--homestead-exterior-brightness": String(continuous.exteriorBrightness),
    "--homestead-color-temperature": String(continuous.colorTemperature),
  };
}
