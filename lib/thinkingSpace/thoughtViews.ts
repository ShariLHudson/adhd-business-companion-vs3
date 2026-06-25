/**
 * My Thoughts™ — View vs Filter.
 *
 * View = how I want to see my thoughts (time window or sort order).
 * Filter = which thoughts I want to include (pinned, archived, etc.).
 */

import type { BrainDumpEntry } from "@/lib/companionStore";
import { getThoughtCollectionSuggestion } from "./thoughtCollectionAuthority";

/** Time windows — limit which thoughts appear, sorted newest first. */
export type ThoughtTimeViewMode =
  | "today"
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "older";

/** Sort / organization — all matching thoughts, different ordering. */
export type ThoughtOrgViewMode =
  | "recently-added"
  | "recently-updated"
  | "alpha"
  | "oldest";

export type ThoughtViewMode = ThoughtTimeViewMode | ThoughtOrgViewMode;

export type ThoughtFilterId =
  | "all"
  | "pinned"
  | "has-reminder"
  | "has-project"
  | "has-person"
  | "needs-review"
  | "completed"
  | "archived"
  | "waiting";

export type ThoughtViewOption = { id: ThoughtViewMode; label: string };

export type ThoughtViewGroup = {
  label: string;
  options: ThoughtViewOption[];
};

export const THOUGHT_VIEW_GROUPS: ReadonlyArray<ThoughtViewGroup> = [
  {
    label: "Time",
    options: [
      { id: "today", label: "Today" },
      { id: "this-week", label: "This Week" },
      { id: "last-week", label: "Last Week" },
      { id: "this-month", label: "This Month" },
      { id: "last-month", label: "Last Month" },
      { id: "older", label: "Older" },
    ],
  },
  {
    label: "Organization",
    options: [
      { id: "recently-added", label: "Recently Added" },
      { id: "recently-updated", label: "Recently Updated" },
      { id: "alpha", label: "Alphabetical (A–Z)" },
      { id: "oldest", label: "Oldest First" },
    ],
  },
];

/** Flat list for tests and simple consumers. */
export const THOUGHT_VIEW_OPTIONS: ReadonlyArray<ThoughtViewOption> =
  THOUGHT_VIEW_GROUPS.flatMap((g) => g.options);

export const THOUGHT_FILTER_OPTIONS: ReadonlyArray<{
  id: ThoughtFilterId;
  label: string;
}> = [
  { id: "all", label: "All thoughts" },
  { id: "pinned", label: "Pinned" },
  { id: "has-reminder", label: "Has reminder" },
  { id: "has-project", label: "Connected to project" },
  { id: "has-person", label: "Connected to person" },
  { id: "needs-review", label: "Needs review" },
  { id: "waiting", label: "Waiting" },
  { id: "completed", label: "Completed" },
  { id: "archived", label: "Archived" },
];

const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const TIME_VIEW_MODES = new Set<ThoughtViewMode>([
  "today",
  "this-week",
  "last-week",
  "this-month",
  "last-month",
  "older",
]);

export function isTimeViewMode(mode: ThoughtViewMode): boolean {
  return TIME_VIEW_MODES.has(mode);
}

export function thoughtNeedsReview(entry: BrainDumpEntry): boolean {
  return Boolean(getThoughtCollectionSuggestion(entry));
}

export function thoughtNeedsAttention(entry: BrainDumpEntry): boolean {
  if (entry.pinned) return true;
  if (thoughtNeedsReview(entry)) return true;
  if (entry.reminderAt) {
    const due = new Date(entry.reminderAt).getTime();
    if (due <= Date.now() + WEEK_MS) return true;
  }
  const age = Date.now() - new Date(entry.createdAt).getTime();
  if (age >= TWO_MONTHS_MS) return true;
  return false;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
  const day = startOfDay(d);
  return new Date(day.getTime() - day.getDay() * DAY_MS);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, months: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

/** Whether a thought falls in a time-based view window (by created date). */
export function thoughtMatchesTimeView(
  entry: BrainDumpEntry,
  mode: ThoughtTimeViewMode,
  now = new Date(),
): boolean {
  const created = new Date(entry.createdAt).getTime();
  const todayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now).getTime();
  const lastWeekStart = weekStart - 7 * DAY_MS;
  const monthStart = startOfMonth(now).getTime();
  const lastMonthStart = startOfMonth(addMonths(now, -1)).getTime();

  switch (mode) {
    case "today":
      return created >= todayStart;
    case "this-week":
      return created >= weekStart;
    case "last-week":
      return created >= lastWeekStart && created < weekStart;
    case "this-month":
      return created >= monthStart;
    case "last-month":
      return created >= lastMonthStart && created < monthStart;
    case "older":
      return created < lastMonthStart;
    default:
      return true;
  }
}

function sortByCreatedDesc(a: BrainDumpEntry, b: BrainDumpEntry): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function updatedAt(entry: BrainDumpEntry): number {
  return new Date(entry.updatedAt ?? entry.createdAt).getTime();
}

