import type { CompanionEnvironmentInput, RoomObject } from "./types";

/**
 * Layer 2 preparation objects from remembered hospitality — not room repainting.
 */
export function profilePreparationObjects(
  input: CompanionEnvironmentInput,
): RoomObject[] {
  const profile = input.hospitalityProfile;
  if (!profile) return [];

  const objects: RoomObject[] = [];

  if (profile.favoriteFlower) {
    objects.push({
      kind: "flowers",
      placement: "table",
      label: profile.favoriteFlower,
    });
  } else if (profile.lovesGardening) {
    objects.push({ kind: "tulips", placement: "window" });
  }

  if (profile.lovesGardening) {
    objects.push({
      kind: "book",
      placement: "shelf",
      label: "garden notes",
    });
  }

  if (profile.favoriteColor) {
    objects.push({
      kind: "notebook",
      placement: "table",
      label: profile.favoriteColor,
    });
  }

  if (
    profile.lovesTravel &&
    (input.vacationDaysAway == null || input.vacationDaysAway > 7)
  ) {
    objects.push({ kind: "travel-guide", placement: "table" });
  }

  if (input.projectRecentlyCompleted) {
    objects.push({ kind: "wrapped-journal", placement: "table" });
  }

  return objects;
}

export function mergeProfileObjects(
  base: RoomObject[],
  profileObjects: RoomObject[],
): RoomObject[] {
  const kinds = new Set(base.map((object) => object.kind));
  const merged = [...base];

  for (const object of profileObjects) {
    if (kinds.has(object.kind) && object.kind !== "book") continue;
    merged.push(object);
    kinds.add(object.kind);
  }

  return merged;
}
