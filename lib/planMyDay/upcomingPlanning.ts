/**
 * Upcoming planning — forward-looking buckets (not another Today board).
 */

import { getTimeBlocks, todayStr } from "@/lib/companionStore";
import {
  dateStrFromOffset,
  readDatedDeferredPlanItems,
} from "@/lib/planMyDay/planDayItems";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import { listMemberRhythms, type MemberRhythm } from "@/lib/rhythms";
import type { UnifiedPlanningEvent } from "@/lib/connectedCalendars";

export type UpcomingBucketId =
  | "tomorrow"
  | "this-week"
  | "next-week"
  | "later"
  | "rhythms"
  | "appointments";

export type UpcomingBucket = {
  id: UpcomingBucketId;
  label: string;
  planItems: PlanDayItem[];
  events: UnifiedPlanningEvent[];
  rhythms: MemberRhythm[];
};

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function gatherUpcomingPlanning(): UpcomingBucket[] {
  const today = todayStr();
  const tomorrow = dateStrFromOffset(1);
  const weekEnd = dateStrFromOffset(7);
  const nextWeekEnd = dateStrFromOffset(14);

  const dated = readDatedDeferredPlanItems();
  const tomorrowItems: PlanDayItem[] = [];
  const thisWeekItems: PlanDayItem[] = [];
  const nextWeekItems: PlanDayItem[] = [];
  const laterItems: PlanDayItem[] = [];

  for (const { date, items } of dated) {
    if (!isIsoDate(date)) continue;
    if (date === tomorrow) tomorrowItems.push(...items);
    else if (date > today && date <= weekEnd) thisWeekItems.push(...items);
    else if (date > weekEnd && date <= nextWeekEnd) nextWeekItems.push(...items);
    else if (date > nextWeekEnd) laterItems.push(...items);
  }

  const blocks = getTimeBlocks().filter(
    (b) => b.date && b.date > today && b.status !== "completed",
  );
  const appointments: UnifiedPlanningEvent[] = blocks.map((b) => ({
    id: `tb-${b.id}`,
    title: b.title,
    date: b.date,
    startTime: b.startTime,
    source: "spark-appointment" as const,
  }));

  const rhythms = listMemberRhythms().slice(0, 12);

  const buckets: UpcomingBucket[] = [
    {
      id: "tomorrow",
      label: "Tomorrow",
      planItems: tomorrowItems,
      events: appointments.filter((e) => e.date === tomorrow),
      rhythms: [],
    },
    {
      id: "this-week",
      label: "This Week",
      planItems: thisWeekItems,
      events: appointments.filter(
        (e) => e.date && e.date > tomorrow && e.date <= weekEnd,
      ),
      rhythms: [],
    },
    {
      id: "next-week",
      label: "Next Week",
      planItems: nextWeekItems,
      events: appointments.filter(
        (e) => e.date && e.date > weekEnd && e.date <= nextWeekEnd,
      ),
      rhythms: [],
    },
    {
      id: "later",
      label: "Further ahead",
      planItems: laterItems,
      events: appointments.filter((e) => e.date && e.date > nextWeekEnd),
      rhythms: [],
    },
    {
      id: "rhythms",
      label: "Rhythm reminders",
      planItems: [],
      events: [],
      rhythms,
    },
    {
      id: "appointments",
      label: "Upcoming appointments",
      planItems: [],
      events: appointments,
      rhythms: [],
    },
  ];

  return buckets.filter(
    (b) =>
      b.planItems.length > 0 ||
      b.events.length > 0 ||
      b.rhythms.length > 0 ||
      b.id === "tomorrow",
  );
}
