import type { RoomObject } from "./types";

const MAX_FOREGROUND_OBJECTS = 5;
const MIN_MEANINGFUL_OBJECTS = 1;

const PRIORITY: Record<string, number> = {
  cake: 100,
  balloons: 95,
  "wrapped-journal": 90,
  suitcase: 88,
  "travel-guide": 86,
  cookies: 84,
  "tea-set": 82,
  tea: 80,
  coffee: 78,
  tulips: 76,
  flowers: 74,
  pumpkins: 72,
  cider: 70,
  blanket: 68,
  postcard: 66,
  gift: 64,
  "holiday-decor": 62,
  book: 40,
  notebook: 38,
  journal: 36,
  fruit: 34,
  keepsake: 20,
};

/**
 * Constraint on Accumulation — hospitality, not clutter.
 */
export function applyObjectLimits(objects: RoomObject[]): RoomObject[] {
  if (objects.length <= MAX_FOREGROUND_OBJECTS) {
    return objects;
  }

  const ranked = [...objects].sort(
    (a, b) => (PRIORITY[b.kind] ?? 0) - (PRIORITY[a.kind] ?? 0),
  );

  const books = ranked.filter((o) => o.kind === "book");
  const others = ranked.filter((o) => o.kind !== "book");
  const keptOthers = others.slice(0, MAX_FOREGROUND_OBJECTS - 1);
  const kept = [...keptOthers, ...books.slice(0, 1)];

  return kept.length >= MIN_MEANINGFUL_OBJECTS
    ? kept
    : objects.slice(0, MAX_FOREGROUND_OBJECTS);
}
