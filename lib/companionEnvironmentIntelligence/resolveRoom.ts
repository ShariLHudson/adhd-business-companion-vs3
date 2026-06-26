import { featuredBookForDay } from "./bookLibrary";
import { resolveDailyDiscovery } from "./dailyDiscovery";
import {
  mergeProfileObjects,
  profilePreparationObjects,
} from "./profilePreparationObjects";
import { applyObjectLimits } from "./objectLimits";
import { applyPermissionToShow } from "./permissionToShow";
import type { GuestPreparation } from "@/lib/companionHospitalityProfile";
import type {
  CompanionEnvironmentInput,
  CompanionMotionProfile,
  RoomObject,
  WelcomeWeather,
} from "./types";

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function seasonObjects(
  input: CompanionEnvironmentInput,
  weather: WelcomeWeather,
): RoomObject[] {
  const objects: RoomObject[] = [];
  const season =
    input.season === "holiday" ? ("winter" as const) : input.season;

  switch (season) {
    case "spring":
      objects.push({ kind: "tulips", placement: "window" });
      if (weather === "rain" || weather === "cloudy") {
        objects.push({ kind: "tea-set", placement: "table" });
      }
      break;
    case "summer":
      if (input.timeOfDay === "morning" || input.timeOfDay === "afternoon") {
        objects.push({ kind: "coffee", placement: "table" });
      }
      break;
    case "autumn":
      objects.push({ kind: "pumpkins", placement: "window" });
      objects.push({ kind: "cider", placement: "table" });
      objects.push({ kind: "blanket", placement: "floor" });
      break;
    case "winter":
      objects.push({ kind: "tea-set", placement: "table" });
      if (input.timeOfDay === "evening" || input.timeOfDay === "night") {
        objects.push({ kind: "blanket", placement: "floor" });
      }
      break;
  }

  if (input.season === "holiday") {
    objects.push({ kind: "holiday-decor", placement: "window" });
  }

  return objects;
}

function discoveryObjects(
  discovery: ReturnType<typeof resolveDailyDiscovery>,
): RoomObject[] {
  if (!discovery) return [];

  switch (discovery.kind) {
    case "holiday":
      if (discovery.label.toLowerCase().includes("cookie")) {
        return [{ kind: "cookies", placement: "table" }];
      }
      return [];
    case "tea":
      return [{ kind: "tea-set", placement: "table" }];
    case "coffee":
      return [{ kind: "coffee", placement: "table" }];
    case "flower":
      return [{ kind: "flowers", placement: "table" }];
    case "quote":
      return [{ kind: "postcard", placement: "table", label: "a thought" }];
    case "project-complete":
      return [{ kind: "wrapped-journal", placement: "table" }];
    case "vacation":
      return [
        { kind: "suitcase", placement: "floor" },
        { kind: "travel-guide", placement: "table" },
      ];
    case "birthday":
      return [
        { kind: "cake", placement: "table" },
        { kind: "flowers", placement: "table" },
        { kind: "balloons", placement: "window" },
      ];
    case "encouragement":
      return [{ kind: "postcard", placement: "table", label: "you're enough" }];
    case "book-feature":
      return [];
    default:
      return [];
  }
}

function applyGuestDrinkToObjects(
  objects: RoomObject[],
  preparation: GuestPreparation,
): RoomObject[] {
  const withoutDrinks = objects.filter(
    (object) => !["coffee", "tea", "tea-set"].includes(object.kind),
  );
  const next: RoomObject[] = [
    { kind: preparation.objectKind, placement: "table" },
    ...withoutDrinks,
  ];
  if (
    preparation.blanket &&
    !next.some((object) => object.kind === "blanket")
  ) {
    next.push({ kind: "blanket", placement: "floor" });
  }
  return next;
}

