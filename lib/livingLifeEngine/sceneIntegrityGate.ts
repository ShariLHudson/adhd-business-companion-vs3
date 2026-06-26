import type { CompanionMotionKind } from "@/lib/companionEnvironmentIntelligence/types";
import { resolveEnvironmentalTruth } from "@/lib/environmentalTruth";
import type { LivingChangeEngineInput } from "./types";

/**
 * Scene Integrity gate — vetoes impossible combinations before render.
 * Delegates motion coherence to Environmental Truth™ after change selection.
 */
export function filterBySceneIntegrity(
  changes: import("./types").LivingChangeItem[],
  input: LivingChangeEngineInput,
): import("./types").LivingChangeItem[] {
  const season =
    input.season === "holiday" ? ("winter" as const) : input.season;

  return changes.filter((change) => {
    const motionEnable = change.motion?.enable ?? [];
    const hero = change.heroMotion;

    if (
      (season === "winter" || input.weather === "snow") &&
      (motionEnable.includes("butterflies") ||
        hero === "butterflies" ||
        change.wildlife === "butterfly")
    ) {
      return false;
    }

    if (input.timeOfDay === "morning" && hero === "fireflies") {
      return false;
    }

    if (input.weather === "rain") {
      if (hero === "sunlight" || motionEnable.includes("sunlight")) {
        return false;
      }
    }

    if (input.weather === "rain" && change.wildlife === "hummingbird") {
      return false;
    }

    if (input.birthdayToday && change.cause === "vacation-countdown") {
      return false;
    }

    if (input.livingLifeContext?.flooded || input.livingLifeContext?.grief) {
      if (change.priority === "delight" || change.wildlife) {
        return false;
      }
    }

    return true;
  });
}

export function enforceMotionIntegrity(
  enabled: CompanionMotionKind[],
  input: LivingChangeEngineInput,
): CompanionMotionKind[] {
  const resolved = resolveEnvironmentalTruth({
    timeOfDay: input.timeOfDay,
    season: input.season,
    weather: input.weather,
    objects: input.objects,
    motion: enabled,
    recoveryGentle: input.recoveryGentle,
  });
  return resolved.motion;
}
