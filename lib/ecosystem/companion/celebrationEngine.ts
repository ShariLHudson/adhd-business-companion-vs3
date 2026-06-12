// Founder Ecosystem — Phase 13 Celebration Engine.
// Notices wins worth naming: streaks of progress, finished projects/documents,
// focus consistency, and milestones. Warm and specific, never hollow praise.
// Pure.

import type { FounderEvent, ID } from "../events";
import type { Celebration } from "./companionTypes";

const DAY = 86_400_000;

let seq = 0;
const cid = () => `celebrate:${++seq}`;
const dayKey = (ts: string) => ts.slice(0, 10);

export type CelebrationOptions = { now?: Date; windowDays?: number; limit?: number };

export function generateCelebrations(
  events: FounderEvent[],
  founderId: ID,
  opts: CelebrationOptions = {},
): Celebration[] {
  seq = 0;
  const now = opts.now ?? new Date();
  const windowDays = opts.windowDays ?? 7;
  const since = now.getTime() - windowDays * DAY;
  const mine = events
    .filter((e) => e.founderId === founderId && new Date(e.ts).getTime() > since)
    .sort((a, b) => (a.ts < b.ts ? -1 : 1));

  const out: Celebration[] = [];

  // Focus sessions this week.
  const focus = mine.filter((e) => e.type === "focus.completed");
  if (focus.length >= 2)
    out.push({
      id: cid(),
      kind: "focus",
      message: `You completed ${focus.length} focus sessions this week. That's real, repeatable momentum.`,
      ts: focus[focus.length - 1].ts,
    });

  // Finished projects / documents.
  for (const e of mine.filter((e) => e.type === "project.completed"))
    out.push({
      id: cid(),
      kind: "completion",
      message: `You finished a project — ${(e.data?.title as string) ?? "nicely done"}. Worth a pause to notice.`,
      ts: e.ts,
    });
  const exported = mine.filter((e) => e.type === "document.exported");
  if (exported.length)
    out.push({
      id: cid(),
      kind: "completion",
      message: `You shipped ${exported.length === 1 ? "a document" : `${exported.length} documents`} this week.`,
      ts: exported[exported.length - 1].ts,
    });

  // Streak — distinct days a given project moved forward.
  const projDays = new Map<ID, Set<string>>();
  for (const e of mine) {
    if (
      (e.type === "task.completed" || e.type === "focus.completed" || e.type === "document.created") &&
      e.refs?.projectId
    ) {
      const set = projDays.get(e.refs.projectId) ?? new Set<string>();
      set.add(dayKey(e.ts));
      projDays.set(e.refs.projectId, set);
    }
  }
  for (const [pid, days] of projDays) {
    if (days.size >= 3) {
      const label =
        (mine.find((e) => e.type === "project.created" && e.refs?.projectId === pid)?.data
          ?.title as string) ?? "a project";
      out.push({
        id: cid(),
        kind: "streak",
        message: `You moved ${label} forward ${days.size} days this week — consistency is the win here.`,
        ts: null,
      });
    }
  }

  // Tasks milestone.
  const tasks = mine.filter((e) => e.type === "task.completed").length;
  if (tasks >= 5)
    out.push({
      id: cid(),
      kind: "milestone",
      message: `${tasks} tasks done this week. Those small finishes add up.`,
      ts: null,
    });

  return out.slice(0, opts.limit ?? 5);
}

export function hasCelebrations(events: FounderEvent[], founderId: ID, opts?: CelebrationOptions): boolean {
  return generateCelebrations(events, founderId, opts).length > 0;
}
