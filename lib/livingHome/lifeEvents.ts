import type { LivingHomeLifeEvent } from "./types";

function inRange(month: number, day: number, start: [number, number], end: [number, number]): boolean {
  const value = month * 100 + day;
  const startValue = start[0] * 100 + start[1];
  const endValue = end[0] * 100 + end[1];
  if (startValue <= endValue) {
    return value >= startValue && value <= endValue;
  }
  return value >= startValue || value <= endValue;
}

/**
 * Life Events layer — tasteful seasonal decorations, independent of season math.
 */
export function resolveLivingHomeLifeEvents(now = new Date()): LivingHomeLifeEvent[] {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const events: LivingHomeLifeEvent[] = [];

  if (inRange(month, day, [12, 1], [12, 31]) || inRange(month, day, [1, 1], [1, 5])) {
    events.push("christmas");
  }
  if (inRange(month, day, [10, 25], [11, 1])) {
    events.push("halloween");
  }
  if (inRange(month, day, [11, 20], [11, 28])) {
    events.push("thanksgiving");
  }
  if (inRange(month, day, [7, 1], [7, 7])) {
    events.push("fourth-of-july");
  }
  if (inRange(month, day, [2, 12], [2, 15])) {
    events.push("valentines");
  }

  return events;
}

export function primaryLivingHomeLifeEvent(
  events: readonly LivingHomeLifeEvent[],
): LivingHomeLifeEvent | null {
  const priority: LivingHomeLifeEvent[] = [
    "christmas",
    "halloween",
    "thanksgiving",
    "fourth-of-july",
    "valentines",
    "birthday",
    "anniversary",
    "one-year-together",
  ];
  for (const event of priority) {
    if (events.includes(event)) return event;
  }
  return null;
}