/** View — time window and/or sort order. Does not apply status filters. */
export function applyThoughtView(
  thoughts: BrainDumpEntry[],
  mode: ThoughtViewMode,
): BrainDumpEntry[] {
  let list = isTimeViewMode(mode)
    ? thoughts.filter((t) =>
        thoughtMatchesTimeView(t, mode as ThoughtTimeViewMode),
      )
    : [...thoughts];

  switch (mode) {
    case "alpha":
      return list.sort((a, b) => a.text.localeCompare(b.text));
    case "oldest":
      return list.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case "recently-updated":
      return list.sort((a, b) => updatedAt(b) - updatedAt(a));
    case "recently-added":
    case "today":
    case "this-week":
    case "last-week":
    case "this-month":
    case "last-month":
    case "older":
    default:
      return list.sort(sortByCreatedDesc);
  }
}

/** Filter — which thoughts to include. Combines with view after collection scope. */
export function applyThoughtFilter(
  thoughts: BrainDumpEntry[],
  filter: ThoughtFilterId,
): BrainDumpEntry[] {
  if (filter === "all") return thoughts;
  if (filter === "pinned") return thoughts.filter((t) => t.pinned);
  if (filter === "has-reminder") return thoughts.filter((t) => t.reminderAt);
  if (filter === "has-project") return thoughts.filter((t) => t.projectId);
  if (filter === "has-person")
    return thoughts.filter((t) => t.connectedPerson?.trim());
  if (filter === "needs-review") return thoughts.filter(thoughtNeedsReview);
  if (filter === "waiting") return thoughts.filter(thoughtIsWaiting);
  if (filter === "completed") return thoughts.filter((t) => t.done);
  if (filter === "archived") return thoughts.filter((t) => t.archived);
  return thoughts;
}

export type TimeBucketId = "today" | "yesterday" | "this-week" | "earlier";

export const TIME_BUCKET_LABELS: Record<TimeBucketId, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "this-week": "This Week",
  earlier: "Earlier",
};

export function timeBucketFor(entry: BrainDumpEntry): TimeBucketId {
  const created = new Date(entry.createdAt);
  const now = new Date();
  const today = startOfDay(now).getTime();
  const createdDay = startOfDay(created).getTime();
  const diffDays = Math.floor((today - createdDay) / DAY_MS);

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays <= 7) return "this-week";
  return "earlier";
}

export function groupThoughtsByTimeBucket(
  thoughts: BrainDumpEntry[],
): Array<{ id: TimeBucketId; label: string; thoughts: BrainDumpEntry[] }> {
  const order: TimeBucketId[] = [
    "today",
    "yesterday",
    "this-week",
    "earlier",
  ];
  const buckets = new Map<TimeBucketId, BrainDumpEntry[]>();
  for (const t of thoughts) {
    const b = timeBucketFor(t);
    const list = buckets.get(b) ?? [];
    list.push(t);
    buckets.set(b, list);
  }
  return order
    .filter((id) => (buckets.get(id)?.length ?? 0) > 0)
    .map((id) => ({
      id,
      label: TIME_BUCKET_LABELS[id],
      thoughts: buckets.get(id)!,
    }));
}

export function thoughtIsWaiting(entry: BrainDumpEntry): boolean {
  if (entry.pinned || thoughtNeedsReview(entry)) return false;
  if (entry.reminderAt) {
    const due = new Date(entry.reminderAt).getTime();
    if (due > Date.now() + WEEK_MS) return true;
  }
  if (entry.schedulingIntent === "later" || entry.schedulingIntent === "week") {
    return true;
  }
  const age = Date.now() - new Date(entry.createdAt).getTime();
  return age < TWO_MONTHS_MS;
}

export function thoughtIsSomeday(entry: BrainDumpEntry): boolean {
  if (thoughtNeedsAttention(entry) || thoughtIsWaiting(entry)) return false;
  return true;
}

export type StatusBucketId = "needs-attention" | "waiting" | "someday";

export const STATUS_BUCKET_LABELS: Record<StatusBucketId, string> = {
  "needs-attention": "Needs Attention",
  waiting: "Waiting",
  someday: "Someday",
};

export function statusBucketFor(entry: BrainDumpEntry): StatusBucketId {
  if (thoughtNeedsAttention(entry)) return "needs-attention";
  if (thoughtIsWaiting(entry)) return "waiting";
  return "someday";
}

export function groupThoughtsByStatusBucket(
  thoughts: BrainDumpEntry[],
): Array<{ id: StatusBucketId; label: string; thoughts: BrainDumpEntry[] }> {
  const order: StatusBucketId[] = ["needs-attention", "waiting", "someday"];
  const buckets = new Map<StatusBucketId, BrainDumpEntry[]>();
  for (const t of thoughts) {
    const b = statusBucketFor(t);
    const list = buckets.get(b) ?? [];
    list.push(t);
    buckets.set(b, list);
  }
  return order
    .filter((id) => (buckets.get(id)?.length ?? 0) > 0)
    .map((id) => ({
      id,
      label: STATUS_BUCKET_LABELS[id],
      thoughts: buckets.get(id)!,
    }));
}

/** Use progressive sections when a collection is large. */
export const PROGRESSIVE_DISCLOSURE_THRESHOLD = 8;
