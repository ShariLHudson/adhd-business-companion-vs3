// Founder Ecosystem — Phase 6 operational mock scenarios.
// Multi-project workload, an urgent/overdue deadline, conflicting priorities,
// a stalled project. Built off the Phase 4 history so the engines have rich
// signals. Deterministic (relative to `now`). Placeholder data only.

import type { FounderEvent } from "../../events";
import { sampleFounderHistory } from "../../intelligence/fixtures/founderHistory";

function at(now: Date, daysAgo: number, hour: number): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}
const inDays = (now: Date, n: number) => {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString();
};

// Base history + extra projects, an overdue task, and a stalled project.
export function operationalScenario(
  founderId = "founder-001",
  nowDate: Date = new Date(),
): FounderEvent[] {
  const base = sampleFounderHistory(founderId, nowDate);
  let n = base.length;
  const id = () => `op${++n}`;
  const f = founderId;
  const extra: FounderEvent[] = [
    // A second active project with recent activity (conflicting priority).
    {
      id: id(),
      founderId: f,
      type: "project.created",
      ts: at(nowDate, 20, 9),
      refs: { projectId: "proj-course" },
      data: { title: "Launch Course" },
    },
    {
      id: id(),
      founderId: f,
      type: "task.completed",
      ts: at(nowDate, 2, 10),
      refs: { taskId: "course-1", projectId: "proj-course" },
    },
    // An OVERDUE task (due date in the past) — urgent deadline.
    {
      id: id(),
      founderId: f,
      type: "task.created",
      ts: at(nowDate, 6, 11),
      refs: { taskId: "client-deliverable", projectId: "proj-app" },
      data: {
        title: "Send client deliverable",
        dueDate: at(nowDate, 2, 17), // 2 days ago → overdue
      },
    },
    // A stalled project: created, then no activity for ~18 days.
    {
      id: id(),
      founderId: f,
      type: "project.created",
      ts: at(nowDate, 30, 9),
      refs: { projectId: "proj-newsletter" },
      data: { title: "Weekly Newsletter" },
    },
    // A future-scheduled block for the course (so it's not flagged unscheduled).
    {
      id: id(),
      founderId: f,
      type: "timeblock.created",
      ts: at(nowDate, 1, 9),
      refs: {
        timeBlockId: "tb-course",
        projectId: "proj-course",
        workspace: "time-block",
      },
      data: { durationMin: 90, title: "Course module", scheduledFor: inDays(nowDate, 1) },
    },
  ];
  return [...base, ...extra];
}
