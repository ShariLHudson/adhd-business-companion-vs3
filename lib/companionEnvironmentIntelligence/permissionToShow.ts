import type {
  CompanionEnvironmentInput,
  RoomObject,
  RoomPermissionContext,
} from "./types";

const DEFAULT_PERMISSIONS: RoomPermissionContext = {
  birthdayEntered: false,
  vacationCountdownCreated: false,
  teaCoffeePreferenceKnown: false,
  granted: {},
};

/**
 * Permission to Show™ — earned intimacy only.
 * Part of The Hospitality Principle™: Shari prepares what she knows —
 * never rebuilds the home around the visitor.
 * If unsure, do not show it.
 */
export function applyPermissionToShow(
  objects: RoomObject[],
  input: CompanionEnvironmentInput,
): RoomObject[] {
  const context = input.permissions ?? DEFAULT_PERMISSIONS;

  return objects.filter((object) => {
    switch (object.kind) {
      case "keepsake":
        return context.granted["family-photos"] === true;
      case "cake":
      case "balloons":
      case "flowers":
        if (input.birthdayToday) {
          return context.birthdayEntered === true;
        }
        return true;
      case "suitcase":
      case "travel-guide":
        if (input.vacationDaysAway != null) {
          return context.vacationCountdownCreated === true;
        }
        return false;
      default:
        return true;
    }
  });
}

export function defaultRoomPermissionContext(input: {
  birthdayToday?: boolean;
  vacationDaysAway?: number | null;
}): RoomPermissionContext {
  return {
    birthdayEntered: input.birthdayToday === true,
    vacationCountdownCreated:
      input.vacationDaysAway != null && input.vacationDaysAway <= 14,
    teaCoffeePreferenceKnown: true,
    granted: {},
  };
}