function hospitalityObjects(
  input: CompanionEnvironmentInput,
  guestPreparation: GuestPreparation | null,
): RoomObject[] {
  const now = input.now ?? new Date();
  const seed = dayKey(now);
  const prototypeDiscovery = input.prototypeDiscovery ?? "auto";
  const discovery = resolveDailyDiscovery(now, prototypeDiscovery);
  const book = featuredBookForDay(`${seed}:book`, now);
  const objects: RoomObject[] = [{ kind: "book", placement: "shelf", label: book.title }];

  if (input.birthdayToday && prototypeDiscovery === "auto") {
    objects.push(
      { kind: "cake", placement: "table" },
      { kind: "flowers", placement: "table" },
      { kind: "balloons", placement: "window" },
    );
    return applyObjectLimits(applyPermissionToShow(objects, input));
  }

  if (input.celebrationActive) {
    objects.push({ kind: "gift", placement: "table" });
    return applyObjectLimits(applyPermissionToShow(objects, input));
  }

  if (
    input.vacationDaysAway != null &&
    input.vacationDaysAway <= 7 &&
    prototypeDiscovery === "auto"
  ) {
    objects.push(
      { kind: "suitcase", placement: "floor" },
      { kind: "travel-guide", placement: "table" },
    );
    return applyObjectLimits(applyPermissionToShow(objects, input));
  }

  if (input.recoveryGentle || input.lowEnergy) {
    const base = applyObjectLimits(applyPermissionToShow(objects, input));
    return guestPreparation
      ? applyObjectLimits(applyPermissionToShow(
          applyGuestDrinkToObjects(base, guestPreparation),
          input,
        ))
      : base;
  }

  objects.push(...seasonObjects(input, input.weather ?? "clear"));
  objects.push(...discoveryObjects(discovery));

  const prepared = guestPreparation
    ? applyGuestDrinkToObjects(objects, guestPreparation)
    : objects;

  const withProfile = mergeProfileObjects(
    prepared,
    profilePreparationObjects(input),
  );

  return applyObjectLimits(applyPermissionToShow(withProfile, input));
}

export function resolveRoomObjects(
  input: CompanionEnvironmentInput,
  guestPreparation: GuestPreparation | null = null,
): RoomObject[] {
  return hospitalityObjects(input, guestPreparation);
}

export function resolveMotionProfile(
  input: CompanionEnvironmentInput,
  objects: RoomObject[],
  guestPreparation: GuestPreparation | null = null,
): CompanionMotionProfile {
  const weather = input.weather ?? "clear";
  const season =
    input.season === "holiday" ? ("winter" as const) : input.season;
  const enabled: CompanionMotionProfile["enabled"] = [
    "candle",
    "sunlight",
    "foliage",
  ];

  if (guestPreparation?.brightMorning && !enabled.includes("sunlight")) {
    enabled.push("sunlight");
  }

  const hasWarmDrink = objects.some((o) =>
    ["coffee", "tea", "tea-set", "cider"].includes(o.kind),
  );
  if (hasWarmDrink) {
    enabled.push("steam");
  }

  if (input.timeOfDay === "evening" || input.timeOfDay === "night") {
    enabled.push("lamplight");
  }

  if (weather === "rain" || season === "spring") {
    enabled.push("rain");
  }

  if (weather === "snow" || season === "winter") {
    enabled.push("snow");
  }

  if (season === "summer" && input.timeOfDay === "evening") {
    enabled.push("fireflies");
  }

  if (season === "summer" && input.timeOfDay === "afternoon") {
    enabled.push("butterflies");
  }

  if (input.season === "holiday") {
    enabled.push("holiday-lights");
  }

  if (input.hospitalityProfile?.prefersQuiet) {
    const calm = new Set<CompanionMotionProfile["enabled"][number]>([
      "candle",
      "lamplight",
      "curtains",
    ]);
    return { enabled: enabled.filter((kind) => calm.has(kind)) };
  }

  if (season === "autumn") {
    enabled.push("curtains");
  }

  if (weather === "cloudy") {
    enabled.push("curtains");
  }

  return { enabled: [...new Set(enabled)] };
}
