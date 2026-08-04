import type { SavedGrowthWin } from "./growthWinsStore";

export type GrowthWinDateGroupId =
  | "today"
  | "this-week"
  | "last-week"
  | "this-month"
  | "older";

export const GROWTH_WIN_DATE_GROUP_ORDER: GrowthWinDateGroupId[] = [
  "today",
  "this-week",
  "last-week",
  "this-month",
  "older",
];

export const GROWTH_WIN_DATE_GROUP_LABEL: Record<GrowthWinDateGroupId, string> = {
  today: "Today",
  "this-week": "This Week",
  "last-week": "Last Week",
  "this-month": "This Month",
  older: "Older",
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfDay(monday);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function growthWinDateGroup(ts: number, now = Date.now()): GrowthWinDateGroupId {
  const date = new Date(ts);
  const today = startOfDay(new Date(now));
  const winDay = startOfDay(date);

  if (winDay.getTime() === today.getTime()) return "today";

  const thisWeekStart = startOfWeek(new Date(now));
  if (winDay >= thisWeekStart) return "this-week";

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  if (winDay >= lastWeekStart) return "last-week";

  const thisMonthStart = startOfMonth(new Date(now));
  if (winDay >= thisMonthStart) return "this-month";

  return "older";
}

export function groupSavedWinsByDate(
  wins: SavedGrowthWin[],
  now = Date.now(),
): { id: GrowthWinDateGroupId; label: string; wins: SavedGrowthWin[] }[] {
  const buckets = Object.fromEntries(
    GROWTH_WIN_DATE_GROUP_ORDER.map((id) => [id, [] as SavedGrowthWin[]]),
  ) as Record<GrowthWinDateGroupId, SavedGrowthWin[]>;

  for (const win of wins) {
    buckets[growthWinDateGroup(win.ts, now)].push(win);
  }

  for (const id of GROWTH_WIN_DATE_GROUP_ORDER) {
    buckets[id].sort((a, b) => b.ts - a.ts);
  }

  return GROWTH_WIN_DATE_GROUP_ORDER.filter((id) => buckets[id].length > 0).map(
    (id) => ({
      id,
      label: GROWTH_WIN_DATE_GROUP_LABEL[id],
      wins: buckets[id],
    }),
  );
}
