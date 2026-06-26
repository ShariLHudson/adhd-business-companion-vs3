import type { CompanionMotionKind } from "@/lib/companionEnvironmentIntelligence/types";
import {
  CAUSE_FORBIDDEN_MOTION,
  CAUSE_NARRATIVE,
  CAUSE_REQUIRED_MOTION,
  MOTION_CAUSE_MAP,
} from "./causeEffectLibrary";
import {
  ENVIRONMENTAL_TRUTH_RULE,
  WARM_DRINK_KINDS,
  type EnvironmentalCause,
  type EnvironmentalCorrection,
  type EnvironmentalTruth,
  type EnvironmentalTruthInput,
} from "./types";

function seasonBase(season: EnvironmentalTruthInput["season"]) {
  return season === "holiday" ? ("winter" as const) : season;
}

function isDaytime(timeOfDay: EnvironmentalTruthInput["timeOfDay"]): boolean {
  return timeOfDay === "morning" || timeOfDay === "afternoon";
}

/**
 * Detect believable environmental causes from room state.
 * Causes are never random — they follow Iowa time, season, weather, and hospitality.
 */
export function resolveEnvironmentalCauses(
  input: EnvironmentalTruthInput,
): EnvironmentalCause[] {
  const causes = new Set<EnvironmentalCause>();
  const season = seasonBase(input.season);

  causes.add("indoor-warmth");

  const hasCoffee = input.objects.some((object) => object.kind === "coffee");
  const hasTea = input.objects.some((object) =>
    ["tea", "tea-set"].includes(object.kind),
  );
  if (hasCoffee) causes.add("fresh-coffee");
  if (hasTea) causes.add("fresh-tea");

  if (
    isDaytime(input.timeOfDay) &&
    (input.weather === "clear" || input.weather === "cloudy")
  ) {
    causes.add("morning-sun");
  }

  if (input.weather === "rain") {
    causes.add("rain-outside");
  }

  if (input.weather === "snow") {
    causes.add("snow-outside");
    causes.add("winter-iowa");
  }

  if (input.timeOfDay === "evening" || input.timeOfDay === "night") {
    causes.add("evening-indoors");
  }

  if (season === "summer" && input.weather === "clear") {
    causes.add("summer-iowa");
    if (isDaytime(input.timeOfDay)) {
      causes.add("window-open");
      causes.add("summer-breeze");
    }
    if (input.timeOfDay === "afternoon") {
      causes.add("butterflies-day");
    }
    if (input.timeOfDay === "evening") {
      causes.add("fireflies-evening");
    }
  }

  if (season === "winter") {
    causes.add("winter-iowa");
  }

  if (input.season === "holiday") {
    causes.add("holiday-season");
  }

  if (input.weather === "cloudy" || season === "autumn") {
    causes.add("wind-outside");
  }

  if (season === "spring" && input.weather === "rain") {
    causes.add("rain-outside");
    causes.add("wind-outside");
  }

  if (input.recoveryGentle) {
    causes.delete("butterflies-day");
    causes.delete("fireflies-evening");
  }

  return [...causes];
}

function motionAllowedByCauses(
  motion: CompanionMotionKind,
  causes: EnvironmentalCause[],
): boolean {
  const requiredCauses = MOTION_CAUSE_MAP[motion];
  if (!requiredCauses?.length) return false;
  return requiredCauses.some((cause) => causes.includes(cause));
}

function forbiddenByCauses(
  motion: CompanionMotionKind,
  causes: EnvironmentalCause[],
): string | null {
  for (const cause of causes) {
    const forbidden = CAUSE_FORBIDDEN_MOTION[cause];
    if (forbidden?.includes(motion)) {
      return CAUSE_NARRATIVE[cause];
    }
  }
  return null;
}

function narrativeForMotion(
  motion: CompanionMotionKind,
  causes: EnvironmentalCause[],
): string {
  const supporting = MOTION_CAUSE_MAP[motion].filter((cause) =>
    causes.includes(cause),
  );
  return supporting.map((cause) => CAUSE_NARRATIVE[cause])[0] ?? "";
}

/**
 * Environmental Truth™ — every motion must trace to a cause.
 */
export function resolveEnvironmentalTruth(
  input: EnvironmentalTruthInput,
): EnvironmentalTruth & { motion: CompanionMotionKind[] } {
  const causes = resolveEnvironmentalCauses(input);
  const corrections: EnvironmentalCorrection[] = [];
  const because = causes.map((cause) => CAUSE_NARRATIVE[cause]);
  const allowed = new Set<CompanionMotionKind>();

  for (const motion of input.motion) {
    const forbiddenReason = forbiddenByCauses(motion, causes);
    if (forbiddenReason) {
      corrections.push({
        field: "motion",
        removed: motion,
        reason: "contradicts active environmental causes",
        because: forbiddenReason,
      });
      continue;
    }

    if (motionAllowedByCauses(motion, causes)) {
      allowed.add(motion);
    } else {
      corrections.push({
        field: "motion",
        removed: motion,
        reason: ENVIRONMENTAL_TRUTH_RULE,
        because: `No believable cause for ${motion}`,
      });
    }
  }

  for (const cause of causes) {
    for (const motion of CAUSE_REQUIRED_MOTION[cause] ?? []) {
      if (forbiddenByCauses(motion, causes)) continue;
      if (!allowed.has(motion)) {
        allowed.add(motion);
        because.push(CAUSE_NARRATIVE[cause]);
      }
    }
  }

  if (
    input.objects.some((object) => WARM_DRINK_KINDS.includes(object.kind)) &&
    !allowed.has("steam")
  ) {
    allowed.add("steam");
  }

  return {
    causes,
    because: [...new Set(because)],
    coherencePassed: corrections.length === 0,
    corrections,
    motion: [...allowed],
  };
}

export function narrativeForEnabledMotion(
  motion: CompanionMotionKind[],
  causes: EnvironmentalCause[],
): string[] {
  return motion
    .map((kind) => narrativeForMotion(kind, causes))
    .filter((line) => line.length > 0);
}
