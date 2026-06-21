/**
 * Growth Archive — time-range filters for all Growth sections.
 */

export type GrowthArchivePeriod =
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "all";

export const GROWTH_ARCHIVE_PERIODS: { id: GrowthArchivePeriod; label: string }[] =
  [
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "quarter", label: "This Quarter" },
    { id: "year", label: "This Year" },
    { id: "all", label: "All Time" },
  ];

export const GROWTH_EXPORT_REPORTS = [
  { id: "weekly", label: "Weekly Growth Report", ready: false },
  { id: "monthly", label: "Monthly Growth Report", ready: false },
  { id: "annual", label: "Annual Growth Report", ready: false },
] as const;

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

export function isInGrowthArchivePeriod(
  iso: string,
  period: GrowthArchivePeriod,
  now = new Date(),
): boolean {
  if (period === "all") return true;
  const t = new Date(iso).getTime();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "week") {
    const start = startOfWeekMonday(now);
    return t >= start.getTime() && t <= end.getTime();
  }

  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return t >= start.getTime() && t <= end.getTime();
  }

  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    return t >= start.getTime() && t <= end.getTime();
  }

  const start = new Date(now.getFullYear(), 0, 1);
  return t >= start.getTime() && t <= end.getTime();
}
