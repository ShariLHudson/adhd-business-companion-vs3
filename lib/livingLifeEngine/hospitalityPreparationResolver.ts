import type { LivingChangeItem, LivingChangeEngineInput } from "./types";

function observanceForDay(now: Date): { id: string; object: "cookies" | "tea" | "coffee" | "flowers" } | null {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if (month === 12 && day === 4) {
    return { id: "national-cookie-day", object: "cookies" };
  }
  if (month === 12 && day === 15) {
    return { id: "international-tea-day", object: "tea" };
  }
  if (month === 9 && day === 29) {
    return { id: "coffee-day", object: "coffee" };
  }
  if (month === 3 && day === 20 || month === 6 && day === 1) {
    return { id: "seasonal-flowers", object: "flowers" };
  }
  return null;
}

/**
 * Hospitality preparation — caused by calendar, time, or guest rhythm.
 * Never modulo-random.
 */
export function resolveHospitalityPreparationChanges(
  input: LivingChangeEngineInput,
): LivingChangeItem[] {
  const now = input.now ?? new Date();
  const changes: LivingChangeItem[] = [];

  if (input.recoveryGentle || input.lowEnergy) {
    changes.push({
      id: "hospitality-blanket-folded",
      bucket: "hospitality_preparation",
      priority: "hospitality",
      sourceModule: "hospitalityPreparationResolver",
      cause: "recovery-gentle-day",
      objects: [{ kind: "blanket", placement: "floor" }],
      hospitality: { showBlanket: true, warmLamp: true },
    });
    return changes;
  }

  const observance = observanceForDay(now);
  if (observance) {
    const object =
      observance.object === "cookies"
        ? { kind: "cookies" as const, placement: "table" as const }
        : observance.object === "tea"
          ? { kind: "tea-set" as const, placement: "table" as const }
          : observance.object === "coffee"
            ? { kind: "coffee" as const, placement: "table" as const }
            : { kind: "flowers" as const, placement: "table" as const };
    changes.push({
      id: `hospitality-${observance.id}`,
      bucket: "hospitality_preparation",
      priority: "hospitality",
      sourceModule: "hospitalityPreparationResolver",
      cause: observance.id,
      objects: [object],
      hospitality:
        observance.object === "coffee" || observance.object === "tea"
          ? { showMugSteam: true }
          : undefined,
    });
  }

  if (
    (input.timeOfDay === "morning" || input.homesteadPeriod === "morning" || input.homesteadPeriod === "dawn") &&
    !observance
  ) {
    changes.push({
      id: "hospitality-morning-coffee",
      bucket: "hospitality_preparation",
      priority: "hospitality",
      sourceModule: "hospitalityPreparationResolver",
      cause: "morning-ritual",
      objects: [{ kind: "coffee", placement: "table" }],
      hospitality: { showMugSteam: true },
    });
  }

  if (
    input.timeOfDay === "evening" ||
    input.timeOfDay === "night" ||
    input.homesteadPeriod === "evening" ||
    input.homesteadPeriod === "golden-hour" ||
    input.homesteadPeriod === "night"
  ) {
    changes.push({
      id: "hospitality-evening-lamp",
      bucket: "hospitality_preparation",
      priority: "time",
      sourceModule: "hospitalityPreparationResolver",
      cause: "evening-arrived",
      hospitality: { warmLamp: true },
      motion: { enable: ["lamplight"] },
    });
    if (
      input.homesteadPeriod === "evening" ||
      input.homesteadPeriod === "golden-hour" ||
      input.homesteadPeriod === "night" ||
      input.timeOfDay === "evening" ||
      input.timeOfDay === "night"
    ) {
      changes.push({
        id: "hospitality-evening-tea",
        bucket: "hospitality_preparation",
        priority: "hospitality",
        sourceModule: "hospitalityPreparationResolver",
        cause: "evening-tea-ritual",
        objects: [{ kind: "tea-set", placement: "table" }],
        hospitality: { showMugSteam: true },
      });
    }
  }

  if (input.projectRecentlyCompleted) {
    changes.push({
      id: "hospitality-project-complete",
      bucket: "hospitality_preparation",
      priority: "relationship",
      sourceModule: "hospitalityPreparationResolver",
      cause: "project-recently-completed",
      objects: [{ kind: "wrapped-journal", placement: "table" }],
    });
  }

  if (input.vacationDaysAway != null && input.vacationDaysAway <= 14) {
    changes.push({
      id: "hospitality-vacation-soon",
      bucket: "hospitality_preparation",
      priority: "relationship",
      sourceModule: "hospitalityPreparationResolver",
      cause: "vacation-countdown",
      objects: [
        { kind: "suitcase", placement: "floor" },
        { kind: "travel-guide", placement: "table" },
      ],
    });
  }

  return changes;
}
