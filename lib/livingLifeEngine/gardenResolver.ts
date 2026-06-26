import type { LivingChangeItem, LivingChangeEngineInput } from "./types";

/**
 * Garden continuity — growth feels earned, never overnight.
 * Tied to visit rhythm and season, not arbitrary modulo schedules.
 */
export function resolveGardenChanges(
  input: LivingChangeEngineInput,
): LivingChangeItem[] {
  const changes: LivingChangeItem[] = [];

  if (input.season === "spring" && input.sessionVisitIndex >= 3) {
    changes.push({
      id: "garden-tulips-window",
      bucket: "environmental",
      priority: "season",
      sourceModule: "gardenResolver",
      cause: "spring-growth-earned",
      objects: [{ kind: "tulips", placement: "window" }],
      motion: { enable: ["foliage"] },
    });
  }

  if (input.season === "autumn") {
    changes.push({
      id: "garden-autumn-porch",
      bucket: "environmental",
      priority: "season",
      sourceModule: "gardenResolver",
      cause: "autumn-harvest",
      objects: [{ kind: "pumpkins", placement: "window" }],
      motion: { enable: ["curtains", "foliage"] },
    });
  }

  if (input.season === "summer" && input.sessionVisitIndex >= 8) {
    changes.push({
      id: "garden-summer-flowers",
      bucket: "environmental",
      priority: "season",
      sourceModule: "gardenResolver",
      cause: "summer-bloom-earned",
      objects: [{ kind: "flowers", placement: "table" }],
    });
  }

  if (
    input.season === "holiday" ||
    (input.season === "winter" && input.timeOfDay === "evening")
  ) {
    changes.push({
      id: "garden-winter-greenery",
      bucket: "environmental",
      priority: "season",
      sourceModule: "gardenResolver",
      cause: "winter-greenery",
      objects: [{ kind: "holiday-decor", placement: "window" }],
      motion: { enable: ["holiday-lights"] },
    });
  }

  return changes;
}
