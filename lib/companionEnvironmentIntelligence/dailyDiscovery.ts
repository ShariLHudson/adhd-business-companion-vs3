import type {
  DailyDiscovery,
  WelcomeRoomPrototypeDiscovery,
} from "./types";

/** V1 estate hospitality ambience — not T-016 entrepreneurial Daily Discoveries. @see docs/DAILY_DISCOVERIES_FRAMEWORK.md */
type HolidayEntry = {
  month: number;
  day: number;
  label: string;
  object: DailyDiscovery["kind"];
};

const OBSERVANCES: HolidayEntry[] = [
  { month: 12, day: 4, label: "National Cookie Day", object: "holiday" },
  { month: 8, day: 9, label: "Book Lovers Day", object: "book-feature" },
  { month: 12, day: 15, label: "International Tea Day", object: "tea" },
  { month: 9, day: 29, label: "Coffee Day", object: "coffee" },
  { month: 3, day: 20, label: "First Day of Spring", object: "flower" },
  { month: 6, day: 1, label: "First Day of Summer", object: "flower" },
];

const PROTOTYPE_DISCOVERY: Record<
  Exclude<WelcomeRoomPrototypeDiscovery, "auto">,
  DailyDiscovery | null
> = {
  none: null,
  cookies: { kind: "holiday", label: "cookies waiting" },
  tea: { kind: "tea", label: "tea service" },
  quote: { kind: "quote", label: "quiet quote" },
  "project-complete": { kind: "project-complete", label: "project complete" },
  birthday: { kind: "birthday", label: "birthday" },
  vacation: { kind: "vacation", label: "vacation soon" },
};

export function resolveDailyDiscovery(
  now = new Date(),
  prototypeDiscovery: WelcomeRoomPrototypeDiscovery = "auto",
): DailyDiscovery | null {
  if (prototypeDiscovery !== "auto") {
    return PROTOTYPE_DISCOVERY[prototypeDiscovery];
  }

  const month = now.getMonth() + 1;
  const day = now.getDate();
  const match = OBSERVANCES.find((item) => item.month === month && item.day === day);
  if (match) {
    return { kind: match.object, label: match.label };
  }

  // Modulo rotation deprecated — Living Change Engine selects caused hospitality.
  return null;
}
